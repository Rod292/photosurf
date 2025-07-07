"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { DemoPhotoLightboxModal } from "@/components/demo-photo-lightbox-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DemoPhoto {
  id: string
  gallery_id: string
  preview_s3_url: string
  original_s3_key: string
  filename: string
  demoUrl?: string
  expiresAt?: string
  galleries: {
    name: string
    date: string
  }
}

interface DemoClientProps {
  latestPhotos: DemoPhoto[]
  galleries: any[]
  schoolName?: string
  dateFilter?: string
}

const PHOTOS_PER_PAGE = 50

export function DemoClient({ latestPhotos, galleries, schoolName, dateFilter }: DemoClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [demoPhotos, setDemoPhotos] = useState<DemoPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadDemoUrls() {
      if (latestPhotos.length === 0) {
        setLoading(false)
        return
      }

      try {
        const photoIds = latestPhotos.map(p => p.id).join(',')
        const response = await fetch(`/api/demo-photos?photoIds=${photoIds}`)
        
        if (response.ok) {
          const data = await response.json()
          
          const updatedPhotos = latestPhotos.map(photo => {
            const demoPhoto = data.photos.find((dp: any) => dp.photoId === photo.id)
            return {
              ...photo,
              demoUrl: demoPhoto?.demoUrl,
              expiresAt: demoPhoto?.expiresAt
            }
          })
          
          setDemoPhotos(updatedPhotos)
        } else {
          console.error('Erreur lors du chargement des URLs demo')
          setDemoPhotos(latestPhotos)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des URLs demo:', error)
        setDemoPhotos(latestPhotos)
      } finally {
        setLoading(false)
      }
    }

    loadDemoUrls()
  }, [latestPhotos])

  // Pagination
  const totalPages = Math.ceil(demoPhotos.length / PHOTOS_PER_PAGE)
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE
  const endIndex = startIndex + PHOTOS_PER_PAGE
  const currentPhotos = demoPhotos.slice(startIndex, endIndex)

  const handlePhotoClick = (index: number) => {
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

  if (!schoolName && !dateFilter) {
    return null
  }

  const title = schoolName 
    ? `Photos de ${schoolName} - Mode Démo`
    : dateFilter 
    ? `Photos du ${new Date(dateFilter).toLocaleDateString('fr-FR')} - Mode Démo`
    : "Photos - Mode Démo"

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-dm-sans">
            {title}
          </h2>
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Photos haute qualité sans watermark
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : demoPhotos.length === 0 ? (
          <div className="text-center py-12">
            <Image
              src="/Logos/camera2.svg"
              alt="Aucune photo"
              width={64}
              height={64}
              className="w-16 h-16 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-semibold mb-2">Aucune photo trouvée</h3>
            <p className="text-gray-600 mb-4">
              Aucune photo ne correspond à vos critères de recherche en mode démonstration.
            </p>
            <Link 
              href="/demo"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Voir toutes les galeries
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {currentPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src={photo.demoUrl || photo.preview_s3_url}
                    alt="Photo de surf - Mode démo"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay avec badge HD */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                    <div className="text-white text-center">
                      <p className="text-xs font-medium">
                        {photo.galleries.name}
                      </p>
                      {photo.demoUrl && (
                        <p className="text-xs bg-green-500 px-2 py-1 rounded mt-1">
                          HD
                        </p>
                      )}
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

            {/* Info sur les galeries disponibles */}
            {galleries.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Galeries disponibles ({galleries.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleries.map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/demo/gallery/${gallery.id}`}
                      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
                    >
                      <h4 className="font-medium mb-1">{gallery.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(gallery.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {gallery.photos?.length || 0} photos
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
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
      </div>
    </div>
  )
}