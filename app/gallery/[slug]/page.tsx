import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GalleryClient } from "./gallery-client"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Database } from "@/lib/database.types"

type Gallery = Database["public"]["Tables"]["galleries"]["Row"]
type Photo = Database["public"]["Tables"]["photos"]["Row"]
type SurfSchool = Database["public"]["Tables"]["surf_schools"]["Row"]

// Mock data pour les tests - utilisation d'UUIDs valides
const mockGallery: Gallery = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Session Matin - La Torche",
  date: "2024-12-15",
  surf_school_id: "550e8400-e29b-41d4-a716-446655440001", 
  created_at: "2024-12-15T10:00:00Z"
}

const mockSurfSchool: SurfSchool = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  name: "École de Surf La Torche",
  slug: "ecole-surf-la-torche",
  location: "La Torche, Finistère",
  created_at: "2024-01-01T00:00:00Z"
}

const mockPhotos: Photo[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    gallery_id: "550e8400-e29b-41d4-a716-446655440000",
    filename: "surf_1.jpg",
    original_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode.jpg",
    preview_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode.jpg",
    width: 1920,
    height: 1080,
    created_at: "2024-12-15T10:00:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011", 
    gallery_id: "550e8400-e29b-41d4-a716-446655440000",
    filename: "surf_2.jpg",
    original_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode3.jpg",
    preview_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode3.jpg",
    width: 1920,
    height: 1080,
    created_at: "2024-12-15T10:15:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    gallery_id: "550e8400-e29b-41d4-a716-446655440000", 
    filename: "surf_3.jpg",
    original_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode4.jpg",
    preview_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode4.jpg",
    width: 1920,
    height: 1080,
    created_at: "2024-12-15T10:30:00Z"
  }
]

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
      return {
        gallery: mockGallery,
        surfSchool: mockSurfSchool,
        photos: mockPhotos
      }
    }
    
    // Fetch surf school
    const { data: surfSchool, error: schoolError } = await supabase
      .from("surf_schools")
      .select("*")
      .eq("id", gallery.surf_school_id)
      .single()
    
    if (schoolError) {
      console.error("Erreur école de surf:", schoolError)
    }
    
    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select("*")
      .eq("gallery_id", galleryId)
      .order("created_at", { ascending: true })
    
    if (photosError) {
      console.error("Erreur photos:", photosError)
    }
    
    return {
      gallery: gallery || mockGallery,
      surfSchool: surfSchool || mockSurfSchool,
      photos: photos || mockPhotos
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    return {
      gallery: mockGallery,
      surfSchool: mockSurfSchool,
      photos: mockPhotos
    }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { gallery } = await getGalleryWithPhotos(slug)
  
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

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { gallery, surfSchool, photos } = await getGalleryWithPhotos(slug)
  
  if (!gallery) {
    notFound()
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Header de la galerie */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold font-playfair mb-4">
              {gallery.name}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-lg">
              <div className="flex items-center">
                <span className="opacity-90">📅</span>
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
                <div className="flex items-center">
                  <span className="opacity-90">🏄‍♂️</span>
                  <span className="ml-2 font-varela-round">
                    {surfSchool.name}
                  </span>
                </div>
              )}
              <div className="flex items-center">
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
      
      <Footer />
    </div>
  )
} 