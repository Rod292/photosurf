import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import JSZip from 'jszip'
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    console.log('🔄 Processing ZIP download request for token:', token)

    // Vérifier le token et récupérer les données de la commande
    const supabase = createSupabaseAdminClient()
    
    // Le token est généré comme : base64(orderId:expiresAt:hash)
    let orderId: string
    let expiresAt: number
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [orderIdPart, expiresAtPart] = decoded.split(':')
      orderId = orderIdPart
      expiresAt = parseInt(expiresAtPart)
      
      if (!orderId || !expiresAt || isNaN(expiresAt)) {
        throw new Error('Invalid token format')
      }
    } catch (error) {
      console.error('❌ Invalid token format:', error)
      return NextResponse.json(
        { error: 'Invalid download token' },
        { status: 400 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (Date.now() > expiresAt) {
      console.error('❌ Token expired for order:', orderId)
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      )
    }

    // Récupérer les détails de la commande - méthode en 2 étapes comme dans order-fulfillment.ts
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, photo_id, product_type, price')
      .eq('order_id', orderId)
      .eq('product_type', 'digital')

    if (orderItemsError || !orderItems || orderItems.length === 0) {
      console.error('❌ Order not found in database, trying Stripe fallback:', orderItemsError)
      
      // Fallback: essayer de récupérer les données depuis Stripe
      const stripeOrderData = await getOrderFromStripe(orderId)
      if (stripeOrderData) {
        console.log('✅ Found order data in Stripe, using fallback method')
        return await createZipFromStripeData(stripeOrderData)
      }
      
      return NextResponse.json(
        { error: 'Order not found or no photos available' },
        { status: 404 }
      )
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
        { error: 'Order not found or no photos available' },
        { status: 404 }
      )
    }

    console.log(`📦 Creating ZIP for ${orderItems.length} photos`)

    // Créer le ZIP
    const zip = new JSZip()
    
    // Télécharger et ajouter chaque photo au ZIP
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      if (!photo || !photo.original_s3_key) {
        console.warn(`⚠️ Skipping photo ${i + 1}: missing data`)
        continue
      }

      try {
        // Try multiple URL patterns for better compatibility
        const urlCandidates = [
          // Current format: gallery-based path
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
          // Legacy format: UUID only
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`,
          // Alternative legacy format
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpeg`,
        ];

        let response: Response | null = null;
        let workingUrl = '';
        
        console.log(`📥 Downloading photo ${i + 1}/${photos.length}: ${photo.original_s3_key}`)
        
        // Try each URL pattern until one works
        for (const url of urlCandidates) {
          try {
            response = await fetch(url);
            if (response.ok) {
              workingUrl = url;
              console.log(`✅ Found working URL for photo ${i + 1}: ${url}`);
              break;
            }
          } catch (urlError) {
            console.log(`❌ URL failed for photo ${i + 1}: ${url}`);
          }
        }
        
        if (!response || !response.ok) {
          console.error(`❌ Failed to download photo ${i + 1}: No working URL found`);
          continue;
        }

        // Ajouter au ZIP avec un nom propre
        const photoBuffer = await response.arrayBuffer()
        const filename = photo.filename || `photo-${photo.id}.jpg`
        const cleanFilename = `Photo_${String(i + 1).padStart(2, '0')}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        zip.file(cleanFilename, photoBuffer)
        console.log(`✅ Added to ZIP: ${cleanFilename}`)
        
      } catch (error) {
        console.error(`❌ Error processing photo ${i + 1}:`, error)
        continue
      }
    }

    // Générer le ZIP
    console.log('🔄 Generating ZIP file...')
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    console.log('✅ ZIP generated successfully')

    // Retourner le ZIP avec les bons headers
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ArodestudioPhotos_Commande_${orderId}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ ZIP download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fonction de fallback pour récupérer les données de commande depuis Stripe
async function getOrderFromStripe(orderId: string) {
  try {
    console.log('🔍 Searching Stripe for order:', orderId)
    
    // Chercher les sessions Stripe qui correspondent à cet orderId
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
    })
    
    // Trouver la session qui correspond à notre orderId (probablement dans les metadata)
    let targetSession = null
    for (const session of sessions.data) {
      if (session.id === orderId || session.metadata?.order_id === orderId) {
        targetSession = session
        break
      }
    }
    
    if (!targetSession) {
      console.log('❌ No Stripe session found for order:', orderId)
      return null
    }
    
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
    
    return {
      orderId,
      photos: digitalPhotos
    }
    
  } catch (error) {
    console.error('❌ Error getting order from Stripe:', error)
    return null
  }
}

// Fonction pour créer un ZIP depuis les données Stripe
async function createZipFromStripeData(orderData: any) {
  try {
    console.log(`📦 Creating ZIP from Stripe data for ${orderData.photos.length} photos`)
    
    const zip = new JSZip()
    
    // Télécharger et ajouter chaque photo au ZIP
    for (let i = 0; i < orderData.photos.length; i++) {
      const photo = orderData.photos[i]
      
      try {
        // Try multiple URL patterns for Stripe fallback too
        const urlCandidates = [
          // Current format: gallery-based path
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
          // Legacy format: UUID only  
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`,
          // Alternative legacy format
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpeg`,
        ];

        let response: Response | null = null;
        
        console.log(`📥 Downloading photo ${i + 1}/${orderData.photos.length}: ${photo.original_s3_key}`)
        
        // Try each URL pattern until one works
        for (const url of urlCandidates) {
          try {
            response = await fetch(url);
            if (response.ok) {
              console.log(`✅ Found working URL for Stripe photo ${i + 1}: ${url}`);
              break;
            }
          } catch (urlError) {
            console.log(`❌ URL failed for Stripe photo ${i + 1}: ${url}`);
          }
        }
        
        if (!response || !response.ok) {
          console.error(`❌ Failed to download photo ${i + 1}: No working URL found in Stripe fallback`);
          continue;
        }

        const photoBuffer = await response.arrayBuffer()
        const cleanFilename = `Photo_${String(i + 1).padStart(2, '0')}_${photo.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        zip.file(cleanFilename, photoBuffer)
        console.log(`✅ Added to ZIP: ${cleanFilename}`)
        
      } catch (error) {
        console.error(`❌ Error processing photo ${i + 1}:`, error)
        continue
      }
    }

    // Générer le ZIP
    console.log('🔄 Generating ZIP file from Stripe data...')
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    console.log('✅ ZIP generated successfully from Stripe data')

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ArodestudioPhotos_Commande_${orderData.orderId}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating ZIP from Stripe data:', error)
    return NextResponse.json(
      { error: 'Failed to create ZIP from Stripe data' },
      { status: 500 }
    )
  }
}