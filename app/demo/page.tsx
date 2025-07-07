import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Gallery } from "@/lib/database.types"
import { ArrowLeft, Home, Eye } from "lucide-react"
import { redirect } from "next/navigation"
import { DemoClient } from "./demo-client"
import { DemoMainClient } from "./demo-main-client"

interface SearchParams {
  date?: string
  school?: string
}

async function checkAuthentication() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/login?redirect=/demo')
    }
    
    return user
  } catch (error) {
    console.error('Auth check error:', error)
    redirect('/login?redirect=/demo')
  }
}

async function getFilteredGalleries(searchParams: SearchParams): Promise<Gallery[]> {
  try {
    const supabase = await createSupabaseServerClient()
    
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
          original_s3_key,
          created_at,
          filename,
          filesize,
          content_type,
          gallery_id
        )
      `)
    
    if (searchParams.date) {
      query = query.eq("date", searchParams.date)
    }
    
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
    const supabase = await createSupabaseServerClient()
    
    const { data: school, error: schoolError } = await supabase
      .from("surf_schools")
      .select("id")
      .eq("name", schoolName)
      .single()
    
    if (schoolError || !school) {
      console.error("Erreur lors de la récupération de l'école:", schoolError)
      return []
    }
    
    const { data: galleries, error: galleriesError } = await supabase
      .from("galleries")
      .select("id")
      .eq("school_id", school.id)
    
    if (galleriesError || !galleries) {
      console.error("Erreur lors de la récupération des galeries:", galleriesError)
      return []
    }
    
    const galleryIds = galleries.map(g => g.id)
    
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select(`
        id,
        preview_s3_url,
        original_s3_key,
        created_at,
        gallery_id,
        filename,
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

async function getLatestPhotosFromDate(date: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
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
    
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select(`
        id,
        preview_s3_url,
        original_s3_key,
        created_at,
        gallery_id,
        filename,
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
    console.error("Erreur lors de la récupération des photos de la date:", error)
    return []
  }
}

export const metadata: Metadata = {
  title: "Mode Démonstration - Arode Studio",
  description: "Mode démonstration avec photos haute qualité sans watermark pour les présentations professionnelles.",
  robots: "noindex, nofollow", // Prevent search engine indexing
}

export default async function DemoPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  // Check authentication first
  const user = await checkAuthentication()
  
  const resolvedSearchParams = await searchParams
  const galleries = await getFilteredGalleries(resolvedSearchParams)
  
  console.log('Galleries récupérées:', galleries.length)
  if (galleries.length > 0) {
    console.log('Première galerie:', galleries[0])
    console.log('Photos dans première galerie:', (galleries[0] as any)?.photos?.length)
  }
  const hasFilters = resolvedSearchParams.date || resolvedSearchParams.school
  const isSchoolFilter = !!resolvedSearchParams.school
  const isDateFilter = !!resolvedSearchParams.date
  
  const rawLatestPhotos = isSchoolFilter 
    ? await getLatestPhotosFromSchool(resolvedSearchParams.school!) 
    : isDateFilter 
    ? await getLatestPhotosFromDate(resolvedSearchParams.date!)
    : []
  
  const latestPhotos = rawLatestPhotos.map((photo: any) => ({
    id: photo.id,
    gallery_id: photo.gallery_id,
    preview_s3_url: photo.preview_s3_url,
    original_s3_key: photo.original_s3_key,
    filename: photo.filename,
    galleries: Array.isArray(photo.galleries) ? photo.galleries[0] : photo.galleries
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">

        {/* Navigation */}
        <div className="bg-white py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <Home className="w-4 h-4" />
                <span className="font-medium">Retour à l'accueil</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/gallery"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Galerie publique
                </Link>
                <Link 
                  href="/admin/upload"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Admin Upload
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative pt-20 pb-24 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/latorche-aerial.jpg"
              alt="Vue aérienne de La Torche"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold font-playfair mb-8 drop-shadow-lg">
              Démonstration Professionnelle
            </h1>
            <p className="text-xl md:text-2xl font-varela-round opacity-95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
              Photos haute qualité sans watermark pour vos présentations
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Authentifié en tant que {user.email}</span>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasFilters && (
          <div className="bg-purple-50 py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-gray-700">Filtres actifs :</span>
                {resolvedSearchParams.date && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-purple-200 flex items-center gap-1">
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
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-purple-200">
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
                  href="/demo"
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  Effacer les filtres
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isSchoolFilter ? (
          <DemoClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            schoolName={resolvedSearchParams.school}
          />
        ) : isDateFilter ? (
          <DemoClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            dateFilter={resolvedSearchParams.date}
          />
        ) : (
          <div className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
                {hasFilters ? "Résultats de recherche" : "Toutes nos galeries - Mode Démo"}
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
                      href="/demo"
                      className="inline-block mt-4 text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Voir toutes les galeries
                    </Link>
                  )}
                </div>
              ) : (
                <DemoMainClient galleries={galleries} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}