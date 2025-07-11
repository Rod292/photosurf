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
import { motion } from "framer-motion"
import { getNextPhotoPrice, formatPrice as formatPriceUtil, calculateSavingsPercentage, calculateDeliveryPrice } from "@/lib/pricing"

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
    id: 'print_a5',
    label: 'Tirage A5',
    price: 20,
    description: 'Impression A5 + JPEG inclus'
  },
  {
    id: 'print_a4',
    label: 'Tirage A4',
    price: 30,
    description: 'Impression A4 + JPEG inclus'
  },
  {
    id: 'print_a3',
    label: 'Tirage A3',
    price: 50,
    description: 'Impression A3 + JPEG inclus'
  },
  {
    id: 'print_a2',
    label: 'Tirage A2',
    price: 80,
    description: 'Impression A2 + JPEG inclus'
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
  const [quantity, setQuantity] = useState(1)
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [isMobile, setIsMobile] = useState(false)
  const { addItem, items } = useCartStore()
  const { toast } = useToast()

  const currentPhoto = photos[currentIndex]

  useEffect(() => {
    const checkMobile = () => {
      // Considérer comme mobile uniquement pour les petits écrans
      // iPad et tablettes utiliseront le layout desktop
      const isSmallScreen = window.innerWidth < 768
      
      console.log('PhotoLightbox - Screen width:', window.innerWidth, 'isMobile:', isSmallScreen)
      setIsMobile(isSmallScreen)
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

    // Vérifier si cette photo est déjà dans le panier pour ce type de produit
    const existingItem = items.find(item => 
      item.photo_id === currentPhoto.id && item.product_type === selectedProduct
    )
    
    if (existingItem) {
      toast({
        title: "Photo déjà dans le panier",
        description: "Cette photo est déjà ajoutée pour ce type de produit",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    // Calculer le prix selon le nombre de photos actuelles dans le panier
    const currentPhotoCount = items.filter(item => item.product_type === selectedProduct).length
    const photoPrice = getNextPhotoPrice(currentPhotoCount, selectedProduct as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2')
    
    // Calculer les frais de livraison si c'est un tirage
    const deliveryPrice = selectedProduct !== 'digital' ? calculateDeliveryPrice(selectedProduct, deliveryOption) : 0
    
    addItem({
      photo_id: currentPhoto.id,
      product_type: selectedProduct as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2',
      price: photoPrice,
      preview_url: currentPhoto.preview_s3_url,
      filename: currentPhoto.filename,
      delivery_option: selectedProduct !== 'digital' ? deliveryOption : undefined,
      delivery_price: deliveryPrice
    })

    toast({
      title: "Photo ajoutée au panier !",
      description: `${selectedOption.label} - ${formatPriceUtil(photoPrice)}`,
      duration: 4000,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  // Calculer le prix pour cette photo selon sa position dans le panier
  const getPhotoPrice = () => {
    const currentPhotoCount = items.filter(item => item.product_type === selectedProduct).length
    return getNextPhotoPrice(currentPhotoCount, selectedProduct as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2')
  }

  // Vérifier si la photo est déjà dans le panier
  const isPhotoInCart = () => {
    return items.some(item => 
      item.photo_id === currentPhoto.id && item.product_type === selectedProduct
    )
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
      <DialogContent 
        className="max-w-5xl w-[95vw] h-[95vh] md:h-[90vh] p-0"
        style={{
          animation: 'none', // Disable default dialog animation
        }}
      >
        <DialogTitle className="sr-only">
          Aperçu de la photo {currentPhoto.filename}
        </DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full"
        >
        <div className="flex flex-col h-full">
          {/* Main content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Image section */}
            <div className="flex-1 relative bg-gray-100 flex items-center justify-center min-h-0">
              {/* Photo counter overlay */}
              <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full z-10">
                {currentIndex + 1} / {photos.length}
              </div>
              <div className="relative w-full h-full max-w-none max-h-none">
                <Image
                  src={currentPhoto.preview_s3_url}
                  alt={currentPhoto.filename}
                  fill
                  className="object-cover md:object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 66vw"
                  priority
                />
              </div>
              
              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  >
                    <motion.button
                      className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <motion.button
                      className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                      onClick={handleNext}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Purchase options sidebar */}
            <motion.div 
              className="w-full md:w-80 bg-gradient-to-b from-white to-gray-50 p-3 md:p-6 border-l md:border-l md:border-t-0 border-t shadow-inner overflow-y-auto max-h-[65vh] md:max-h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="mb-3 md:mb-4">
                <div className="mb-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Galerie</h4>
                  <p className="text-sm font-medium text-gray-800">{currentPhoto.filename}</p>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Options d'achat</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              
              <RadioGroup 
                value={selectedProduct} 
                onValueChange={setSelectedProduct}
                className="space-y-1"
              >
                {PRODUCT_OPTIONS.map((option, index) => (
                  <div key={option.id} className="group relative">
                    <div 
                      className="flex items-start space-x-2 p-2 border-2 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer group-hover:border-blue-300"
                      onClick={() => setSelectedProduct(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} className="mt-0.5 scale-90 pointer-events-none" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={option.id} 
                          className="text-sm font-semibold cursor-pointer text-gray-900 group-hover:text-blue-700 transition-colors pointer-events-none"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-gray-600 leading-tight pointer-events-none">
                          {option.description}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-base font-bold text-blue-600 pointer-events-none">
                            {selectedProduct === option.id ? formatPrice(getPhotoPrice()) : formatPrice(option.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {/* Options de livraison pour les tirages */}
              {selectedProduct !== 'digital' && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Options de livraison</h3>
                  <div className="space-y-1">
                    <div 
                      className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                        deliveryOption === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDeliveryOption('pickup')}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={deliveryOption === 'pickup'}
                        onChange={() => setDeliveryOption('pickup')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-sm font-medium">🏄‍♂️ Récupération</span>
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">GRATUIT</span>
                        </div>
                        <p className="text-xs text-gray-600">La Torche Surf School</p>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                        deliveryOption === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setDeliveryOption('delivery')}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="delivery"
                        checked={deliveryOption === 'delivery'}
                        onChange={() => setDeliveryOption('delivery')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-sm font-medium">📦 Livraison</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">
                            +{formatPriceUtil(calculateDeliveryPrice(selectedProduct, 'delivery'))}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Tube carton sécurisé</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleAddToCart}
                disabled={isPhotoInCart()}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                size="default"
              >
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Shopping Cart"
                  width={16}
                  height={16}
                  className="h-4 w-4 mr-2 inline-block"
                />
                {isPhotoInCart() ? "Déjà dans le panier" : "Ajouter au panier"}
              </Button>

              <div className="mt-2 p-1.5 bg-gradient-to-r from-green-50 to-blue-50 rounded-md border border-green-200">
                <p className="text-xs text-center text-gray-700">
                  💰 <strong>Réductions dégressives :</strong> 2ème photo 10€ • 3ème+ photos 5€
                </p>
              </div>
              
              {/* Padding en bas pour éviter que le bouton soit coupé */}
              <div className="pb-6 md:pb-0"></div>
            </motion.div>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 