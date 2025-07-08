"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SupabaseImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  src: string
  fallbackSrc?: string
  onLoadingComplete?: () => void
}

export function SupabaseImage({ 
  src, 
  fallbackSrc,
  alt,
  className,
  onLoadingComplete,
  ...props 
}: SupabaseImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Utiliser directement l'URL sans passer par le proxy Next.js pour éviter les erreurs de cache
  const directSrc = imgSrc?.includes('supabase.co') 
    ? imgSrc 
    : imgSrc

  return (
    <>
      {isLoading && (
        <div className={cn("absolute inset-0 bg-gray-200 animate-pulse", className)} />
      )}
      <Image
        {...props}
        src={directSrc}
        alt={alt}
        className={cn(
          className,
          isLoading && "opacity-0",
          hasError && "opacity-50"
        )}
        onLoad={() => {
          setIsLoading(false)
          setHasError(false)
          onLoadingComplete?.()
        }}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc)
          }
        }}
        unoptimized={imgSrc?.includes('supabase.co')} // Désactiver l'optimisation pour les images Supabase
      />
    </>
  )
}