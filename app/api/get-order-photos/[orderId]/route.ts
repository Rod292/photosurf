import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    console.log('🔍 Getting photos for order:', orderId)

    const supabase = createSupabaseAdminClient()
    
    // Récupérer les détails de la commande
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, photo_id, product_type, price')
      .eq('order_id', orderId)
      .eq('product_type', 'digital')

    if (orderItemsError || !orderItems || orderItems.length === 0) {
      console.log('❌ Order items not found, trying Stripe fallback:', orderItemsError)
      
      // Fallback: récupérer le stripe_checkout_id de l'ordre
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('stripe_checkout_id')
        .eq('id', orderId)
        .single()
      
      if (orderError || !orderData?.stripe_checkout_id) {
        console.error('❌ Order not found or no stripe_checkout_id:', orderError)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      
      console.log('✅ Found stripe_checkout_id:', orderData.stripe_checkout_id)
      
      // Récupérer depuis Stripe
      try {
        const targetSession = await stripe.checkout.sessions.retrieve(orderData.stripe_checkout_id)
        console.log('✅ Found Stripe session:', targetSession.id)
        
        // Récupérer les line items de cette session
        let allLineItems: Stripe.LineItem[] = []
        let hasMore = true
        let startingAfter: string | undefined = undefined
        
        while (hasMore) {
          const lineItemsPage: Stripe.ApiList<Stripe.LineItem> = await stripe.checkout.sessions.listLineItems(targetSession.id, {
            expand: ['data.price.product'],
            limit: 100,
            starting_after: startingAfter
          })
          
          allLineItems = allLineItems.concat(lineItemsPage.data)
          hasMore = lineItemsPage.has_more
          
          if (hasMore && lineItemsPage.data.length > 0) {
            startingAfter = lineItemsPage.data[lineItemsPage.data.length - 1].id
          }
        }
        
        // Extraire les photos digitales
        const digitalPhotos = []
        for (const item of allLineItems) {
          const product = item.price?.product as Stripe.Product
          const metadata = product.metadata
          
          if (metadata?.product_type === 'digital' && metadata?.photo_id) {
            digitalPhotos.push({
              id: metadata.photo_id,
              original_s3_key: metadata.original_s3_key || `${metadata.photo_id}.jpg`,
              filename: metadata.filename || `photo-${metadata.photo_id}.jpg`
            })
          }
        }
        
        console.log(`✅ Found ${digitalPhotos.length} digital photos in Stripe session`)
        
        return NextResponse.json({
          success: true,
          photos: digitalPhotos,
          source: 'stripe'
        })
        
      } catch (stripeError) {
        console.error('❌ Error retrieving from Stripe:', stripeError)
        return NextResponse.json(
          { error: 'Order not found in Stripe' },
          { status: 404 }
        )
      }
    }

    console.log(`📋 Found ${orderItems.length} digital photos in order`)

    // Récupérer les photos correspondantes
    const digitalPhotoIds = orderItems.map(item => item.photo_id)
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, original_s3_key, filename, gallery_id')
      .in('id', digitalPhotoIds)

    if (photosError || !photos || photos.length === 0) {
      console.error('❌ Photos not found:', photosError)
      return NextResponse.json(
        { error: 'Photos not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Found ${photos.length} photos in database`)

    return NextResponse.json({
      success: true,
      photos: photos,
      source: 'database'
    })

  } catch (error) {
    console.error('❌ Get order photos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}