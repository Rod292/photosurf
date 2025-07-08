import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { fulfillOrder } from '@/lib/order-fulfillment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('❌ No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('✅ Received Stripe webhook event:', event.type, 'ID:', event.id)

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('💳 Processing completed checkout session:', session.id)
      
      await handleCheckoutSessionCompleted(session)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseAdminClient()

  try {
    // Extract order information from the session
    const customerEmail = session.customer_details?.email || session.customer_email
    const totalAmount = session.amount_total // Amount in cents
    const sessionId = session.id

    if (!customerEmail) {
      throw new Error('No customer email found in session')
    }

    console.log('📝 Creating order for:', customerEmail, 'Amount:', totalAmount)

    // Retrieve line items from the session to get photo IDs and product types
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
      expand: ['data.price.product']
    })

    if (!lineItems.data || lineItems.data.length === 0) {
      throw new Error('No line items found in checkout session')
    }

    // Extract shipping address if available
    const shippingAddress = session.shipping_details?.address ? {
      line1: session.shipping_details.address.line1,
      line2: session.shipping_details.address.line2,
      city: session.shipping_details.address.city,
      postal_code: session.shipping_details.address.postal_code,
      country: session.shipping_details.address.country,
    } : null;

    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        stripe_checkout_id: sessionId,
        status: 'completed',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    console.log('✅ Order created with ID:', order.id)

    // Process each line item and create order_items
    const orderItems = []
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product
      const metadata = product.metadata

      if (!metadata?.photo_id || !metadata?.product_type) {
        console.warn('⚠️ Line item missing required metadata:', item.price?.id)
        continue
      }

      const orderItem = {
        order_id: order.id,
        photo_id: metadata.photo_id,
        product_type: metadata.product_type as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2',
        price: item.price?.unit_amount || 0, // Price in cents
        delivery_option: metadata.delivery_option || null,
        delivery_price: metadata.delivery_price ? parseInt(metadata.delivery_price) : null,
      }

      orderItems.push(orderItem)
    }

    if (orderItems.length === 0) {
      throw new Error('No valid order items found')
    }

    // Insert order items
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (orderItemsError) {
      throw new Error(`Failed to create order items: ${orderItemsError.message}`)
    }

    console.log('✅ Created', orderItems.length, 'order items for order:', order.id)

    // Fulfill the order by sending download links
    const customerName = session.customer_details?.name || undefined
    const fulfillmentResult = await fulfillOrder({
      orderId: order.id,
      customerEmail,
      customerName,
      totalAmount: totalAmount || 0
    })

    if (fulfillmentResult.success) {
      console.log('✅ Order fulfilled successfully:', order.id)
    } else {
      console.error('❌ Order fulfillment failed:', fulfillmentResult.message)
      // Don't throw - we still want to acknowledge the webhook
    }

  } catch (error) {
    console.error('❌ Error processing checkout session:', error)
    
    // Log the error but don't throw - we want to return 200 to Stripe
    // to acknowledge receipt of the webhook, even if our processing failed
    console.error('❌ Full session data:', JSON.stringify(session, null, 2))
  }
}

