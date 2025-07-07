"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Gallery, Photo } from "@/lib/database.types"
import { DemoPhotoLightboxModal } from "@/components/demo-photo-lightbox-modal"
import { Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DemoGalleryClientProps {
  gallery: Gallery
  photos: Photo[]
}

interface DemoPhoto extends Photo {
  demoUrl?: string
  expiresAt?: string
}

export function DemoGalleryClient({ gallery, photos }: DemoGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [demoPhotos, setDemoPhotos] = useState<DemoPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUrls, setLoadingUrls] = useState(false)

  useEffect(() => {
    // Initialiser avec les photos de base
    setDemoPhotos(photos)
    setLoading(false)
  }, [photos])

  const loadDemoUrls = async () => {
    if (photos.length === 0) return

    setLoadingUrls(true)
    try {
      const response = await fetch(`/api/demo-photos?galleryId=${gallery.id}`)
      
      if (response.ok) {
        const data = await response.json()
        
        const updatedPhotos = photos.map(photo => {
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
      }
    } catch (error) {
      console.error('Erreur lors du chargement des URLs demo:', error)
    } finally {
      setLoadingUrls(false)
    }
  }

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index)
  }

  const handleCloseModal = () => {
    setLightboxIndex(null)
  }

  const downloadAllPhotos = () => {
    demoPhotos.forEach((photo, index) => {
      if (photo.demoUrl) {
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = photo.demoUrl!
          link.download = photo.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 500) // Étaler les téléchargements pour éviter la surcharge
      }
    })
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

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Image
          src="/Logos/camera2.svg"
          alt="Aucune photo"
          width={64}
          height={64}
          className="w-16 h-16 mx-auto mb-4 opacity-50"
        />
        <h3 className="text-xl font-semibold mb-2">Aucune photo dans cette galerie</h3>
        <p className="text-gray-600">Cette session ne contient pas encore de photos.</p>
      </div>
    )
  }

  const hasAnyDemoUrl = demoPhotos.some(photo => photo.demoUrl)

  return (
    <>
      {/* Actions de galerie */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {gallery.name} - Mode Démonstration
          </h2>
          <p className="text-gray-600">
            {photos.length} photo{photos.length > 1 ? 's' : ''} disponible{photos.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {!hasAnyDemoUrl && (
            <Button 
              onClick={loadDemoUrls}
              disabled={loadingUrls}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              {loadingUrls ? 'Chargement...' : 'Charger en HD'}
            </Button>
          )}
          
          {hasAnyDemoUrl && (
            <Button 
              onClick={downloadAllPhotos}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Tout télécharger
            </Button>
          )}
        </div>
      </div>

      {/* Grille de photos */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {demoPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => handlePhotoClick(index)}
            className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <Image
              src={photo.demoUrl || photo.preview_s3_url}
              alt={`Photo ${index + 1} - ${gallery.name}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badge HD si URL demo disponible */}
            {photo.demoUrl && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                HD
              </div>
            )}
            
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center">
                <Eye className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs">Voir en grand</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info sur les URLs signées */}
      {hasAnyDemoUrl && (
        <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">Informations sur le mode démonstration</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Photos haute résolution sans watermark</li>
            <li>• URLs temporaires sécurisées (expiration dans 2h)</li>
            <li>• Téléchargement individuel ou en lot disponible</li>
            <li>• Toutes les fonctionnalités de panier restent actives</li>
          </ul>
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