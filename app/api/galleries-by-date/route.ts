import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Récupérer les galeries avec les photos
    const { data: galleries, error } = await supabase
      .from('galleries')
      .select(`
        id,
        name,
        date,
        photos (
          id,
          preview_s3_url
        )
      `)
      .order('date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
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

    return NextResponse.json({ galleryGroups: sortedGroups })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 