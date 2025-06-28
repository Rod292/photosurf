import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Récupérer les écoles avec leurs galeries et photos
    const { data: schools, error } = await supabase
      .from('surf_schools')
      .select(`
        id,
        name,
        slug,
        galleries (
          id,
          name,
          photos (
            id,
            preview_s3_url
          )
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // Transformer les données pour le composant
    const schoolGroups = schools
      .map((school: any) => {
        const galleries = school.galleries.map((gallery: any) => ({
          id: gallery.id,
          name: gallery.name,
          photoCount: gallery.photos?.length || 0,
          coverPhoto: gallery.photos?.[0]?.preview_s3_url || null
        }))

        const totalPhotos = galleries.reduce((sum: number, gallery: any) => sum + gallery.photoCount, 0)

        return {
          school: {
            id: school.id,
            name: school.name,
            slug: school.slug
          },
          galleries: galleries.slice(0, 10), // Limiter à 10 galeries par école
          totalPhotos
        }
      })
      .filter((schoolGroup: any) => schoolGroup.totalPhotos > 0) // Garder seulement les écoles avec des photos
      .slice(0, 12) // Limiter à 12 écoles

    return NextResponse.json({ schoolGroups })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 