import { NextResponse, NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const locationSlug = searchParams.get('location')
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

    // Get school ID if location is provided
    let schoolId: number | null = null
    if (locationSlug) {
      const { data: school } = await supabase
        .from('surf_schools')
        .select('id')
        .eq('slug', locationSlug)
        .single()
      
      if (school) {
        schoolId = school.id
      }
    }
    
    // Première approche : récupérer toutes les galeries avec photos
    let galleriesQuery = supabase
      .from('galleries')
      .select(`
        id,
        name,
        school_id,
        photos (
          id,
          preview_s3_url
        )
      `)
      .not('school_id', 'is', null)
    
    // Filter by school if location provided
    if (schoolId) {
      galleriesQuery = galleriesQuery.eq('school_id', schoolId)
    }
    
    const { data: galleries, error: galleriesError } = await galleriesQuery
    
    if (galleriesError) {
      console.error('Erreur récupération galeries:', galleriesError)
      return NextResponse.json({ 
        schoolGroups: [],
        error: galleriesError.message 
      })
    }

    // Récupérer les écoles
    let schoolsQuery = supabase
      .from('surf_schools')
      .select('id, name, slug')
      .order('name', { ascending: true })
    
    // If location provided, only get that school
    if (schoolId) {
      schoolsQuery = schoolsQuery.eq('id', schoolId)
    }
    
    const { data: schools, error } = await schoolsQuery

    if (error) {
      console.error('Erreur Supabase dans photos-by-school:', error)
      return NextResponse.json({ 
        schoolGroups: [],
        error: error.message 
      })
    }

    // Transformer les données pour le composant
    const schoolGroups = schools
      .map((school: any) => {
        const schoolGalleries = galleries.filter((gallery: any) => gallery.school_id === school.id)
        
        const galleriesData = schoolGalleries.map((gallery: any) => ({
          id: gallery.id,
          name: gallery.name,
          photoCount: gallery.photos?.length || 0,
          coverPhoto: gallery.photos?.[0]?.preview_s3_url || null
        }))

        const totalPhotos = galleriesData.reduce((sum: number, gallery: any) => sum + gallery.photoCount, 0)

        return {
          school: {
            id: school.id,
            name: school.name,
            slug: school.slug
          },
          galleries: galleriesData.slice(0, 10), // Limiter à 10 galeries par école
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
      schoolGroups: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
} 