"use client"

import { useState } from "react"
import Image from "next/image"
import { SupabaseImage } from "@/components/ui/supabase-image"
import Link from "next/link"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PhotoGrid, PhotoCard, LoadingSkeleton } from "@/components/animations/photo-grid"
import { StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { AnimatedButton } from "@/components/animations/button-animations"
import { motion } from "framer-motion"

interface GalleryMainClientProps {
  galleries: any[]
}

const PHOTOS_PER_PAGE = 50

export function GalleryMainClient({ galleries }: GalleryMainClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Obtenir toutes les photos avec leurs galeries
  const allPhotos = galleries
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
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Filtrer les photos par date si une date est sélectionnée
  const filteredPhotos = selectedDate 
    ? allPhotos.filter(photo => photo.gallery?.date === selectedDate)
    : allPhotos

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
    const globalIndex = allPhotos.findIndex(photo => photo.id === photoId)
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
    // Scroll to top of photos section - instantané pour éviter les animations de page
    window.scrollTo({ top: 200, behavior: 'instant' })
  }

  return (
    <>
      <div className="space-y-8">
        {/* Petites cartes de jours horizontales */}
        <StaggerContainer className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" staggerDelay={0.05}>
          {[...new Map(galleries.map((gallery: any) => [gallery.date, gallery])).values()].map((gallery: any, index: number) => (
            <StaggerItem key={gallery.date}>
              <motion.button 
                onClick={() => handleDateFilter(gallery.date)}
                className="flex-shrink-0"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-32 bg-white rounded-lg border transition-all duration-300 cursor-pointer ${
                  selectedDate === gallery.date 
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
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
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
                    selectedDate === gallery.date ? 'text-blue-600' : 'text-black'
                  }`}>
                    {new Date(gallery.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
              </motion.button>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Toutes les photos chronologiques */}
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
              <AnimatedButton
                onClick={() => setSelectedDate(null)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                variant="subtle"
              >
                Voir toutes les photos
              </AnimatedButton>
            )}
          </div>
          
          {filteredPhotos.length === 0 ? (
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
              <p className="text-gray-600">
                {selectedDate 
                  ? "Aucune photo disponible pour cette date"
                  : "Aucune photo disponible pour le moment"
                }
              </p>
            </div>
          ) : (
            <PhotoGrid 
              key={`page-${currentPage}`} // Force remount sans animation lors du changement de page
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            >
              {currentPhotos.map((photo: any, index: number) => (
                <PhotoCard
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  index={index}
                >
                  <div className="absolute inset-0">
                    <SupabaseImage
                      src={photo.preview_s3_url}
                      alt="Photo de surf"
                      width={400}
                      height={600}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info overlay - sera masqué par l'overlay hover du PhotoCard */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <div className="text-white text-center">
                      <p className="text-sm font-medium drop-shadow-lg">
                        {photo.gallery?.name}
                      </p>
                      <p className="text-xs opacity-90 drop-shadow-lg">
                        {new Date(photo.gallery?.date || photo.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                </PhotoCard>
              ))}
            </PhotoGrid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              className="mt-8 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AnimatedButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="subtle"
              >
                <ChevronLeft className="w-5 h-5" />
              </AnimatedButton>
              
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
                    <AnimatedButton
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                      variant="subtle"
                    >
                      {pageNum}
                    </AnimatedButton>
                  );
                })}
              </div>
              
              <AnimatedButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="subtle"
              >
                <ChevronRight className="w-5 h-5" />
              </AnimatedButton>
            </motion.div>
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