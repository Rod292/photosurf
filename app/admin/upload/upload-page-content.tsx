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

  const handleGalleryRenamed = async () => {
    // Refetch galleries after rename
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Nouveau Upload</h2>
        </div>
        <PhotoUploadForm surfSchools={surfSchools} galleries={galleries} />
      </div>
      
      {/* Gallery List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Galeries Existantes</h2>
        </div>
        <GalleryList galleries={galleries} onGalleryDeleted={handleGalleryDeleted} onGalleryRenamed={handleGalleryRenamed} />
      </div>
    </div>
  )
}