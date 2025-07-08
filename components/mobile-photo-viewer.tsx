"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { Photo } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getNextPhotoPrice, calculateDeliveryPrice } from "@/lib/pricing"

interface MobilePhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
  currentIndex: number
  onNavigate: (index: number) => void
}

const PRODUCT_OPTIONS = [
  { id: 'digital', label: 'Photo Numérique', price: 15, description: 'Téléchargement haute résolution' },
  { id: 'print_a5', label: 'Tirage A5', price: 20, description: 'Impression A5 + JPEG inclus' },
  { id: 'print_a4', label: 'Tirage A4', price: 30, description: 'Impression A4 + JPEG inclus' },
  { id: 'print_a3', label: 'Tirage A3', price: 50, description: 'Impression A3 + JPEG inclus' },
  { id: 'print_a2', label: 'Tirage A2', price: 80, description: 'Impression A2 + JPEG inclus' }
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const { addItem, items } = useCartStore()
  const { toast } = useToast()

  // Calculer le prix dynamique selon le nombre d'éléments dans le panier
  const getDynamicPrice = (productType: string) => {
    if (productType === 'digital') {
      // Compter seulement les photos numériques pour le pricing dynamique
      const digitalPhotosCount = items.filter(item => item.product_type === 'digital').length
      return getNextPhotoPrice(digitalPhotosCount, 'digital')
    } else {
      // Pour les tirages, prix fixe
      const option = PRODUCT_OPTIONS.find(opt => opt.id === productType)
      return option?.price || 15
    }
  }

  // Calculer le prix de livraison
  const getDeliveryPrice = (productType: string) => {
    if (productType === 'digital') return 0
    return calculateDeliveryPrice(productType, deliveryOption)
  }

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
    setSwipeDirection('right')
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onNavigate(newIndex)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSwipeDirection('left')
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }

  const handleAddToCart = () => {
    if (!currentPhoto || addedToCart) return

    const selectedOption = PRODUCT_OPTIONS.find(option => option.id === selectedProduct)
    if (!selectedOption) return

    const dynamicPrice = getDynamicPrice(selectedProduct)
    const deliveryPrice = getDeliveryPrice(selectedProduct)

    addItem({
      photo_id: currentPhoto.id,
      product_type: selectedProduct as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2',
      price: dynamicPrice,
      preview_url: currentPhoto.preview_s3_url,
      filename: currentPhoto.filename,
      delivery_option: selectedProduct !== 'digital' ? deliveryOption : undefined,
      delivery_price: deliveryPrice > 0 ? deliveryPrice : undefined
    })

    toast({
      title: "Photo ajoutée au panier !",
      description: `${selectedOption.label} - ${dynamicPrice}€${deliveryPrice > 0 ? ` + ${deliveryPrice}€ livraison` : ''}`,
      duration: 3000,
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

  // Reset swipe direction after animation
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [swipeDirection])

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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={swipeDirection}>
            <motion.div
              key={currentPhoto.id}
              custom={swipeDirection}
              initial={{
                x: swipeDirection === 'left' ? '100%' : swipeDirection === 'right' ? '-100%' : 0
              }}
              animate={{
                x: 0
              }}
              exit={{
                x: swipeDirection === 'left' ? '-100%' : swipeDirection === 'right' ? '100%' : 0
              }}
              transition={{
                duration: 0
              }}
              className="relative w-[85%] h-[70%] max-w-md"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 800
                if (swipe) {
                  if (offset.x > 0) {
                    setSwipeDirection('right')
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
                    onNavigate(newIndex)
                  } else {
                    setSwipeDirection('left')
                    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
                    onNavigate(newIndex)
                  }
                }
              }}
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
                <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
              </div>

              {/* Right navigation area */}
              <div
                className="absolute right-[7.5%] top-0 w-[20%] h-full flex items-center justify-center cursor-pointer"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
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
                  {PRODUCT_OPTIONS.find(opt => opt.id === selectedProduct)?.label} - {getDynamicPrice(selectedProduct)}€
                  {getDeliveryPrice(selectedProduct) > 0 && ` + ${getDeliveryPrice(selectedProduct)}€ livraison`}
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
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping Cart"
                      width={16}
                      height={16}
                      className="h-4 w-4 inline mr-2"
                    />
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
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all",
                      selectedProduct === option.id
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 border-2 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">{getDynamicPrice(option.id)}€</span>
                        {getDeliveryPrice(option.id) > 0 && (
                          <p className="text-xs text-gray-500">+ {getDeliveryPrice(option.id)}€ livraison</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Options de livraison pour les tirages */}
              {selectedProduct !== 'digital' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Options de livraison :</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setDeliveryOption('pickup')}
                      className={cn(
                        "w-full p-2 rounded text-left text-sm transition-all",
                        deliveryOption === 'pickup'
                          ? "bg-blue-100 border border-blue-300 text-blue-700"
                          : "bg-white border border-gray-200 text-gray-700"
                      )}
                    >
                      <div className="font-medium">Récupération à La Torche Surf School</div>
                      <div className="text-xs text-gray-600">Gratuit</div>
                    </button>
                    <button
                      onClick={() => setDeliveryOption('delivery')}
                      className={cn(
                        "w-full p-2 rounded text-left text-sm transition-all",
                        deliveryOption === 'delivery'
                          ? "bg-blue-100 border border-blue-300 text-blue-700"
                          : "bg-white border border-gray-200 text-gray-700"
                      )}
                    >
                      <div className="font-medium">Livraison à domicile</div>
                      <div className="text-xs text-gray-600">+ {getDeliveryPrice(selectedProduct)}€</div>
                    </button>
                  </div>
                </div>
              )}
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
                  disabled={addedToCart}
                >
                  {addedToCart ? 'Ajouté' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}