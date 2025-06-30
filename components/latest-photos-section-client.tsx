"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Photo, Gallery } from "@/lib/database.types"

// Interface pour les photos avec leurs galeries
interface PhotoWithGallery extends Photo {
  gallery?: Gallery
}

export function LatestPhotosSectionClient() {
  const [photos, setPhotos] = useState<PhotoWithGallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLatestPhotos() {
      try {
        const response = await fetch('/api/latest-photos')
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des photos')
        }
        const data = await response.json()
        setPhotos(data.photos || [])
      } catch (err) {
        console.error('Erreur:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-64 h-48 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
        ))}
      </div>
    )
  }

  if (error || photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-2xl font-semibold mb-4">Aucune photo disponible</h3>
        <p className="text-gray-600">Les premières photos seront bientôt disponibles !</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {photos.map((photo) => (
        <Link
          key={photo.id}
          href={`/gallery/${photo.gallery_id}`}
          className="group flex-shrink-0 relative"
        >
          <div className="w-64 h-48 relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Image
              src={photo.preview_s3_url}
              alt={photo.filename}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 256px, 256px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium truncate">
                {photo.gallery?.name || 'Session de surf'}
              </p>
              <p className="text-xs opacity-90">
                {photo.gallery?.date ? 
                  new Date(photo.gallery.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long'
                  }) 
                  : 'Cliquez pour voir plus'
                }
              </p>
            </div>
            
            {/* Watermark discret */}
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium opacity-70">
              Arode Studio
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 