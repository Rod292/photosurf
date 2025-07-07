"use client"

import { useState } from 'react'
import { PhotoUploadForm } from './upload-form'
import { GalleryList } from './gallery-list'
import { SurfSchool, Gallery } from '@/lib/database.types'
import { fetchGalleries } from './actions'

interface UploadPageContentProps {
  initialSurfSchools: SurfSchool[]
  initialGalleries: Gallery[]
}

export function UploadPageContent({ initialSurfSchools, initialGalleries }: UploadPageContentProps) {
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries)
  const [surfSchools] = useState<SurfSchool[]>(initialSurfSchools)

  const handleGalleryDeleted = async () => {
    // Refetch galleries after deletion
    try {
      const updatedGalleries = await fetchGalleries()
      setGalleries(updatedGalleries)
    } catch (error) {
      console.error('Error refetching galleries:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouveau Upload</h2>
        <PhotoUploadForm surfSchools={surfSchools} galleries={galleries} />
      </div>
      
      {/* Gallery List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <GalleryList galleries={galleries} onGalleryDeleted={handleGalleryDeleted} />
      </div>
    </div>
  )
}