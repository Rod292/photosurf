"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface PhotosBySchool {
  school: {
    id: number
    name: string
    slug: string
  }
  galleries: Array<{
    id: string
    name: string
    photoCount: number
    coverPhoto?: string
  }>
  totalPhotos: number
}

export function PhotosBySchool() {
  const [schoolGroups, setSchoolGroups] = useState<PhotosBySchool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPhotosBySchool() {
      try {
        const response = await fetch('/api/photos-by-school')
        if (response.ok) {
          const data = await response.json()
          setSchoolGroups(data.schoolGroups || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotosBySchool()
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          🏄‍♂️ Écoles de surf {'>'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (schoolGroups.length === 0) {
    return null
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          🏄‍♂️ Écoles de surf {'>'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {schoolGroups.map((schoolGroup) => (
          <Link
            key={schoolGroup.school.id}
            href={`/gallery?school=${encodeURIComponent(schoolGroup.school.name)}`}
            className="group"
          >
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Image de couverture */}
              <div className="relative h-48 overflow-hidden">
                {schoolGroup.galleries[0]?.coverPhoto ? (
                  <Image
                    src={schoolGroup.galleries[0].coverPhoto}
                    alt={`Photos ${schoolGroup.school.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-4xl">🏄‍♂️</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Badge avec nombre total de photos */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {schoolGroup.totalPhotos} photo{schoolGroup.totalPhotos > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Nom de l'école en bas */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">
                    {schoolGroup.school.name}
                  </h3>
                </div>
              </div>
              
              {/* Informations */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {schoolGroup.galleries.length} session{schoolGroup.galleries.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-blue-600 font-semibold">
                    Voir tout →
                  </span>
                </div>
                
                {/* Aperçu des dernières sessions */}
                <div className="space-y-1">
                  {schoolGroup.galleries.slice(0, 2).map((gallery) => (
                    <div key={gallery.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 truncate">
                        {gallery.name}
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        {gallery.photoCount}
                      </span>
                    </div>
                  ))}
                  
                  {schoolGroup.galleries.length > 2 && (
                    <div className="text-xs text-gray-400 text-center pt-1">
                      +{schoolGroup.galleries.length - 2} autre{schoolGroup.galleries.length - 2 > 1 ? 's' : ''} session{schoolGroup.galleries.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 