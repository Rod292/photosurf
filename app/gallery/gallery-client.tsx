"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"
import { HeartButton } from "@/components/ui/heart-button"
import { useCartStore } from "@/context/cart-context"
import { getNextPhotoPrice } from "@/lib/pricing"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

const PHOTOS_PER_PAGE = 50

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "Date invalide"
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Date invalide"
  
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric", 
    month: "long",
    year: "numeric"
  })
}

export function GalleryClient({ latestPhotos, galleries, schoolName, dateFilter }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null)
  
  // Move cart store hook to component level
  const cartItems = useCartStore((state) => state.items)
  const { addItem } = useCartStore((state) => ({ addItem: state.addItem }))
  
  // Helper function to check if photo is in cart
  const isPhotoInCart = (photoId: string) => {
    return cartItems.some(item => 
      item.photo_id === photoId && item.product_type === 'digital'
    )
  }

  // Filtrer les photos par galerie sélectionnée si applicable
  const filteredPhotos = selectedGallery 
    ? latestPhotos.filter(photo => {
        // Trouver la galerie correspondante dans les galleries
        const gallery = galleries.find(g => g.id === selectedGallery)
        return gallery && photo.galleries.name === gallery.name
      })
    : latestPhotos

  // Transformer les photos pour être compatibles avec PhotoLightboxModal
  const formattedPhotos = filteredPhotos.map(photo => ({
    id: photo.id,
    preview_s3_url: photo.preview_s3_url,
    filename: photo.galleries.name || "Photo de surf",
    original_s3_key: "",
    filesize: 0,
    content_type: "image/jpeg",
    created_at: new Date().toISOString(),
    gallery_id: ""
  }))

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE)
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE
  const endIndex = startIndex + PHOTOS_PER_PAGE
  const currentPhotos = filteredPhotos.slice(startIndex, endIndex)

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

  const handleGalleryFilter = (galleryId: string | null) => {
    setSelectedGallery(galleryId)
    setCurrentPage(1) // Reset à la première page lors du changement de filtre
  }

  if (!schoolName && !dateFilter) {
    return null // Pour les cas où on n'est pas dans le mode école ou date
  }

  // Formatage de la date pour l'affichage
  const formatDisplayDate = formatDate

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
                  {/* Bouton pour voir toutes les photos */}
                  <button 
                    onClick={() => handleGalleryFilter(null)}
                    className={`group flex-shrink-0 ${selectedGallery === null ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="w-28 h-40 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                      <div className="w-full h-full relative">
                        {/* Utiliser la première photo disponible comme image de couverture */}
                        {latestPhotos.length > 0 ? (
                          <Image
                            src={latestPhotos[0].preview_s3_url}
                            alt="Toutes les photos"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Image
                              src="/Logos/camera2.svg"
                              alt="Toutes les photos"
                              width={24}
                              height={24}
                              className="w-6 h-6"
                              style={{ filter: 'brightness(0) invert(1)' }}
                            />
                          </div>
                        )}
                        
                        {/* Overlay avec texte */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs font-medium text-center drop-shadow-sm">
                            Toutes les photos
                          </p>
                        </div>
                        
                        {/* Badge photo count total */}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <span className="text-xs font-medium text-gray-700">
                            {latestPhotos.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      {dateFilter ? "Toutes sessions" : "Toutes photos"}
                    </p>
                  </button>
                  
                  {galleries.map((gallery: any) => (
                    <button 
                      key={gallery.id}
                      onClick={() => handleGalleryFilter(gallery.id)}
                      className={`group flex-shrink-0 ${selectedGallery === gallery.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="w-28 h-40 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                        <div className="w-full h-full relative">
                          {/* Photo de session ou fallback */}
                          {gallery.photos && gallery.photos.length > 0 ? (
                            <Image
                              src={gallery.photos[0].preview_s3_url}
                              alt={gallery.name}
                              fill
                              className="object-cover"
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
                        {gallery.date ? new Date(gallery.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short"
                        }) : "Date invalide"}
                      </p>
                    </button>
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
              ? `Photos du ${formatDisplayDate(dateFilter)}${selectedGallery ? ' - ' + galleries.find(g => g.id === selectedGallery)?.name : ''}`
              : `Photos récentes${selectedGallery ? ' - ' + galleries.find(g => g.id === selectedGallery)?.name : ''}`}
          </h2>
          
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
              <p className="text-gray-600">Aucune photo disponible pour le moment</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentPhotos.map((photo: any, index: number) => (
                  <div
                    key={photo.id}
                    className="group relative w-full pt-[150%] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <button
                      onClick={() => handlePhotoClick(index)}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={photo.preview_s3_url}
                        alt={`Photo de ${photo.galleries.name || 'surf'}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                    
                    {/* Cart button - positioned in top left */}
                    <div 
                      className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          const isInCart = isPhotoInCart(photo.id)
                          if (!isInCart) {
                            // Ajouter la photo numérique au panier via Zustand
                            const digitalPhotoCount = cartItems.filter(item => item.product_type === 'digital').length;
                            const currentTotal = cartItems.filter(item => item.product_type === 'digital').reduce((sum, item) => sum + item.price, 0);
                            const price = getNextPhotoPrice(digitalPhotoCount, 'digital', currentTotal);
                            
                            addItem({
                              photo_id: photo.id,
                              product_type: 'digital',
                              price: price,
                              preview_url: photo.preview_s3_url,
                              filename: photo.filename,
                              delivery_option: undefined,
                              delivery_price: 0
                            });
                          }
                        }}
                        className={`w-8 h-8 p-0 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                          isPhotoInCart(photo.id)
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-white/90 hover:bg-white text-gray-700'
                        }`}
                        title={isPhotoInCart(photo.id) ? "Déjà dans le panier" : "Ajouter au panier"}
                        disabled={isPhotoInCart(photo.id)}
                      >
                        {isPhotoInCart(photo.id) ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <Image
                            src="/Logos/shopping-cart.svg"
                            alt="Ajouter au panier"
                            width={16}
                            height={16}
                            className="h-4 w-4"
                          />
                        )}
                      </button>
                    </div>

                    {/* Heart button - positioned in top right */}
                    <div 
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HeartButton 
                        photo={{
                          id: photo.id,
                          gallery_id: selectedGallery || '',
                          gallery_name: photo.galleries.name,
                          preview_url: photo.preview_s3_url
                        }}
                        size="sm"
                      />
                    </div>
                    
                    {/* Date overlay - positioned at bottom */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 pointer-events-none">
                      <div className="text-white text-center">
                        <p className="text-sm font-medium">
                          {photo.galleries?.date ? new Date(photo.galleries.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : "Date invalide"}
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
            </>
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