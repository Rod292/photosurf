import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    console.log('🔄 Processing ZIP download v2 for token:', token)

    // Décoder le token pour récupérer l'order ID
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

    const supabase = createSupabaseAdminClient()
    
    // Chercher le ZIP dans le storage
    const { data: files, error: listError } = await supabase.storage
      .from('temp-zips')
      .list('', {
        limit: 100,
        search: `order-${orderId}`
      })
    
    if (listError || !files || files.length === 0) {
      console.error('❌ ZIP not found in storage, generating on-demand:', listError)
      
      // Fallback: générer le ZIP à la demande
      return await generateZipOnDemand(orderId, supabase)
    }
    
    // Prendre le ZIP le plus récent pour cet ordre
    const zipFile = files
      .filter(file => file.name.startsWith(`order-${orderId}-`))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    
    if (!zipFile) {
      console.error('❌ No ZIP file found for order, generating on-demand:', orderId)
      
      // Fallback: générer le ZIP à la demande
      return await generateZipOnDemand(orderId, supabase)
    }
    
    console.log('✅ Found ZIP file:', zipFile.name)
    
    // Télécharger le ZIP depuis Supabase Storage
    const { data: zipData, error: downloadError } = await supabase.storage
      .from('temp-zips')
      .download(zipFile.name)
    
    if (downloadError || !zipData) {
      console.error('❌ Failed to download ZIP:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download ZIP file' },
        { status: 500 }
      )
    }
    
    console.log('✅ ZIP downloaded successfully, size:', zipData.size)
    
    // Convertir en buffer pour la réponse
    const zipBuffer = await zipData.arrayBuffer()
    
    // Retourner le ZIP avec les bons headers
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ArodestudioPhotos_Commande_${orderId}.zip"`,
        'Content-Length': zipBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ ZIP download v2 error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fonction fallback pour générer le ZIP à la demande
async function generateZipOnDemand(orderId: string, supabase: any): Promise<NextResponse> {
  try {
    console.log('🔄 Generating ZIP on-demand for order:', orderId)
    
    // Importer JSZip dynamiquement
    const JSZip = (await import('jszip')).default
    const Stripe = (await import('stripe')).default
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    })
    
    // Récupérer les données de la commande
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, photo_id, product_type, price')
      .eq('order_id', orderId)
      .eq('product_type', 'digital')

    let photos = []
    
    if (orderItemsError || !orderItems || orderItems.length === 0) {
      console.log('❌ Order items not found, using Stripe fallback')
      
      // Fallback Stripe
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('stripe_checkout_id')
        .eq('id', orderId)
        .single()
      
      if (orderError || !orderData?.stripe_checkout_id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      
      // Récupérer depuis Stripe
      const stripeSession = await stripe.checkout.sessions.retrieve(orderData.stripe_checkout_id)
      const lineItems = await stripe.checkout.sessions.listLineItems(stripeSession.id, {
        expand: ['data.price.product'],
        limit: 100
      })
      
      photos = lineItems.data
        .filter(item => {
          const product = item.price?.product as any
          return product.metadata?.product_type === 'digital'
        })
        .map(item => {
          const product = item.price?.product as any  
          const metadata = product.metadata
          return {
            id: metadata.photo_id,
            original_s3_key: metadata.original_s3_key || `${metadata.photo_id}.jpg`,
            filename: metadata.filename || `photo-${metadata.photo_id}.jpg`
          }
        })
    } else {
      // Récupérer les photos depuis la DB
      const digitalPhotoIds = orderItems.map((item: any) => item.photo_id)
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('id, original_s3_key, filename, gallery_id')
        .in('id', digitalPhotoIds)

      if (photosError || !photosData) {
        return NextResponse.json({ error: 'Photos not found' }, { status: 404 })
      }
      
      photos = photosData
    }

    if (photos.length === 0) {
      return NextResponse.json({ error: 'No photos found for this order' }, { status: 404 })
    }

    console.log(`📦 Generating ZIP on-demand with ${photos.length} photos`)
    
    // Créer le ZIP
    const zip = new JSZip()
    
    // Traiter toutes les photos par batch de 10 en parallèle pour optimiser les grandes commandes
    const BATCH_SIZE = 10
    console.log(`📦 Processing ${photos.length} photos in batches of ${BATCH_SIZE}`)
    
    for (let i = 0; i < photos.length; i += BATCH_SIZE) {
      const batch = photos.slice(i, Math.min(i + BATCH_SIZE, photos.length))
      
      await Promise.all(batch.map(async (photo: any, batchIndex: number) => {
        const photoIndex = i + batchIndex
        
        try {
          const urlCandidates = [
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`,
          ]

          let response: Response | null = null
          
          for (const url of urlCandidates) {
            try {
              response = await fetch(url, { signal: AbortSignal.timeout(1000) }) // 1s par photo pour aller plus vite
              if (response.ok) break
            } catch (error) {
              continue
            }
          }
          
          if (!response || !response.ok) {
            console.error(`❌ Failed to download photo ${photoIndex + 1}`)
            return
          }

          const photoBuffer = await response.arrayBuffer()
          const filename = `Photo_${String(photoIndex + 1).padStart(2, '0')}_${photo.filename || photo.id}.jpg`
          
          zip.file(filename, photoBuffer)
          console.log(`✅ Added photo ${photoIndex + 1}/${photos.length} to on-demand ZIP`)
          
        } catch (error) {
          console.error(`❌ Error processing photo ${photoIndex + 1}:`, error)
        }
      }))
    }

    // Générer le ZIP
    console.log('🔄 Generating on-demand ZIP buffer...')
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'STORE',
      compressionOptions: { level: 0 }
    })
    
    console.log('✅ On-demand ZIP generated successfully')
    
    // Retourner le ZIP directement
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ArodestudioPhotos_Commande_${orderId}.zip"`,
        'Content-Length': zipBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('❌ On-demand ZIP generation failed:', error)
    return NextResponse.json({ 
      error: 'Failed to generate ZIP. Please try again in a few minutes.' 
    }, { status: 500 })
  }
}