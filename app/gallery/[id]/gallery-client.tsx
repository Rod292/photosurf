"use client"

import { useState } from "react"
import Image from "next/image"
import { LazyImage } from "@/components/ui/lazy-image"
import { Gallery, Photo } from "@/lib/database.types"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"
import { useLazyLoad } from "@/hooks/use-lazy-load"

interface GalleryClientProps {
  photos: Photo[]
  gallery: Gallery
}

export function GalleryClient({ photos, gallery }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  const {
    visibleItems: visiblePhotos,
    sentinelRef,
    loadedCount,
    totalCount,
    hasMore
  } = useLazyLoad(photos, {
    loadAhead: 20,
    rootMargin: '100px'
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barre d'actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Photos de la session
          </h2>
        </div>
      </div>


      {/* Galerie de photos */}
      {photos.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {visiblePhotos.map((photo, visibleIndex) => {
              // Trouver l'index réel dans la liste complète
              const realIndex = photos.findIndex(p => p.id === photo.id)
              
              return (
                <div 
                  key={photo.id} 
                  className="cursor-pointer group"
                  onClick={() => setLightboxIndex(realIndex)}
                >
                  <div className="relative w-full pt-[150%] overflow-hidden rounded-lg bg-gray-200">
                    <div className="absolute inset-0">
                      <LazyImage
                        src={photo.preview_s3_url}
                        alt={photo.filename}
                        width={400}
                        height={600}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        priority={visibleIndex < 10}
                      />
                    </div>
                    {/* Overlay avec date */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                      <div className="text-white text-center">
                        <p className="text-sm font-medium">
                          {new Date(photo.created_at || gallery.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium opacity-70">
                      Arode Studio
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Sentinel pour charger plus */}
          {hasMore && (
            <div ref={sentinelRef} className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Chargement de {loadedCount}/{totalCount} photos...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune photo disponible
          </h3>
          <p className="text-gray-500">
            Les photos de cette session n'ont pas encore été uploadées.
          </p>
        </div>
      )}

      {/* Information sur les produits */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Nos produits</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Image
                src="/Logos/phone-logo.svg"
                alt="Phone"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              Photo Numérique
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Téléchargement haute résolution immédiat
            </p>
            <p className="font-semibold text-blue-600">10€ → 7€ → 5€</p>
            <p className="text-xs text-gray-500 mt-1">Prix dégressif selon la quantité</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">Pack Session Illimité : 40€</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Image
                src="/Logos/Imprimante.svg"
                alt="Print"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              Formats disponibles
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Impression professionnelle + JPEG haute résolution
            </p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-600">A5 + JPEG: 20€</p>
              <p className="text-sm font-medium text-blue-600">A4 + JPEG: 30€</p>
              <p className="text-sm font-medium text-blue-600">A3 + JPEG: 50€</p>
              <p className="text-sm font-medium text-blue-600">A2 + JPEG: 80€</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">Prix fixes, pas de dégressif</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Image
                src="/Logos/shopping-cart.svg"
                alt="Bundle"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              Recommandé
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Commencez par le numérique, ajoutez vos tirages ensuite
            </p>
            <p className="font-semibold text-blue-600">Numérique à partir de 5€</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">Ou Pack Session : 40€ illimité</p>
          </div>
        </div>
      </div>

      {/* Modal Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightboxModal
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
          photos={photos}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
} 