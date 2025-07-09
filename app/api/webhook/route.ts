import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { fulfillOrder } from '@/lib/order-fulfillment'
import { resend } from '@/lib/resend'

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
  try {
    const supabase = createSupabaseAdminClient()

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

    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        stripe_checkout_id: sessionId,
        status: 'completed',
        total_amount: totalAmount,
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
        product_type: metadata.product_type as 'digital' | 'print',
        price: item.price?.unit_amount || 0, // Price in cents
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

    // Fulfill the order by sending download links with retry logic
    const customerName = session.customer_details?.name || undefined
    let fulfillmentResult
    
    // Retry fulfillment up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Attempting order fulfillment (${attempt}/3):`, order.id)
        
        fulfillmentResult = await fulfillOrder({
          orderId: order.id,
          customerEmail,
          customerName,
          totalAmount: totalAmount || 0
        })
        
        if (fulfillmentResult.success) {
          console.log('✅ Order fulfilled successfully:', order.id)
          break
        } else {
          console.error(`❌ Order fulfillment failed (attempt ${attempt}):`, fulfillmentResult.message)
          if (attempt === 3) {
            // Final attempt failed, send fallback email
            console.error('❌ All fulfillment attempts failed for order:', order.id)
            await sendFallbackEmail(customerEmail, customerName, order.id)
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }
      } catch (fulfillmentError) {
        console.error(`❌ Order fulfillment error (attempt ${attempt}):`, fulfillmentError)
        if (attempt === 3) {
          console.error('❌ All fulfillment attempts failed for order:', order.id)
          await sendFallbackEmail(customerEmail, customerName, order.id)
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

  } catch (error) {
    console.error('❌ Error processing checkout session:', error)
    
    // Log the error but don't throw - we want to return 200 to Stripe
    // to acknowledge receipt of the webhook, even if our processing failed
    console.error('❌ Full session data:', JSON.stringify(session, null, 2))
  }
}

async function sendFallbackEmail(customerEmail: string, customerName: string | undefined, orderId: string) {
  try {
    console.log('📧 Sending fallback email for order:', orderId)
    
    await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: customerEmail,
      subject: '✅ Commande confirmée - Arode Studio',
      text: `Bonjour ${customerName || ''},

Votre commande a été confirmée avec succès !

Numéro de commande : ${orderId}

Nous rencontrons actuellement un problème technique pour l'envoi automatique de vos photos. 
Nous vous enverrons vos liens de téléchargement manuellement dans les prochaines heures.

Merci pour votre patience et votre compréhension.

L'équipe Arode Studio
📧 contact@arodestudio.com
📱 Instagram: @arode.studio`
    })
    
    // Send internal notification
    await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: 'contact@arodestudio.com',
      subject: '🚨 Commande nécessite traitement manuel',
      text: `Commande nécessitant un traitement manuel :

Commande ID: ${orderId}
Email client: ${customerEmail}
Nom: ${customerName || 'Non renseigné'}

Le système automatique a échoué. Veuillez traiter cette commande manuellement.`
    })
    
    console.log('✅ Fallback email sent for order:', orderId)
  } catch (error) {
    console.error('❌ Failed to send fallback email:', error)
  }
} 