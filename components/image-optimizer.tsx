"use client"

import { useEffect, useState } from "react"
import NextImage, { type ImageProps } from "next/image"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  lowQualitySrc?: string
}

export function OptimizedImage({ src, alt, lowQualitySrc, className, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(
    lowQualitySrc ||
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIyMjIyMiI+PC9yZWN0Pjwvc3ZnPg==",
  )

  useEffect(() => {
    // Précharger l'image en arrière-plan
    const img = new Image()
    img.src = src as string
    img.onload = () => {
      setCurrentSrc(src as string)
      setIsLoaded(true)
    }
  }, [src])

  return (
    <NextImage
      {...props}
      src={currentSrc || "/placeholder.svg"}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-60"} transition-opacity duration-300`}
    />
  )
}

