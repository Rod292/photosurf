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
      console.error('Erreur Supabase dans photos-by-school:', error)
      return NextResponse.json({ 
        error: 'Erreur base de données', 
        details: error.message 
      }, { status: 500 })
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

    console.log(`photos-by-school: ${schoolGroups.length} écoles avec photos récupérées`)
    return NextResponse.json({ schoolGroups })
  } catch (error) {
    console.error('Erreur API photos-by-school:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
} 