'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SupabaseImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onError?: () => void
  onClick?: () => void
  sizes?: string
}

export function SupabaseImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  onError,
  onClick,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: SupabaseImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Pour les images Supabase, on utilise unoptimized pour éviter les erreurs de cache
  const isSupabaseUrl = src.includes('supabase.co')

  const handleError = () => {
    setError(true)
    setLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setLoading(false)
  }

  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("object-cover", className)}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
        sizes={sizes}
        unoptimized={isSupabaseUrl}
        quality={isSupabaseUrl ? 100 : 80}
      />
    </div>
  )
}