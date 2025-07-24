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
      console.error('❌ ZIP not found in storage:', listError)
      return NextResponse.json(
        { error: 'ZIP file not found. It may still be generating or has expired.' },
        { status: 404 }
      )
    }
    
    // Prendre le ZIP le plus récent pour cet ordre
    const zipFile = files
      .filter(file => file.name.startsWith(`order-${orderId}-`))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    
    if (!zipFile) {
      console.error('❌ No ZIP file found for order:', orderId)
      return NextResponse.json(
        { error: 'ZIP file not found for this order' },
        { status: 404 }
      )
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