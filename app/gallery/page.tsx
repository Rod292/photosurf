import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Gallery } from "@/lib/database.types"
import { ArrowLeft, Home } from "lucide-react"
import { GalleryClient } from "./gallery-client"
import { GalleryMainClient } from "./gallery-main-client"

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
  const hasFilters = resolvedSearchParams.date || resolvedSearchParams.school
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
        {/* Bouton retour accueil */}
        <div className="bg-white py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <Home className="w-4 h-4" />
              <span className="font-medium">Retour à l'accueil</span>
            </Link>
          </div>
        </div>

        {/* Hero Section avec image de fond */}
        <div className="relative pt-20 pb-24 overflow-hidden">
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="/Logos/DJI_03862025LaTorche-3.jpg"
              alt="Vue aérienne de La Torche"
              fill
              className="object-cover"
              priority
            />
            {/* Léger overlay sombre uniquement pour la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          </div>
          
          {/* Contenu */}
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold font-playfair mb-8 drop-shadow-lg">
              Nos dernières photos
            </h1>
            <p className="text-xl md:text-2xl font-varela-round opacity-95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
              Découvre, télécharge, imprime tes photos de surf sur le spot de La Torche
            </p>
          </div>
        </div>

        {/* Bandeau réductions */}
        <div className="bg-gradient-to-r from-emerald-400 to-blue-500 py-3 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <span className="text-base">💰</span>
              </div>
              <p className="text-center text-white font-medium text-sm">
                <span className="font-bold">Réductions dégressives :</span> 2ème photo 10€ • 3ème+ photos 5€
              </p>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasFilters && (
          <div className="bg-blue-50 py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-gray-700">Filtres actifs :</span>
                {resolvedSearchParams.date && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200 flex items-center gap-1">
                    <Image
                      src="/Logos/Calendar.svg"
                      alt="Calendar"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    {new Date(resolvedSearchParams.date).toLocaleDateString("fr-FR")}
                  </span>
                )}
                {resolvedSearchParams.school && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                    <Image
                      src="/Logos/surfer.svg"
                      alt="Surfer"
                      width={16}
                      height={16}
                      className="w-4 h-4 mr-1"
                    />
                    {resolvedSearchParams.school}
                  </span>
                )}
                <Link 
                  href="/gallery"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Effacer les filtres
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-xl md:text-2xl font-bold font-dm-sans mb-6">
                Comment retrouver vos photos ?
              </h2>
              {/* Desktop version */}
              <div className="hidden md:grid md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/Logos/Calendar.svg"
                      alt="Calendar"
                      width={32}
                      height={32}
                      className="w-8 h-8 text-blue-600"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">1. Trouvez votre date</h3>
                  <p className="text-gray-600 text-sm">Recherchez la galerie correspondant à votre date de session</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/Logos/camera2.svg"
                      alt="Search"
                      width={32}
                      height={32}
                      className="w-8 h-8 text-blue-600"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">2. Parcourez les photos</h3>
                  <p className="text-gray-600 text-sm">Explorez toutes les photos de votre session</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping"
                      width={32}
                      height={32}
                      className="w-8 h-8 text-blue-600"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">3. Commandez</h3>
                  <p className="text-gray-600 text-sm">Sélectionnez vos photos favorites et passez commande</p>
                </div>
              </div>
              
              {/* Mobile version - horizontal */}
              <div className="md:hidden flex justify-between gap-2">
                <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
                  <div className="flex justify-center mb-1">
                    <Image
                      src="/Logos/Calendar.svg"
                      alt="Calendar"
                      width={20}
                      height={20}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <h3 className="text-xs font-semibold">1. Trouvez votre date</h3>
                </div>
                <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
                  <div className="flex justify-center mb-1">
                    <Image
                      src="/Logos/camera2.svg"
                      alt="Search"
                      width={20}
                      height={20}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <h3 className="text-xs font-semibold">2. Parcourez les photos</h3>
                </div>
                <div className="flex-1 bg-white p-2 rounded-lg shadow-md text-center">
                  <div className="flex justify-center mb-1">
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping"
                      width={20}
                      height={20}
                      className="w-5 h-5 text-blue-600"
                    />
                  </div>
                  <h3 className="text-xs font-semibold">3. Commandez</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Galleries Grid */}
        {isSchoolFilter ? (
          // Layout spécial pour le filtre par école
          <GalleryClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            schoolName={resolvedSearchParams.school}
          />
        ) : isDateFilter ? (
          // Layout spécial pour le filtre par date
          <GalleryClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            dateFilter={resolvedSearchParams.date}
          />
        ) : (
          // Layout organisé par date et école comme sur la page d'accueil
          <div className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
                {hasFilters ? "Résultats de recherche" : "Toutes nos galeries"}
              </h2>
              
              {galleries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    <Image
                      src="/Logos/camera2.svg"
                      alt="Camera"
                      width={96}
                      height={96}
                      className="w-24 h-24"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">
                    {hasFilters ? "Aucun résultat trouvé" : "Aucune galerie disponible"}
                  </h3>
                  <p className="text-gray-600">
                    {hasFilters 
                      ? "Essayez de modifier vos critères de recherche" 
                      : "Les nouvelles galeries seront bientôt disponibles !"}
                  </p>
                  {hasFilters && (
                    <Link 
                      href="/gallery"
                      className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Voir toutes les galeries
                    </Link>
                  )}
                </div>
              ) : (
                <GalleryMainClient galleries={galleries} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 