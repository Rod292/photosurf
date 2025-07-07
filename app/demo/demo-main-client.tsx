"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gallery, Photo } from "@/lib/database.types"
import { DemoPhotoLightboxModal } from "@/components/demo-photo-lightbox-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DemoMainClientProps {
  galleries: any[]
}

interface DemoPhoto extends Photo {
  demoUrl?: string
  expiresAt?: string
}

const PHOTOS_PER_PAGE = 50

export function DemoMainClient({ galleries }: DemoMainClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [demoPhotos, setDemoPhotos] = useState<DemoPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Extraire toutes les photos de toutes les galeries
  const allPhotos: DemoPhoto[] = galleries.flatMap((gallery: any) => 
    (gallery.photos || []).map((photo: any) => ({
      ...photo,
      gallery: {
        id: gallery.id,
        name: gallery.name,
        date: gallery.date,
        school_id: gallery.school_id
      }
    }))
  )

  useEffect(() => {
    async function loadDemoUrls() {
      console.log('Demo photos disponibles:', allPhotos.length)
      console.log('Première photo:', allPhotos[0])
      
      if (allPhotos.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Charger les URLs demo par batch de 10 photos
        const batchSize = 10
        const photoBatches = []
        
        for (let i = 0; i < allPhotos.length; i += batchSize) {
          photoBatches.push(allPhotos.slice(i, i + batchSize))
        }

        const updatedPhotos = [...allPhotos]

        // Charger les URLs par batch pour éviter de surcharger l'API
        for (const batch of photoBatches) {
          const photoIds = batch.map(p => p.id).join(',')
          
          const response = await fetch(`/api/demo-photos?photoIds=${photoIds}`)
          
          if (response.ok) {
            const data = await response.json()
            
            // Mettre à jour les URLs demo
            data.photos.forEach((demoPhoto: any) => {
              const index = updatedPhotos.findIndex(p => p.id === demoPhoto.photoId)
              if (index !== -1) {
                updatedPhotos[index] = {
                  ...updatedPhotos[index],
                  demoUrl: demoPhoto.demoUrl,
                  expiresAt: demoPhoto.expiresAt
                }
              }
            })
          }
        }

        setDemoPhotos(updatedPhotos)
      } catch (error) {
        console.error('Erreur lors du chargement des URLs demo:', error)
        // En cas d'erreur, utiliser les photos sans URLs demo
        setDemoPhotos(allPhotos)
      } finally {
        setLoading(false)
      }
    }

    loadDemoUrls()
  }, [galleries])

  // Pagination
  const totalPages = Math.ceil(demoPhotos.length / PHOTOS_PER_PAGE)
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE
  const endIndex = startIndex + PHOTOS_PER_PAGE
  const currentPhotos = demoPhotos.slice(startIndex, endIndex)

  const handlePhotoClick = (index: number) => {
    // Ajuster l'index pour tenir compte de la pagination
    const actualIndex = startIndex + index
    setLightboxIndex(actualIndex)
  }

  const handleCloseModal = () => {
    setLightboxIndex(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 200, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  if (demoPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <Image
          src="/Logos/camera2.svg"
          alt="Aucune photo"
          width={64}
          height={64}
          className="w-16 h-16 mx-auto mb-4 opacity-50"
        />
        <p className="text-gray-500">Aucune photo disponible en mode démonstration</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {currentPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => handlePhotoClick(index)}
            className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <Image
              src={photo.demoUrl || photo.preview_s3_url}
              alt="Photo de surf"
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                console.error('Erreur de chargement image:', photo.demoUrl || photo.preview_s3_url)
                console.error('Photo complète:', photo)
              }}
              onLoad={() => {
                console.log('Image chargée avec succès:', photo.demoUrl || photo.preview_s3_url)
              }}
            />
            
            {/* Overlay simple */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
              <div className="text-white text-center">
                <p className="text-xs font-medium">
                  {photo.gallery?.name}
                </p>
                <p className="text-xs opacity-75">
                  {new Date(photo.gallery?.date || '').toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal Lightbox */}
      {lightboxIndex !== null && (
        <DemoPhotoLightboxModal
          isOpen={true}
          onClose={handleCloseModal}
          photos={demoPhotos}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}