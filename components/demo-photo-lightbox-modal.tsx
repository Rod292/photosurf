"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Eye, Download } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"
import { MobilePhotoViewer } from "./mobile-photo-viewer"

interface DemoPhoto {
  id: string
  gallery_id: string
  preview_s3_url: string
  original_s3_key: string
  filename: string
  demoUrl?: string
  expiresAt?: string
  gallery?: {
    id: string
    name: string
    date: string
  }
}

interface DemoPhotoLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  photos: DemoPhoto[]
  currentIndex: number
  onNavigate: (index: number) => void
}

const PRODUCT_OPTIONS = [
  {
    id: 'digital',
    label: 'Photo Numérique',
    description: 'Téléchargement haute résolution',
    price: 15
  },
  {
    id: 'print',
    label: 'Tirage Photo',
    description: 'Impression professionnelle A4',
    price: 25
  },
  {
    id: 'bundle',
    label: 'Numérique + Tirage',
    description: 'Téléchargement + impression',
    price: 35
  }
]

export function DemoPhotoLightboxModal({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNavigate
}: DemoPhotoLightboxModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('digital')
  const [isMobile, setIsMobile] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const currentPhoto = photos[currentIndex]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setImageLoading(true)
  }, [currentIndex])

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onNavigate(newIndex)
  }, [currentIndex, photos.length, onNavigate])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }, [currentIndex, photos.length, onNavigate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevious, handleNext, onClose])

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

  // Sur mobile, utiliser le composant mobile adapté
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
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          Photo de surf - {currentPhoto.filename}
        </DialogTitle>
        <div className="flex h-full bg-black">
          {/* Zone d'image principale */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            
            <Image
              src={currentPhoto.demoUrl || currentPhoto.preview_s3_url}
              alt={currentPhoto.filename}
              fill
              className="object-contain"
              onLoad={() => setImageLoading(false)}
            />

            {/* Navigation */}
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

            {/* Compteur de photos */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Sidebar des options d'achat */}
          <div className="w-full lg:w-80 bg-gray-50 p-6 border-l flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Options d'achat</h3>
            
            {/* Bouton de téléchargement démo */}
            
            <RadioGroup 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
              className="space-y-4 flex-1"
            >
              {PRODUCT_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        <div className="font-bold text-lg">{formatPrice(option.price)}</div>
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button 
              onClick={handleAddToCart}
              className="w-full mt-6"
              size="lg"
            >
              <Image
                src="/Logos/shopping-cart.svg"
                alt="Shopping Cart"
                width={16}
                height={16}
                className="h-4 w-4 mr-2 inline-block"
              />
              Ajouter au panier
            </Button>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Le pack Numérique + Tirage vous fait économiser 5€ !
              </p>
            </div>

            {/* Info photo */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Informations</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nom :</strong> {currentPhoto.filename}</p>
                {currentPhoto.gallery && (
                  <>
                    <p><strong>Session :</strong> {currentPhoto.gallery.name}</p>
                    <p><strong>Date :</strong> {new Date(currentPhoto.gallery.date).toLocaleDateString('fr-FR')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}