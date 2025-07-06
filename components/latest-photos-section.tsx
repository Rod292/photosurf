import Image from "next/image"
import Link from "next/link"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Photo, Gallery } from "@/lib/database.types"

// Interface pour les photos avec leurs galeries
interface PhotoWithGallery extends Photo {
  gallery?: Gallery
}

async function getLatestPhotos(): Promise<PhotoWithGallery[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Récupérer les 8 dernières photos avec leurs galeries
    const { data: photos, error } = await supabase
      .from('photos')
      .select(`
        *,
        gallery:gallery_id (
          id,
          name,
          date,
          school_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(8)
    
    if (error) {
      console.error('Erreur lors de la récupération des dernières photos:', error)
      return []
    }
    
    return photos || []
  } catch (error) {
    console.error('Erreur dans getLatestPhotos:', error)
    return []
  }
}

export async function LatestPhotosSection() {
  const photos = await getLatestPhotos()

  if (photos.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-12 text-center font-dm-sans-handgloves relative">
          <span className="relative inline-block">
            Dernières Sessions
            <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
          </span>
        </h2>
        
        <div className="text-center py-16">
          <div className="mb-4 flex justify-center">
            <Image
              src="/Logos/camera-icon.svg"
              alt="Camera"
              width={96}
              height={96}
              className="w-24 h-24"
            />
          </div>
          <h3 className="text-2xl font-semibold mb-4">Aucune photo disponible</h3>
          <p className="text-gray-600">Les premières photos seront bientôt disponibles !</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <h2 className="text-4xl font-bold mb-12 text-center font-dm-sans-handgloves relative">
        <span className="relative inline-block">
          Dernières Sessions
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
        </span>
      </h2>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {photos.map((photo) => (
          <Link
            key={photo.id}
            href={`/gallery/${photo.gallery_id}`}
            className="group flex-shrink-0 relative"
          >
            <div className="w-64 h-48 relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Image
                src={photo.preview_s3_url}
                alt={photo.filename}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 256px, 256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium truncate">
                  {photo.gallery?.name || 'Session de surf'}
                </p>
                <p className="text-xs opacity-90">
                  {photo.gallery?.date ? 
                    new Date(photo.gallery.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    }) 
                    : 'Cliquez pour voir plus'
                  }
                </p>
              </div>
              
              {/* Watermark discret */}
              <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium opacity-70">
                Arode Studio
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link 
          href="/gallery"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 font-medium group"
        >
          Voir toutes les galeries
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  )
} 