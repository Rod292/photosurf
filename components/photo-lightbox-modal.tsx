"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { Photo } from "@/lib/database.types"
import { useToast } from "@/hooks/use-toast"
import { MobilePhotoViewer } from "./mobile-photo-viewer"

interface PhotoLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
  currentIndex: number
  onNavigate: (index: number) => void
}

const PRODUCT_OPTIONS = [
  {
    id: 'digital',
    label: 'Photo Numérique',
    price: 15,
    description: 'Téléchargement haute résolution'
  },
  {
    id: 'print',
    label: 'Tirage A4',
    price: 25,
    description: 'Impression professionnelle A4'
  },
  {
    id: 'bundle',
    label: 'Numérique + Tirage A4',
    price: 35,
    description: 'Pack complet (économie de 5€)'
  }
] as const

export function PhotoLightboxModal({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNavigate
}: PhotoLightboxModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('digital')
  const [isMobile, setIsMobile] = useState(false)
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const currentPhoto = photos[currentIndex]

  useEffect(() => {
    const checkMobile = () => {
      // Considérer comme mobile si largeur < 768px OU si c'est un appareil tactile en mode portrait
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isPortrait = window.innerWidth < window.innerHeight
      const isSmallScreen = window.innerWidth < 768
      const isTabletPortrait = window.innerWidth < 1024 && isPortrait && isTouchDevice
      
      setIsMobile(isSmallScreen || isTabletPortrait)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onNavigate(newIndex)
  }

  const handleNext = () => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }

  const handleAddToCart = () => {
    if (!currentPhoto) return

    const selectedOption = PRODUCT_OPTIONS.find(option => option.id === selectedProduct)
    if (!selectedOption) return

    addItem({
      photo_id: currentPhoto.id,
      product_type: selectedProduct as 'digital' | 'print' | 'bundle',
      price: selectedOption.price,
      preview_url: currentPhoto.preview_s3_url,
      filename: currentPhoto.filename
    })

    toast({
      title: "Photo ajoutée au panier !",
      description: `${selectedOption.label} - ${selectedOption.price}€`,
      duration: 4000,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (!currentPhoto) return null

  // Use mobile viewer on mobile devices
  if (isMobile) {
    return (
      <MobilePhotoViewer
        isOpen={isOpen}
        onClose={onClose}
        photos={photos}
        currentIndex={currentIndex}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {currentPhoto.filename}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Photo {currentIndex + 1} sur {photos.length}
            </p>
          </DialogHeader>

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Image section */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
              <Image
                src={currentPhoto.preview_s3_url}
                alt={currentPhoto.filename}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              
              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Purchase options sidebar */}
            <div className="w-full lg:w-80 bg-gradient-to-b from-white to-gray-50 p-6 border-l shadow-inner">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Options d'achat</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              
              <RadioGroup 
                value={selectedProduct} 
                onValueChange={setSelectedProduct}
                className="space-y-3"
              >
                {PRODUCT_OPTIONS.map((option, index) => (
                  <div key={option.id} className="group relative">
                    <div className="flex items-start space-x-4 p-4 border-2 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer group-hover:border-blue-300">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1.5 scale-110" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={option.id} 
                          className="text-base font-semibold cursor-pointer text-gray-900 group-hover:text-blue-700 transition-colors"
                        >
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {option.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xl font-bold text-blue-600">
                            {formatPrice(option.price)}
                          </p>
                          {index === 2 && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Économie 5€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={handleAddToCart}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Shopping Cart"
                  width={18}
                  height={18}
                  className="h-5 w-5 mr-3 inline-block"
                />
                Ajouter au panier
              </Button>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Astuce
                    </p>
                    <p className="text-sm text-blue-800">
                      Le pack Numérique + Tirage vous fait économiser 5€ !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 