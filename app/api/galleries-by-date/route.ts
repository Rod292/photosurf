import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variables d\'environnement Supabase manquantes')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Récupérer les galeries avec les photos - approche simplifiée
    const { data: galleries, error } = await supabase
      .from('galleries')
      .select(`
        id,
        name,
        date,
        photos!gallery_id (
          id,
          preview_s3_url
        )
      `)
      .order('date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Erreur Supabase dans galleries-by-date:', error)
      // Return empty array to prevent total failure
      return NextResponse.json({ 
        galleryGroups: [], 
        error: error.message 
      })
    }

    // Grouper par date
    const galleryGroups = galleries.reduce((acc: any, gallery: any) => {
      const date = gallery.date.split('T')[0] // Extraire juste la date (YYYY-MM-DD)
      
      if (!acc[date]) {
        acc[date] = []
      }
      
      acc[date].push({
        id: gallery.id,
        name: gallery.name,
        session_period: gallery.session_period || null,
        photoCount: gallery.photos?.length || 0,
        coverPhoto: gallery.photos?.[0]?.preview_s3_url || null
      })
      
      return acc
    }, {})

    // Convertir en tableau et trier par date décroissante
    const sortedGroups = Object.entries(galleryGroups)
      .map(([date, galleries]) => ({
        date,
        galleries
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10) // Limiter à 10 groupes de dates

    console.log(`galleries-by-date: ${sortedGroups.length} groupes de dates récupérés`)
    return NextResponse.json({ galleryGroups: sortedGroups })
  } catch (error) {
    console.error('Erreur API galleries-by-date:', error)
    return NextResponse.json({ 
      galleryGroups: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
} 