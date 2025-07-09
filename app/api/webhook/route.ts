import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { fulfillOrder } from '@/lib/order-fulfillment'
import { simpleFulfillOrder } from '@/lib/simple-fulfillment'
import { resend } from '@/lib/resend'
import { createClient } from '@supabase/supabase-js'

// Client Supabase spécial pour le webhook avec timeout réduit
function createWebhookSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000) // 10 second timeout for webhook only
          });
        }
      }
    }
  )
}

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
    const supabase = createWebhookSupabaseClient()

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
        original_s3_key: metadata.original_s3_key,
        preview_s3_url: metadata.preview_s3_url
      }

      orderItems.push(orderItem)
    }

    if (orderItems.length === 0) {
      throw new Error('No valid order items found')
    }

    // Fulfill the order by sending download links with retry logic
    const customerName = session.customer_details?.name || undefined

    // Try to insert order items in database, but don't fail if it doesn't work
    try {
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (orderItemsError) {
        console.error('⚠️ Failed to create order items in database:', orderItemsError.message)
        console.log('🔄 Proceeding with simple fulfillment instead')
        
        // Skip database operations and go directly to simple fulfillment
        await trySimpleFulfillment(order.id, customerEmail, customerName, orderItems, sessionId, totalAmount || 0)
        return
      }
      
      console.log('✅ Created', orderItems.length, 'order items for order:', order.id)
    } catch (dbError) {
      console.error('⚠️ Database connection failed:', dbError)
      console.log('🔄 Proceeding with simple fulfillment instead')
      
      // Skip database operations and go directly to simple fulfillment
      await trySimpleFulfillment(order.id, customerEmail, customerName, orderItems, sessionId, totalAmount || 0)
      return
    }
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
            // Final attempt failed, try simple fulfillment
            console.error('❌ All fulfillment attempts failed, trying simple fulfillment for order:', order.id)
            await trySimpleFulfillment(order.id, customerEmail, customerName, orderItems, sessionId, totalAmount || 0)
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }
      } catch (fulfillmentError) {
        console.error(`❌ Order fulfillment error (attempt ${attempt}):`, fulfillmentError)
        if (attempt === 3) {
          console.error('❌ All fulfillment attempts failed, trying simple fulfillment for order:', order.id)
          await trySimpleFulfillment(order.id, customerEmail, customerName, orderItems, sessionId, totalAmount || 0)
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

async function trySimpleFulfillment(
  orderId: string, 
  customerEmail: string, 
  customerName: string | undefined, 
  orderItems: any[],
  sessionId: string,
  totalAmount: number
) {
  try {
    console.log('🔄 Attempting simple fulfillment for order:', orderId)
    
    // Récupérer les photos directement via les métadonnées Stripe
    const digitalItems = orderItems.filter(item => item.product_type === 'digital')
    
    if (digitalItems.length === 0) {
      console.log('No digital items to fulfill')
      return
    }
    
    // Utiliser les données des orderItems qui contiennent déjà les métadonnées
    const photos = digitalItems.map(item => ({
      id: item.photo_id,
      original_s3_key: item.original_s3_key || `${item.photo_id}.jpg`,
      preview_s3_url: item.preview_s3_url || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/web-previews/${item.photo_id}.jpg`
    }))
    
    const result = await simpleFulfillOrder({
      orderId,
      customerEmail,
      customerName,
      totalAmount: totalAmount || 0, // Use the actual paid amount from Stripe
      photos
    })
    
    if (result.success) {
      console.log('✅ Simple fulfillment successful for order:', orderId)
    } else {
      console.error('❌ Simple fulfillment also failed:', result.message)
      await sendFallbackEmail(customerEmail, customerName, orderId)
    }
    
  } catch (error) {
    console.error('❌ Simple fulfillment error:', error)
    await sendFallbackEmail(customerEmail, customerName, orderId)
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