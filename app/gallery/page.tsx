import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Gallery } from "@/lib/database.types"
import { ArrowLeft, Home } from "lucide-react"
import { GalleryClient } from "./gallery-client"

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
          preview_s3_url
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
    
    // Enfin, obtenir les photos les plus récentes de ces galeries
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
      .limit(20)
    
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
  
  // Récupérer les photos récentes si on filtre par école
  const rawLatestPhotos = isSchoolFilter ? await getLatestPhotosFromSchool(resolvedSearchParams.school!) : []
  
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
              src="/latorche-aerial.jpg"
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
              Nos Galeries Photo
            </h1>
            <p className="text-xl md:text-2xl font-varela-round opacity-95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
              Découvrez vos photos de surf en Bretagne. Chaque session est immortalisée avec passion et professionnalisme sur ce magnifique spot de La Torche.
            </p>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasFilters && (
          <div className="bg-blue-50 py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-gray-700">Filtres actifs :</span>
                {resolvedSearchParams.date && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                    📅 {new Date(resolvedSearchParams.date).toLocaleDateString("fr-FR")}
                  </span>
                )}
                {resolvedSearchParams.school && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                    🏄‍♂️ {resolvedSearchParams.school}
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="text-blue-600 text-2xl mb-2">📅</div>
                  <h3 className="text-lg font-semibold mb-1">1. Trouvez votre date</h3>
                  <p className="text-gray-600 text-sm">Recherchez la galerie correspondant à votre date de session</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="text-blue-600 text-2xl mb-2">🔍</div>
                  <h3 className="text-lg font-semibold mb-1">2. Parcourez les photos</h3>
                  <p className="text-gray-600 text-sm">Explorez toutes les photos de votre session</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="text-blue-600 text-2xl mb-2">🛒</div>
                  <h3 className="text-lg font-semibold mb-1">3. Commandez</h3>
                  <p className="text-gray-600 text-sm">Sélectionnez vos photos favorites et passez commande</p>
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
        ) : (
          // Layout normal pour les autres cas
          <div className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
                {hasFilters ? "Résultats de recherche" : "Galeries Disponibles"}
              </h2>
              
              {galleries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📸</div>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {galleries.map((gallery: any) => (
                    <Link 
                      key={gallery.id}
                      href={`/gallery/${gallery.id}`}
                      className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        {/* Photo de session ou fallback */}
                        {gallery.photos && gallery.photos.length > 0 ? (
                          <Image
                            src={gallery.photos[0].preview_s3_url}
                            alt={gallery.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600" />
                        )}
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Badge photo count */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-sm font-semibold text-gray-700">
                            {gallery.photos?.length || 0} photo{(gallery.photos?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Fallback content si pas de photo */}
                        {(!gallery.photos || gallery.photos.length === 0) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-4xl mb-2">📸</div>
                              <p className="text-sm opacity-90">Cliquez pour voir les photos</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                          {gallery.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {new Date(gallery.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric", 
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                        <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                          <span className="font-medium">Voir les photos</span>
                          <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 