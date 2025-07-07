import { notFound } from "next/navigation"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { GalleryClient } from "./gallery-client"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Gallery, Photo, SurfSchool } from "@/lib/database.types"
import { ArrowLeft, Home } from "lucide-react"

async function getGalleryWithPhotos(galleryId: string) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Fetch gallery
    const { data: gallery, error: galleryError } = await supabase
      .from("galleries")
      .select("*")
      .eq("id", galleryId)
      .single()
    
    if (galleryError) {
      console.error("Erreur galerie:", galleryError)
      return null
    }
    
    // Fetch surf school
    let surfSchool = null
    if (gallery.school_id) {
      const { data: schoolData, error: schoolError } = await supabase
      .from("surf_schools")
      .select("*")
      .eq("id", gallery.school_id)
      .single()
    
      if (!schoolError && schoolData) {
        surfSchool = schoolData
      }
    }
    
    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select("*")
      .eq("gallery_id", galleryId)
      .order("created_at", { ascending: true })
    
    if (photosError) {
      console.error("Erreur photos:", photosError)
      return {
        gallery,
        surfSchool,
        photos: []
      }
    }
    
    return {
      gallery,
      surfSchool,
      photos: photos || []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const result = await getGalleryWithPhotos(id)
  
  if (!result) {
    return {
      title: "Galerie introuvable - Arode Studio",
      description: "Cette galerie n'existe pas ou n'est plus disponible."
    }
  }
  
  const { gallery } = result
  
  return {
    title: `${gallery.name} - Arode Studio`,
    description: `Découvrez les photos de la session ${gallery.name} du ${new Date(gallery.date).toLocaleDateString("fr-FR")}. Commandez vos tirages photo professionnels.`,
    keywords: ["photos surf", "galerie", gallery.name, "bretagne", "la torche"],
    openGraph: {
      title: `${gallery.name} - Arode Studio`,
      description: `Photos de surf de la session ${gallery.name}`,
      type: "website",
    }
  }
}

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getGalleryWithPhotos(id)
  
  if (!result) {
    notFound()
  }
  
  const { gallery, surfSchool, photos } = result
  
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
        {/* Header de la galerie avec image de fond */}
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
          <div className="relative z-10 container mx-auto px-4 text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6 drop-shadow-lg">
              {gallery.name}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-6 text-lg">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Image
                  src="/Logos/Calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                  className="w-5 h-5 opacity-90"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <span className="ml-2 font-varela-round">
                  {new Date(gallery.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long", 
                    day: "numeric"
                  })}
                </span>
              </div>
              {surfSchool && (
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="opacity-90">🏄‍♂️</span>
                  <span className="ml-2 font-varela-round">
                    {surfSchool.name}
                  </span>
                </div>
              )}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="opacity-90">📸</span>
                <span className="ml-2 font-varela-round">
                  {photos.length} photo{photos.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Galerie de photos */}
        <div className="py-8">
          <GalleryClient gallery={gallery} photos={photos} />
        </div>
      </main>
    </div>
  )
} 