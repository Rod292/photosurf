'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onError?: () => void
  onClick?: () => void
  sizes?: string
  placeholder?: React.ReactNode
}

export function LazyImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  onError,
  onClick,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0,
        rootMargin: '50px'
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [priority])

  const handleError = () => {
    setHasError(true)
    setHasLoaded(true)
    onError?.()
  }

  const handleLoad = () => {
    setHasLoaded(true)
  }

  // Pour les images Supabase, on utilise unoptimized pour éviter les erreurs de cache
  const isSupabaseUrl = src.includes('supabase.co')

  if (hasError) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-white text-center">
          <div className="text-2xl mb-1">📷</div>
          <div className="text-xs">En cours...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative", className)} onClick={onClick}>
      {/* Placeholder pendant le chargement */}
      {(!isInView || !hasLoaded) && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg"
          style={{ width, height }}
        >
          {placeholder || (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      )}
      
      {/* Image réelle */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("object-cover", className, {
            "opacity-0": !hasLoaded,
            "opacity-100 transition-opacity duration-300": hasLoaded
          })}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
          sizes={sizes}
          unoptimized={isSupabaseUrl}
          quality={isSupabaseUrl ? 100 : 80}
        />
      )}
    </div>
  )
}