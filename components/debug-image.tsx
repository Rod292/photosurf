'use client'

import Image from 'next/image'
import { useState } from 'react'

interface DebugImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
}

export function DebugImage({ src, alt, className, fill, sizes }: DebugImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    return (
      <div className={`${className} bg-red-100 flex flex-col items-center justify-center p-4 text-center`}>
        <div className="text-red-600 text-sm font-medium mb-2">Image failed to load</div>
        <div className="text-xs text-gray-600 break-all">{src}</div>
        <button 
          onClick={() => {
            setHasError(false)
            setIsLoading(true)
          }}
          className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center`}>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        onError={(e) => {
          console.error('Image failed to load:', src, e)
          setHasError(true)
          setIsLoading(false)
        }}
        onLoad={() => {
          setIsLoading(false)
        }}
      />
    </div>
  )
}