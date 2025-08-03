import { Metadata } from "next"
import { Header } from "@/components/header"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Gallery } from "@/lib/database.types"
import { GalleryPageWrapper } from "./gallery-page-wrapper"

interface SearchParams {
  date?: string
  school?: string
}

async function getFilteredGalleries(searchParams: SearchParams): Promise<Gallery[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Construire la requête avec join sur surf_schools et photos si on filtre par école
    let query = supabase
      .from("galleries")
      .select(`
        *,
        surf_schools (
          id,
          name,
          slug
        ),
        photos (
          id,
          preview_s3_url,
          created_at,
          filename,
          original_s3_key,
          filesize,
          content_type,
          gallery_id
        )
      `)
    
    // Filtrer par date si présente
    if (searchParams.date) {
      query = query.eq("date", searchParams.date)
    }
    
    // Filtrer par école si présente
    if (searchParams.school) {
      query = query.eq("surf_schools.name", searchParams.school)
    }
    
    const { data: galleries, error } = await query.order("created_at", { ascending: false })
    
    if (error) {
      console.error("Erreur Supabase:", error)
      return []
    }
    
    return galleries || []
  } catch (error) {
    console.error("Erreur lors de la récupération des galeries:", error)
    return []
  }
}

async function getLatestPhotosFromSchool(schoolName: string) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // D'abord, obtenir l'ID de l'école
    const { data: school, error: schoolError } = await supabase
      .from("surf_schools")
      .select("id")
      .eq("name", schoolName)
      .single()
    
    if (schoolError || !school) {
      console.error("Erreur lors de la récupération de l'école:", schoolError)
      return []
    }
    
    // Ensuite, obtenir les galeries de cette école
    const { data: galleries, error: galleriesError } = await supabase
      .from("galleries")
      .select("id")
      .eq("school_id", school.id)
    
    if (galleriesError || !galleries) {
      console.error("Erreur lors de la récupération des galeries:", galleriesError)
      return []
    }
    
    const galleryIds = galleries.map(g => g.id)
    
    // Enfin, obtenir toutes les photos de ces galeries
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select(`
        id,
        preview_s3_url,
        created_at,
        gallery_id,
        galleries!inner (
          name,
          date
        )
      `)
      .in("gallery_id", galleryIds)
      .order("created_at", { ascending: false })
    
    if (photosError) {
      console.error("Erreur lors de la récupération des photos:", photosError)
      return []
    }
    
    return photos || []
  } catch (error) {
    console.error("Erreur lors de la récupération des photos de l'école:", error)
    return []
  }
}

async function getLatestPhotosFromDate(date: string) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Obtenir les galeries de cette date
    const { data: galleries, error: galleriesError } = await supabase
      .from("galleries")
      .select("id")
      .eq("date", date)
    
    if (galleriesError || !galleries) {
      console.error("Erreur lors de la récupération des galeries:", galleriesError)
      return []
    }
    
    const galleryIds = galleries.map(g => g.id)
    
    if (galleryIds.length === 0) {
      return []
    }
    
    // Obtenir toutes les photos de ces galeries
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select(`
        id,
        preview_s3_url,
        created_at,
        gallery_id,
        galleries!inner (
          name,
          date
        )
      `)
      .in("gallery_id", galleryIds)
      .order("created_at", { ascending: false })
    
    if (photosError) {
      console.error("Erreur lors de la récupération des photos:", photosError)
      return []
    }
    
    return photos || []
  } catch (error) {
    console.error("Erreur lors de la récupération des photos de la date:", error)
    return []
  }
}

export const metadata: Metadata = {
  title: "Galeries Photo - Arode Studio",
  description: "Découvrez toutes nos galeries de photos de surf en Bretagne. Trouvez vos photos et commandez vos tirages professionnels.",
  keywords: ["galeries photo", "surf", "bretagne", "la torche", "photos"],
}

export default async function GalleriesListPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const galleries = await getFilteredGalleries(resolvedSearchParams)
  const hasFilters = !!(resolvedSearchParams.date || resolvedSearchParams.school)
  const isSchoolFilter = !!resolvedSearchParams.school
  const isDateFilter = !!resolvedSearchParams.date
  
  // Récupérer les photos récentes si on filtre par école ou par date
  const rawLatestPhotos = isSchoolFilter 
    ? await getLatestPhotosFromSchool(resolvedSearchParams.school!) 
    : isDateFilter 
    ? await getLatestPhotosFromDate(resolvedSearchParams.date!)
    : []
  
  // Transformer les données pour correspondre à l'interface attendue
  const latestPhotos = rawLatestPhotos.map((photo: any) => ({
    id: photo.id,
    preview_s3_url: photo.preview_s3_url,
    galleries: Array.isArray(photo.galleries) ? photo.galleries[0] : photo.galleries
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <GalleryPageWrapper 
          galleries={galleries}
          latestPhotos={latestPhotos}
          hasFilters={hasFilters}
          isSchoolFilter={isSchoolFilter}
          isDateFilter={isDateFilter}
          searchParams={resolvedSearchParams}
        />
      </main>
    </div>
  )
} 