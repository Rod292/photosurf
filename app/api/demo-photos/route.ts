import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateDownloadUrl, generateBulkDownloadUrls } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')
    const galleryId = searchParams.get('galleryId')
    const photoIds = searchParams.get('photoIds') // Pour les requêtes bulk

    // Si on demande une photo spécifique
    if (photoId) {
      const { data: photo, error: photoError } = await supabase
        .from('photos')
        .select('id, original_s3_key, filename')
        .eq('id', photoId)
        .single()

      if (photoError || !photo) {
        return NextResponse.json({ error: 'Photo non trouvée' }, { status: 404 })
      }

      // Générer l'URL signée pour le bucket originals
      const { downloadUrl, expiresAt } = await generateDownloadUrl({
        originalS3Key: photo.original_s3_key,
        expiresIn: 2 * 60 * 60 // 2 heures pour demo
      })

      return NextResponse.json({
        photoId: photo.id,
        filename: photo.filename,
        demoUrl: downloadUrl,
        expiresAt
      })
    }

    // Si on demande plusieurs photos (bulk)
    if (photoIds) {
      const photoIdArray = photoIds.split(',')
      
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, original_s3_key, filename')
        .in('id', photoIdArray)

      if (photosError || !photos) {
        return NextResponse.json({ error: 'Photos non trouvées' }, { status: 404 })
      }

      // Générer les URLs signées en bulk
      const downloadUrls = await generateBulkDownloadUrls(photos, 2 * 60 * 60)
      
      return NextResponse.json({
        photos: downloadUrls.map(url => ({
          photoId: url.photoId,
          demoUrl: url.downloadUrl,
          expiresAt: url.expiresAt
        }))
      })
    }

    // Si on demande toutes les photos d'une galerie
    if (galleryId) {
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, original_s3_key, filename, preview_s3_url')
        .eq('gallery_id', galleryId)
        .order('created_at', { ascending: false })

      if (photosError || !photos) {
        return NextResponse.json({ error: 'Photos non trouvées' }, { status: 404 })
      }

      // Générer les URLs signées pour toutes les photos
      const downloadUrls = await generateBulkDownloadUrls(photos, 2 * 60 * 60)
      
      return NextResponse.json({
        galleryId,
        photos: downloadUrls.map((url, index) => ({
          photoId: url.photoId,
          filename: photos[index].filename,
          previewUrl: photos[index].preview_s3_url, // Pour fallback
          demoUrl: url.downloadUrl,
          expiresAt: url.expiresAt
        }))
      })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  } catch (error) {
    console.error('Erreur API demo-photos:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { photos } = body // Array of { id, original_s3_key }

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }

    // Générer les URLs signées pour toutes les photos
    const downloadUrls = await generateBulkDownloadUrls(photos, 2 * 60 * 60)
    
    return NextResponse.json({
      success: true,
      photos: downloadUrls
    })

  } catch (error) {
    console.error('Erreur API demo-photos POST:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    )
  }
}