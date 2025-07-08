"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Gallery, Photo } from "@/lib/database.types"
import { DemoPhotoLightboxModal } from "@/components/demo-photo-lightbox-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SupabaseImage } from "@/components/ui/supabase-image"

interface DemoMainClientProps {
  galleries: any[]
}

interface DemoPhoto extends Photo {
  demoUrl?: string
  expiresAt?: string
  created_at?: string
  gallery?: {
    id: string
    name: string
    date: string
    school_id?: number
  }
}

const PHOTOS_PER_PAGE = 50

export function DemoMainClient({ galleries }: DemoMainClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [demoPhotos, setDemoPhotos] = useState<DemoPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Extraire toutes les photos de toutes les galeries et les trier par date de création
  const allPhotos: DemoPhoto[] = galleries
    .flatMap((gallery: any) => 
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
    .sort((a, b) => {
      // Trier par date de galerie puis par date de création de la photo
      const dateA = new Date(a.gallery?.date || 0).getTime()
      const dateB = new Date(b.gallery?.date || 0).getTime()
      if (dateA !== dateB) return dateB - dateA // Plus récent en premier
      
      // Si même date de galerie, trier par created_at
      const createdA = new Date(a.created_at || 0).getTime()
      const createdB = new Date(b.created_at || 0).getTime()
      return createdB - createdA
    })

  useEffect(() => {
    async function loadDemoUrls() {
      console.log('Demo photos disponibles:', allPhotos.length)
      
      if (allPhotos.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Charger les URLs demo par batch de 20 photos pour éviter trop de requêtes
        const batchSize = 20
        const photoBatches = []
        
        for (let i = 0; i < allPhotos.length; i += batchSize) {
          photoBatches.push(allPhotos.slice(i, i + batchSize))
        }

        const updatedPhotos = [...allPhotos]
        let loadedCount = 0

        // Charger les URLs par batch pour éviter de surcharger l'API
        for (const batch of photoBatches) {
          try {
            const photoIds = batch.map(p => p.id).join(',')
            const response = await fetch(`/api/demo-photos?photoIds=${photoIds}`)
            
            if (response.ok) {
              const data = await response.json()
              
              // Mettre à jour les URLs demo
              if (data.photos && Array.isArray(data.photos)) {
                data.photos.forEach((demoPhoto: any) => {
                  const index = updatedPhotos.findIndex(p => p.id === demoPhoto.photoId)
                  if (index !== -1) {
                    updatedPhotos[index] = {
                      ...updatedPhotos[index],
                      demoUrl: demoPhoto.demoUrl,
                      expiresAt: demoPhoto.expiresAt
                    }
                    loadedCount++
                  }
                })
              }
            } else {
              console.warn(`Erreur lors du chargement du batch: ${response.status}`)
            }
          } catch (batchError) {
            console.warn('Erreur lors du chargement d\'un batch:', batchError)
            // Continuer avec les autres batchs
          }
        }

        console.log(`URLs demo chargées: ${loadedCount}/${allPhotos.length}`)
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
  }, [allPhotos.length])

  // Filtrer les photos par date si une date est sélectionnée
  const filteredPhotos = selectedDate 
    ? demoPhotos.filter(photo => photo.gallery?.date === selectedDate)
    : demoPhotos

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE)
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE
  const endIndex = startIndex + PHOTOS_PER_PAGE
  const currentPhotos = filteredPhotos.slice(startIndex, endIndex)

  const handlePhotoClick = (index: number) => {
    // Ajuster l'index pour tenir compte de la pagination et du filtrage
    const actualIndex = startIndex + index
    // Trouver l'index dans la liste complète des photos
    const photoId = currentPhotos[index].id
    const globalIndex = demoPhotos.findIndex(photo => photo.id === photoId)
    setLightboxIndex(globalIndex)
  }

  const handleDateFilter = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date)
    setCurrentPage(1) // Reset pagination when filtering
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
      <div className="space-y-8">
        {/* Sélecteur de dates - Petites cartes de jours horizontales */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[...new Map(galleries.map((gallery: any) => [gallery.date, gallery])).values()]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((gallery: any) => (
            <button 
              key={gallery.date} 
              onClick={() => handleDateFilter(gallery.date)}
              className="flex-shrink-0"
            >
              <div className={`w-32 bg-white rounded-lg border transition-all duration-300 cursor-pointer ${
                selectedDate === gallery.date 
                  ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
                  : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="relative h-32 rounded-t-lg overflow-hidden">
                  {gallery.photos && gallery.photos.length > 0 ? (
                    <SupabaseImage
                      src={gallery.photos[0].preview_s3_url}
                      alt={`Photos du ${new Date(gallery.date).toLocaleDateString('fr-FR')}`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <Image
                        src="/Logos/camera2.svg"
                        alt="Camera"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  )}
                  
                  <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <span className="text-xs font-medium text-gray-700">
                      {galleries.filter((g: any) => g.date === gallery.date).length}
                    </span>
                  </div>
                </div>
                
                <div className="p-2">
                  <p className={`text-center text-xs font-medium ${
                    selectedDate === gallery.date ? 'text-purple-600' : 'text-black'
                  }`}>
                    {new Date(gallery.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Toutes les photos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedDate 
                ? `Photos du ${new Date(selectedDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}`
                : 'Toutes les photos'
              }
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Voir toutes les photos
              </button>
            )}
          </div>
          
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Image
                src="/Logos/camera2.svg"
                alt="Aucune photo"
                width={64}
                height={64}
                className="w-16 h-16 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-500">
                {selectedDate 
                  ? "Aucune photo disponible pour cette date"
                  : "Aucune photo disponible en mode démonstration"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <SupabaseImage
                    src={photo.demoUrl || photo.preview_s3_url}
                    alt="Photo de surf"
                    width={400}
                    height={600}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => console.error(`Erreur de chargement image: "${photo.demoUrl || photo.preview_s3_url}"`)}
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
          )}
        </div>
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