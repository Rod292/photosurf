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
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Image
            src="/Logos/surfer.svg"
            alt="Surfer"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          Écoles de surf {'>'}
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
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Image
            src="/Logos/surfer.svg"
            alt="Surfer"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          Écoles de surf {'>'}
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
                    <Image
                      src="/Logos/surfer.svg"
                      alt="Surfer"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
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
              </div>
              
              {/* Nom de l'école sous la photo */}
              <div className="p-4">
                <h3 className="text-center font-semibold text-black">
                  {schoolGroup.school.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 