import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Gallery, Photo } from "@/lib/database.types"
import { ArrowLeft, Home, Eye } from "lucide-react"
import { redirect, notFound } from "next/navigation"
import { DemoGalleryClient } from "./demo-gallery-client"

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

async function getGallery(id: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: gallery, error } = await supabase
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
          content_type
        )
      `)
      .eq("id", id)
      .single()
    
    if (error || !gallery) {
      console.error("Erreur lors de la récupération de la galerie:", error)
      return null
    }
    
    return gallery
  } catch (error) {
    console.error("Erreur lors de la récupération de la galerie:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const gallery = await getGallery(id)
  
  if (!gallery) {
    return {
      title: "Galerie non trouvée - Mode Démonstration",
      robots: "noindex, nofollow"
    }
  }

  return {
    title: `${gallery.name} - Mode Démonstration - Arode Studio`,
    description: `Photos haute qualité sans watermark de la session ${gallery.name} du ${new Date(gallery.date).toLocaleDateString('fr-FR')}`,
    robots: "noindex, nofollow"
  }
}

export default async function DemoGalleryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Check authentication first
  const user = await checkAuthentication()
  const { id } = await params
  
  const gallery = await getGallery(id)
  
  if (!gallery) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Demo mode banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              <span>MODE DÉMONSTRATION - Photos haute qualité sans watermark</span>
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  href="/demo"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Retour aux galeries</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Connecté : {user.email}
                </div>
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
        <div className="relative pt-16 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/latorche-aerial.jpg"
              alt="Vue aérienne de La Torche"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-4 drop-shadow-lg">
              {gallery.name}
            </h1>
            <p className="text-lg md:text-xl font-varela-round opacity-95 mb-4 drop-shadow-md">
              Session du {new Date(gallery.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {gallery.surf_schools && (
              <p className="text-md opacity-90 drop-shadow-md">
                École : {gallery.surf_schools.name}
              </p>
            )}
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">
                {gallery.photos?.length || 0} photos en haute qualité
              </span>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <DemoGalleryClient gallery={gallery} photos={gallery.photos || []} />
          </div>
        </div>
      </main>
    </div>
  )
}