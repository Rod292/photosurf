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
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json()
    const { items, customerEmail, successUrl, cancelUrl } = body

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

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      lineItems,
      customerEmail,
      successUrl,
      cancelUrl
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