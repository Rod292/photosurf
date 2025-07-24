import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import JSZip from 'jszip'
import { headers } from 'next/headers'

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

    // Récupérer les détails de la commande et les photos
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        *,
        photos (
          id,
          original_s3_key,
          filename,
          gallery_id
        )
      `)
      .eq('order_id', orderId)
      .eq('product_type', 'digital')

    if (orderError || !orderItems || orderItems.length === 0) {
      console.error('❌ Order not found or no digital photos:', orderError)
      return NextResponse.json(
        { error: 'Order not found or no photos available' },
        { status: 404 }
      )
    }

    console.log(`📦 Creating ZIP for ${orderItems.length} photos`)

    // Créer le ZIP
    const zip = new JSZip()
    
    // Télécharger et ajouter chaque photo au ZIP
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i]
      const photo = item.photos
      
      if (!photo || !photo.original_s3_key) {
        console.warn(`⚠️ Skipping photo ${i + 1}: missing data`)
        continue
      }

      try {
        // Construire l'URL de téléchargement de l'original
        const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`
        
        console.log(`📥 Downloading photo ${i + 1}/${orderItems.length}: ${photo.original_s3_key}`)
        
        // Télécharger la photo
        const response = await fetch(originalUrl)
        if (!response.ok) {
          console.error(`❌ Failed to download photo ${i + 1}: HTTP ${response.status}`)
          continue
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