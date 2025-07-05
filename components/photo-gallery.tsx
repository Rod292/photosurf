"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { PhotoModal } from "./photo-modal"
import { useCartStore, CartItem } from "@/context/cart-context"
import { ShoppingCart, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Photo {
  id: string
  src: string
  price: number
  date: string
  location: string
  surfer: string
  title: string
}

interface PhotoGalleryProps {
  locationFilter?: string
  limit?: number
  excludeIrlandeSession?: boolean
  surferFilter?: string | null
  currentPage: number
  setCurrentPage: (page: number) => void
}

export function PhotoGallery({
  locationFilter,
  limit,
  excludeIrlandeSession = false,
  surferFilter,
  currentPage,
  setCurrentPage,
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const [isMobile, setIsMobile] = useState(false)

  const isInCart = (photoId: string) => {
    return items.some(item => item.photo_id === photoId)
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const PHOTOS_PER_PAGE = limit || (isMobile ? 24 : 24)

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/photos")
        if (!response.ok) {
          throw new Error("Failed to fetch photos")
        }
        const data = await response.json()
        setPhotos(data)
      } catch (error) {
        console.error("Error fetching photos:", error)
        setError("Unable to load photos. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [setCurrentPage])

  const filteredPhotos = photos.filter((photo) => {
    if (
      excludeIrlandeSession &&
      (photo.id.includes("Irlande Session Photos/") || photo.id.includes("IrlandeSession/"))
    ) {
      return false
    }

    const matchesLocation = !locationFilter || photo.location === locationFilter
    const matchesSurfer = !surferFilter || photo.surfer === surferFilter

    return photo.src && photo.src.trim() !== "" && matchesLocation && matchesSurfer
  })

  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE)
  const paginatedPhotos = filteredPhotos.slice((currentPage - 1) * PHOTOS_PER_PAGE, currentPage * PHOTOS_PER_PAGE)

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setModalOpen(true)
  }

  // Calculate the potential price for a photo based on current cart state
  const calculatePotentialPrice = (photo: Photo): number => {
    // Simplify pricing for new system - use fixed price
    return 15 // Prix fixe pour le téléchargement numérique
  }

  const handleAddToCart = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    const price = calculatePotentialPrice(photo)
    const cartItem: CartItem = {
      photo_id: photo.id,
      product_type: 'digital',
      price: price,
      preview_url: photo.src,
      filename: photo.title
    }
    addItem(cartItem)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  if (filteredPhotos.length === 0) {
    return <div className="text-center text-gray-500 py-8">Aucune photo trouvée pour ce filtre.</div>
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPhotos.map((photo, index) => {
          const potentialPrice = calculatePotentialPrice(photo)
          const displayPrice = potentialPrice.toFixed(2)

          return (
            <div
              key={photo.id}
              className="cursor-pointer group relative w-full pt-[75%] rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="absolute inset-0">
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 4}
                  loading={index < 8 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIyMjIyMiI+PC9yZWN0Pjwvc3ZnPg=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg font-lexend-deca">
                      {potentialPrice === 0 ? "Gratuit" : `${displayPrice}€`}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, photo)}
                      disabled={isInCart(photo.id)}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full
                        transition-all duration-300 ease-out
                        ${isInCart(photo.id) ? "bg-green-500 text-white" : "bg-white text-gray-900 hover:bg-gray-100"}
                      `}
                    >
                      {isInCart(photo.id) ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            className="rounded-full"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {selectedPhoto && modalOpen && (
        <PhotoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          photo={{
            ...selectedPhoto,
            price: calculatePotentialPrice(selectedPhoto),
          }}
          onPrevious={() => {
            const currentIndex = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
            if (currentIndex > 0) {
              setSelectedPhoto(filteredPhotos[currentIndex - 1])
            }
          }}
          onNext={() => {
            const currentIndex = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
            if (currentIndex < filteredPhotos.length - 1) {
              setSelectedPhoto(filteredPhotos[currentIndex + 1])
            }
          }}
          hasPrevious={filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) > 0}
          hasNext={filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) < filteredPhotos.length - 1}
        />
      )}
    </>
  )
}

