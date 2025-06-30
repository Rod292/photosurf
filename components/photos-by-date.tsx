"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryByDate {
  date: string
  galleries: Array<{
    id: string
    name: string
    photoCount: number
    coverPhoto?: string
  }>
}

export function PhotosByDate() {
  const [galleryGroups, setGalleryGroups] = useState<GalleryByDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGalleriesByDate() {
      try {
        const response = await fetch('/api/galleries-by-date')
        if (response.ok) {
          const data = await response.json()
          setGalleryGroups(data.galleryGroups || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleriesByDate()
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          📅 Sessions par jour {'>'}
        </h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-64 h-48 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (galleryGroups.length === 0) {
    return null
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📅 Sessions par jour {'>'}
        </h2>
      </div>
      
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {galleryGroups.map((group) => (
          <div key={group.date} className="flex-shrink-0">
            <div className="w-72 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              {/* Image de couverture */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                {group.galleries[0]?.coverPhoto ? (
                  <Image
                    src={group.galleries[0].coverPhoto}
                    alt={`Photos du ${new Date(group.date).toLocaleDateString('fr-FR')}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">📸</span>
                  </div>
                )}
                
                {/* Badge avec nombre de sessions */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {group.galleries.length} session{group.galleries.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {new Date(group.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
                
                <div className="space-y-2">
                  {group.galleries.slice(0, 2).map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/gallery/${gallery.id}`}
                      className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 truncate">
                          {gallery.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {gallery.photoCount} photo{gallery.photoCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                  
                  {group.galleries.length > 2 && (
                    <Link
                      href={`/gallery?date=${group.date}`}
                      className="block p-2 text-center text-sm text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      +{group.galleries.length - 2} autre{group.galleries.length - 2 > 1 ? 's' : ''} session{group.galleries.length - 2 > 1 ? 's' : ''}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 