"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

// Mock data pour les dernières photos
const latestPhotos = [
  {
    id: "1",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode.jpg-4zAe9Jv5Ilkq5g7JzIH8mHoeusllQ5.jpeg",
    alt: "Session de surf La Torche - Matin",
    galleryId: "1"
  },
  {
    id: "2", 
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode3.jpg-Ewu1fTeEgnPkO1luTPm21XTxmmhIPK.jpeg",
    alt: "Session de surf La Torche - Après-midi",
    galleryId: "1"
  },
  {
    id: "3",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode4.jpg-70CUfejJb0gE5JwCk3oOs8xLol5AhS.jpeg", 
    alt: "Session de surf Penhors",
    galleryId: "2"
  },
  {
    id: "4",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cadre.jpg-rsUlwefP6JP0REBu5BHmpR27LyVLBG.jpeg",
    alt: "Session de surf Le Guilvinec",
    galleryId: "1"
  }
]

export function LatestPhotosSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      }
    }

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollContainer.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className="mb-12">
      <h2 className="text-4xl font-bold mb-12 text-center font-dm-sans-handgloves relative">
        <span className="relative inline-block">
          Dernières Sessions
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
        </span>
      </h2>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {latestPhotos.map((photo, index) => (
          <Link
            key={photo.id}
            href="/gallery"
            className="group flex-shrink-0 relative"
          >
            <div className="w-64 h-48 relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 256px, 256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium truncate">{photo.alt}</p>
                <p className="text-xs opacity-90">Cliquez pour voir plus</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Link 
          href="/gallery"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300 font-medium"
        >
          Voir toutes les galeries
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  )
} 