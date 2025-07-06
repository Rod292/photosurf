"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"

interface Photo {
  id: string
  preview_s3_url: string
  galleries: {
    name: string
    date: string
  }
}

interface GalleryClientProps {
  latestPhotos: Photo[]
  galleries: any[]
  schoolName?: string
  dateFilter?: string
}

export function GalleryClient({ latestPhotos, galleries, schoolName, dateFilter }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Transformer les photos pour être compatibles avec PhotoLightboxModal
  const formattedPhotos = latestPhotos.map(photo => ({
    id: photo.id,
    preview_s3_url: photo.preview_s3_url,
    filename: photo.galleries.name || "Photo de surf",
    original_s3_key: "",
    filesize: 0,
    content_type: "image/jpeg",
    created_at: new Date().toISOString(),
    gallery_id: ""
  }))

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index)
  }

  const handleCloseModal = () => {
    setLightboxIndex(null)
  }

  if (!schoolName && !dateFilter) {
    return null // Pour les cas où on n'est pas dans le mode école ou date
  }

  // Formatage de la date pour l'affichage
  const formatDisplayDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return (
    <>
      <div className="py-4">
        {/* Sessions horizontales */}
        <div className="bg-white py-6 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              {schoolName === "La Torche Surf School" && (
                <Image
                  src="/Logos/LOGO-COULEURS.svg"
                  alt="La Torche Surf School"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
              )}
              <h2 className="text-xl font-bold">
                {dateFilter ? `Sessions du ${formatDisplayDate(dateFilter)}` : "Sessions"}
              </h2>
            </div>
            
            {galleries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {dateFilter 
                    ? "Aucune session disponible pour cette date" 
                    : "Aucune session disponible pour cette école"
                  }
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {galleries.map((gallery: any) => (
                    <Link 
                      key={gallery.id}
                      href={`/gallery/${gallery.id}`}
                      className="group flex-shrink-0"
                    >
                      <div className="w-28 h-40 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                        <div className="w-full h-full relative">
                          {/* Photo de session ou fallback */}
                          {gallery.photos && gallery.photos.length > 0 ? (
                            <Image
                              src={gallery.photos[0].preview_s3_url}
                              alt={gallery.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                          )}
                          
                          {/* Overlay avec nom de session */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
                              {gallery.name}
                            </p>
                          </div>
                          
                          {/* Badge photo count */}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <span className="text-xs font-medium text-gray-700">
                              {gallery.photos?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        {new Date(gallery.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short"
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photos récentes */}
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl font-bold mb-4">
            {dateFilter 
              ? `Photos du ${formatDisplayDate(dateFilter)}`
              : "Photos récentes"
            }
          </h2>
          
          {latestPhotos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <Image
                  src="/Logos/camera2.svg"
                  alt="Camera"
                  width={64}
                  height={64}
                  className="w-16 h-16 mx-auto opacity-60"
                />
              </div>
              <p className="text-gray-600">Aucune photo disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {latestPhotos.map((photo: any, index: number) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  className="group relative w-full pt-[150%] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="absolute inset-0">
                    <Image
                      src={photo.preview_s3_url}
                      alt={`Photo de ${photo.galleries.name || 'surf'}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                    <div className="text-white text-center">
                      <p className="text-sm font-medium">
                        {new Date(photo.galleries.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
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
          photos={formattedPhotos}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}