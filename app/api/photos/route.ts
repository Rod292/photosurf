import { NextResponse, NextRequest } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('gallery_id')
    
    if (!galleryId) {
      return NextResponse.json(
        { error: 'gallery_id parameter is required' },
        { status: 400 }
      )
    }
    
    const supabase = createSupabaseAdminClient()
    
    // Récupérer les photos de la galerie
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Erreur lors de la récupération des photos:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des photos' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Erreur dans l\'API photos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

