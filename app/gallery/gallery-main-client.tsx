"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"

interface GalleryMainClientProps {
  galleries: any[]
}

export function GalleryMainClient({ galleries }: GalleryMainClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Obtenir toutes les photos triées par date
  const allPhotos = galleries
    .flatMap((gallery: any) => gallery.photos || [])
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index)
  }

  const handleCloseModal = () => {
    setLightboxIndex(null)
  }

  return (
    <>
      <div className="space-y-8">
        {/* Petites cartes de jours horizontales */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[...new Map(galleries.map((gallery: any) => [gallery.date, gallery])).values()].map((gallery: any) => (
            <Link key={gallery.date} href={`/gallery?date=${gallery.date}`} className="flex-shrink-0">
              <div className="w-36 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer">
                <div className="relative h-24 rounded-t-lg overflow-hidden">
                  {gallery.photos && gallery.photos.length > 0 ? (
                    <Image
                      src={gallery.photos[0].preview_s3_url}
                      alt={`Photos du ${new Date(gallery.date).toLocaleDateString('fr-FR')}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xl">📸</span>
                    </div>
                  )}
                  
                  <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <span className="text-xs font-medium text-gray-700">
                      {galleries.filter((g: any) => g.date === gallery.date).length}
                    </span>
                  </div>
                </div>
                
                <div className="p-2">
                  <p className="text-center text-xs font-medium text-black">
                    {new Date(gallery.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Toutes les photos chronologiques */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Toutes les photos
          </h3>
          
          {allPhotos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-gray-600">Aucune photo disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allPhotos.map((photo: any, index: number) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Image
                    src={photo.preview_s3_url}
                    alt="Photo de surf"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightboxModal
          isOpen={true}
          onClose={handleCloseModal}
          photos={allPhotos}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}