import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, ProductType } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

interface CheckoutItem {
  photoId: string
  productType: ProductType
  quantity?: number
}

interface CreateCheckoutRequest {
  items: CheckoutItem[]
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
  promoCode?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json()
    const { items, customerEmail, successUrl, cancelUrl, promoCode } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Validate that all photos exist in the database
    const supabase = createSupabaseAdminClient()
    const photoIds = items.map(item => item.photoId)
    
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, filename, gallery_id, galleries!inner(name)')
      .in('id', photoIds)

    if (error) {
      console.error('Error fetching photos:', error)
      return NextResponse.json(
        { error: 'Failed to validate photos' },
        { status: 500 }
      )
    }

    if (photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: 'One or more photos not found' },
        { status: 404 }
      )
    }

    // Create line items with photo names
    const lineItems = items.map(item => {
      const photo = photos.find(p => p.id === item.photoId)
      if (!photo) {
        throw new Error(`Photo not found: ${item.photoId}`)
      }

      return {
        photoId: item.photoId,
        productType: item.productType,
        photoName: photo.filename || `Photo de ${(photo as any).galleries?.name || 'surf'}`,
        quantity: item.quantity || 1,
      }
    })

    // Validate promo code if provided
    let promoValidation = null
    if (promoCode) {
      // Calculate total amount for promo validation
      const totalAmount = lineItems.reduce((sum, item) => {
        const prices = { digital: 15, print: 25, bundle: 35 }
        return sum + (prices[item.productType] * item.quantity)
      }, 0)

      const promoResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, totalAmount })
      })

      if (promoResponse.ok) {
        promoValidation = await promoResponse.json()
      }
    }

    // If promo code makes the order free, create a free order directly
    if (promoValidation?.isFree) {
      // Create order in database with "completed" status for free orders
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: customerEmail || 'demo@arodestudio.com',
          stripe_checkout_id: `free_${Date.now()}`,
          status: 'completed',
          total_amount: 0,
          payment_status: 'paid',
          promo_code: promoCode,
          discount_amount: promoValidation.discountAmount
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating free order:', orderError)
        throw new Error('Failed to create free order')
      }

      // Create order items
      const orderItems = lineItems.map(item => ({
        order_id: order.id,
        photo_id: item.photoId,
        product_type: item.productType,
        price: 0,
        quantity: item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating free order items:', itemsError)
        throw new Error('Failed to create free order items')
      }

      // Return success URL for free orders
      return NextResponse.json({
        sessionId: `free_${order.id}`,
        url: `${successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/success`}?session_id=free_${order.id}&free_order=true`,
        isFree: true,
        orderId: order.id
      })
    }

    // Create Stripe checkout session for paid orders
    const session = await createCheckoutSession(
      lineItems,
      customerEmail,
      successUrl,
      cancelUrl,
      promoValidation
    )

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email || session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency,
      }
    })

  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}