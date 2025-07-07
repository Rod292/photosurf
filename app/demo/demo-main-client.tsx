"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gallery, Photo } from "@/lib/database.types"
import { DemoPhotoLightboxModal } from "@/components/demo-photo-lightbox-modal"

interface DemoMainClientProps {
  galleries: Gallery[]
}

interface DemoPhoto extends Photo {
  demoUrl?: string
  expiresAt?: string
}

export function DemoMainClient({ galleries }: DemoMainClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [demoPhotos, setDemoPhotos] = useState<DemoPhoto[]>([])
  const [loading, setLoading] = useState(true)

  // Extraire toutes les photos de toutes les galeries
  const allPhotos: DemoPhoto[] = []

  useEffect(() => {
    async function loadDemoUrls() {
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

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index)
  }

  const handleCloseModal = () => {
    setLightboxIndex(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {demoPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => handlePhotoClick(index)}
            className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <Image
              src={photo.demoUrl || photo.preview_s3_url}
              alt="Photo de surf - Mode démo"
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay avec info demo */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
              <div className="text-white text-center">
                <p className="text-xs font-medium">
                  {photo.gallery?.name}
                </p>
                <p className="text-xs opacity-75">
                  {new Date(photo.gallery?.date || '').toLocaleDateString('fr-FR')}
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