"use client"

import { useState } from "react"
import Image from "next/image"
import { Gallery, Photo } from "@/lib/database.types"
import { PhotoLightboxModal } from "@/components/photo-lightbox-modal"
import { CartSlideOver } from "@/components/cart-slide-over"

interface GalleryClientProps {
  photos: Photo[]
  gallery: Gallery
}

export function GalleryClient({ photos, gallery }: GalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barre d'actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Photos de la session
          </h2>
        </div>
        <CartSlideOver />
      </div>


      {/* Galerie de photos */}
      {photos.length > 0 ? (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={photo.preview_s3_url}
                    alt={photo.filename}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Overlay avec watermark */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium opacity-70">
                    Arode Studio
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <p className="font-semibold text-blue-600">15€</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">🖼️ Tirage A4</h4>
            <p className="text-sm text-gray-600 mb-2">
              Impression professionnelle sur papier photo
            </p>
            <p className="font-semibold text-blue-600">25€</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
            <h4 className="font-medium mb-2">🎁 Pack Complet</h4>
            <p className="text-sm text-gray-600 mb-2">
              Numérique + Tirage A4 (économie de 5€)
            </p>
            <p className="font-semibold text-blue-600">35€</p>
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