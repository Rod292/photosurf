"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ShoppingCart, Check } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { Photo } from "@/lib/database.types"
import { cn } from "@/lib/utils"

interface MobilePhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
  currentIndex: number
  onNavigate: (index: number) => void
}

const PRODUCT_OPTIONS = [
  { id: 'digital', label: 'Numérique', price: 15 },
  { id: 'print', label: 'Tirage A4', price: 25 },
  { id: 'bundle', label: 'Pack Complet', price: 35 }
] as const

export function MobilePhotoViewer({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNavigate
}: MobilePhotoViewerProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('digital')
  const [showOptions, setShowOptions] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem, items } = useCartStore()

  const currentPhoto = photos[currentIndex]

  useEffect(() => {
    if (currentPhoto) {
      const isInCart = items.some(item => 
        item.photo_id === currentPhoto.id && 
        item.product_type === selectedProduct
      )
      setAddedToCart(isInCart)
    }
  }, [currentPhoto, selectedProduct, items])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onNavigate(newIndex)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }

  const handleAddToCart = () => {
    if (!currentPhoto || addedToCart) return

    const selectedOption = PRODUCT_OPTIONS.find(option => option.id === selectedProduct)
    if (!selectedOption) return

    addItem({
      photo_id: currentPhoto.id,
      product_type: selectedProduct as 'digital' | 'print' | 'bundle',
      price: selectedOption.price,
      preview_url: currentPhoto.preview_s3_url,
      filename: currentPhoto.filename
    })

    setAddedToCart(true)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    
    if (e.key === 'ArrowLeft') {
      handlePrevious(e as any)
    } else if (e.key === 'ArrowRight') {
      handleNext(e as any)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  if (!isOpen || !currentPhoto) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-full"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Photo counter */}
        <div className="absolute top-4 left-4 z-50 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Main photo display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhoto.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-[85%] h-[70%] max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentPhoto.preview_s3_url}
                alt={currentPhoto.filename}
                fill
                className="object-contain rounded-lg"
                sizes="85vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Side areas for closing and navigation */}
          {/* Left side area */}
          <div
            className="absolute left-0 top-0 w-[7.5%] h-full cursor-pointer"
            onClick={onClose}
          />

          {/* Right side area */}
          <div
            className="absolute right-0 top-0 w-[7.5%] h-full cursor-pointer"
            onClick={onClose}
          />

          {/* Navigation areas */}
          {photos.length > 1 && (
            <>
              {/* Left navigation area */}
              <div
                className="absolute left-[7.5%] top-0 w-[20%] h-full flex items-center justify-center cursor-pointer"
                onClick={handlePrevious}
              >
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Right navigation area */}
              <div
                className="absolute right-[7.5%] top-0 w-[20%] h-full flex items-center justify-center cursor-pointer"
                onClick={handleNext}
              >
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <ChevronRight className="h-6 w-6 text-white" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom purchase bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-safe"
          onClick={(e) => e.stopPropagation()}
        >
          {!showOptions ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{currentPhoto.filename}</p>
                <p className="text-sm text-gray-600">
                  {PRODUCT_OPTIONS.find(opt => opt.id === selectedProduct)?.label} - {PRODUCT_OPTIONS.find(opt => opt.id === selectedProduct)?.price}€
                </p>
              </div>
              <button
                onClick={() => setShowOptions(true)}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all",
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white active:scale-95"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4 inline mr-2" />
                    Ajouté
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 inline mr-2" />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-gray-900 mb-2">Choisir une option :</p>
              <div className="space-y-2">
                {PRODUCT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedProduct(option.id)
                      setShowOptions(false)
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all",
                      selectedProduct === option.id
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 border-2 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.label}</span>
                      <span className="font-bold text-blue-600">{option.price}€</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowOptions(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleAddToCart()
                    setShowOptions(false)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-full font-medium active:scale-95"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}