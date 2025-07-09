'use client'

import { useEffect, useRef, useState } from 'react'
import { LazyImage } from './ui/lazy-image'

interface DemoPhotoItemProps {
  photoId: string
  preview_s3_url: string
  original_s3_key: string
  galleryName?: string
  galleryDate?: string
  onClick: () => void
  priority?: boolean
  demoUrl?: string | null
}

// Fonction helper pour construire l'URL publique du bucket originals
const getOriginalUrl = (original_s3_key: string) => {
  if (!original_s3_key) return null
  return `https://chwddsmqzjzpfikuupuf.supabase.co/storage/v1/object/public/originals/${original_s3_key}`
}

export function DemoPhotoItem({
  photoId,
  preview_s3_url,
  original_s3_key,
  galleryName,
  galleryDate,
  onClick,
  priority = false,
  demoUrl
}: DemoPhotoItemProps) {
  const originalUrl = demoUrl || getOriginalUrl(original_s3_key)

  const handleClick = () => {
    onClick()
  }

  return (
    <div
      onClick={handleClick}
      className="group relative aspect-[2/3] overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* Utiliser directement l'URL d'origine pour de meilleures performances */}
      <LazyImage
        src={originalUrl || preview_s3_url}
        alt="Photo de surf"
        width={400}
        height={600}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        priority={priority}
      />
      
      
      {/* Overlay simple */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
        <div className="text-white text-center">
          <p className="text-xs font-medium">
            {galleryName}
          </p>
          <p className="text-xs opacity-75">
            {galleryDate && new Date(galleryDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  )
}