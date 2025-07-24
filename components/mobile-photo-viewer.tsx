"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Check, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { Photo } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { HeartButton } from "@/components/ui/heart-button"
import { getNextPhotoPrice, calculateDeliveryPrice, formatPrice as formatPriceUtil } from "@/lib/pricing"

interface MobilePhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
  currentIndex: number
  onNavigate: (index: number) => void
}

const DIGITAL_OPTION = {
  id: 'digital',
  label: 'Photo Numérique',
  price: 15,
  description: 'Téléchargement haute résolution'
}

const SESSION_PACK_OPTION = {
  id: 'session_pack',
  label: 'Pack Session Illimité',
  price: 40,
  description: 'Toutes vos photos numériques'
}

const PRINT_OPTIONS = [
  {
    id: 'print_polaroid_3',
    label: 'Polaroid x3',
    dimensions: '7,9 x 7,9 cm (cadre 8,8 x 10,7 cm)',
    price: 15
  },
  {
    id: 'print_polaroid_6',
    label: 'Polaroid x6',
    dimensions: '7,9 x 7,9 cm (cadre 8,8 x 10,7 cm)',
    price: 20
  },
  {
    id: 'print_a5',
    label: 'A5',
    dimensions: '14,8 cm x 21,0 cm',
    price: 20
  },
  {
    id: 'print_a4',
    label: 'A4',
    dimensions: '21,0 cm x 29,7 cm',
    price: 30
  },
  {
    id: 'print_a3',
    label: 'A3',
    dimensions: '29,7 cm x 42,0 cm',
    price: 50
  },
  {
    id: 'print_a2',
    label: 'A2',
    dimensions: '42,0 cm x 59,4 cm',
    price: 80
  }
] as const

export function MobilePhotoViewer({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNavigate
}: MobilePhotoViewerProps) {
  const [selectedProductType, setSelectedProductType] = useState<'digital' | 'print' | 'session_pack'>('digital')
  const [selectedPrintFormat, setSelectedPrintFormat] = useState<string>('print_polaroid_3')
  const [showOptions, setShowOptions] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const { addItem, addSessionPack, clearCart, removeItem, items } = useCartStore()
  const { toast } = useToast()

  // Vérifier si le pack session est déjà dans le panier
  const hasSessionPack = () => {
    return items.some(item => item.product_type === 'session_pack')
  }

  const getSelectedProduct = () => {
    if (selectedProductType === 'digital') {
      return DIGITAL_OPTION
    }
    if (selectedProductType === 'session_pack') {
      return SESSION_PACK_OPTION
    }
    return PRINT_OPTIONS.find(option => option.id === selectedPrintFormat) || PRINT_OPTIONS[0]
  }

  // Calculer le prix pour la photo numérique
  const getDigitalPhotoPrice = () => {
    // Si le pack session est déjà dans le panier, les photos numériques sont gratuites
    if (hasSessionPack()) {
      return 0
    }
    const currentPhotoCount = items.filter(item => item.product_type === 'digital').length
    const currentTotal = items.filter(item => item.product_type === 'digital').reduce((sum, item) => sum + item.price, 0)
    return getNextPhotoPrice(currentPhotoCount, 'digital', currentTotal)
  }

  // Calculer le prix pour le pack session
  const getSessionPackPrice = () => {
    // Le pack session ne peut être ajouté qu'une seule fois
    if (hasSessionPack()) {
      return 0 // Déjà dans le panier
    }
    return SESSION_PACK_OPTION.price
  }

  // Calculer le prix pour le tirage sélectionné
  const getPrintPhotoPrice = () => {
    const currentPhotoCount = items.filter(item => item.product_type === selectedPrintFormat).length
    const currentTotal = items.filter(item => item.product_type === selectedPrintFormat).reduce((sum, item) => sum + item.price, 0)
    return getNextPhotoPrice(currentPhotoCount, selectedPrintFormat as 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6', currentTotal)
  }

  // Calculer le prix pour cette photo selon sa position dans le panier
  const getPhotoPrice = () => {
    if (selectedProductType === 'digital') {
      return getDigitalPhotoPrice()
    }
    if (selectedProductType === 'session_pack') {
      return getSessionPackPrice()
    }
    if (selectedProductType === 'print') {
      return getPrintPhotoPrice()
    }
    return 0
  }

  // Calculer le prix de livraison
  const getDeliveryPrice = () => {
    if (selectedProductType === 'digital' || selectedProductType === 'session_pack') return 0
    return calculateDeliveryPrice(selectedPrintFormat, deliveryOption)
  }

  const currentPhoto = photos[currentIndex]

  // Vérifier si la photo est déjà dans le panier
  const isPhotoInCart = () => {
    if (selectedProductType === 'session_pack') {
      // Pour le pack session, le bouton ne devrait être vert que si le pack est dans le panier
      // et que cette photo spécifique était celle utilisée pour l'ajout
      const sessionPackItem = items.find(item => item.product_type === 'session_pack')
      return sessionPackItem?.photo_id === currentPhoto.id
    }
    
    const productId = selectedProductType === 'digital' ? 'digital' : selectedPrintFormat
    return items.some(item => 
      item.photo_id === currentPhoto.id && item.product_type === productId
    )
  }

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
    if (!currentPhoto) return

    const selectedOption = getSelectedProduct()
    if (!selectedOption) return

    // Gestion spéciale pour le pack session
    if (selectedProductType === 'session_pack') {
      if (hasSessionPack()) {
        toast({
          title: "Pack déjà dans le panier",
          description: "Le Pack Session Illimité est déjà ajouté",
          variant: "destructive",
          duration: 4000,
        })
        return
      }

      // Compter les photos numériques qui vont être remplacées
      const digitalPhotosCount = items.filter(item => item.product_type === 'digital').length
      
      addSessionPack({
        photo_id: currentPhoto.id, // On associe le pack à cette photo comme référence
        product_type: 'session_pack' as any,
        price: SESSION_PACK_OPTION.price,
        preview_url: currentPhoto.preview_s3_url,
        filename: `Pack Session Illimité`,
        delivery_option: undefined,
        delivery_price: 0
      })

      const message = digitalPhotosCount > 0 
        ? `${selectedOption.label} - ${formatPriceUtil(SESSION_PACK_OPTION.price)} (${digitalPhotosCount} photo${digitalPhotosCount > 1 ? 's' : ''} numérique${digitalPhotosCount > 1 ? 's' : ''} remplacée${digitalPhotosCount > 1 ? 's' : ''})`
        : `${selectedOption.label} - ${formatPriceUtil(SESSION_PACK_OPTION.price)}`

      toast({
        title: "Pack ajouté au panier !",
        description: message,
        duration: 4000,
      })
      return
    }

    const productId = selectedProductType === 'digital' ? 'digital' : selectedPrintFormat

    // Vérifier si cette photo est déjà dans le panier pour ce type de produit
    const existingItem = items.find(item => 
      item.photo_id === currentPhoto.id && item.product_type === productId
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

    // Calculer le prix selon le nombre de photos actuelles dans le panier et le total actuel
    const photoPrice = getPhotoPrice()
    
    // Calculer les frais de livraison si c'est un tirage
    const deliveryPrice = selectedProductType === 'print' ? getDeliveryPrice() : 0
    
    addItem({
      photo_id: currentPhoto.id,
      product_type: productId as 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6',
      price: photoPrice,
      preview_url: currentPhoto.preview_s3_url,
      filename: currentPhoto.filename,
      delivery_option: selectedProductType === 'print' ? deliveryOption : undefined,
      delivery_price: deliveryPrice
    })

    toast({
      title: "Photo ajoutée au panier !",
      description: `${selectedOption.label} - ${formatPriceUtil(photoPrice)}${deliveryPrice > 0 ? ` + ${formatPriceUtil(deliveryPrice)} livraison` : ''}`,
      duration: 4000,
    })
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearCartConfirm(false)
    toast({
      title: "Panier vidé",
      description: "Toutes les photos ont été supprimées du panier",
      duration: 3000,
    })
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

  // Reset options panel when changing photos
  useEffect(() => {
    setShowOptions(false)
    setSelectedProductType('digital')
  }, [currentIndex])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  if (!isOpen || !currentPhoto) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm"
      >

        {/* Exit indicator - above the photo */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-white text-[11px] font-medium">
              clique pour sortir
            </span>
          </div>
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
              className="relative w-[90%] h-[65%] max-w-sm"
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
              
              {/* Photo counter - top left on image */}
              <div className="absolute top-2 left-8 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-white text-[10px] font-medium">
                  {currentIndex + 1} / {photos.length}
                </span>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Close areas - top and bottom only */}
          <div
            className="absolute top-0 left-0 right-0 h-[17.5%] cursor-pointer"
            onClick={onClose}
          />
          {/* Bottom close area - exclude the button panel area */}
          {!showOptions && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[35%] cursor-pointer"
              onClick={onClose}
            />
          )}

          {/* Navigation areas - left and right, avoiding close zones */}
          {photos.length > 1 && (
            <>
              {/* Left navigation area */}
              <div
                className={cn(
                  "absolute left-0 w-[40%] flex items-center justify-start pl-4 cursor-pointer",
                  showOptions 
                    ? "top-[17.5%] bottom-0" 
                    : "top-[17.5%] bottom-[35%]"
                )}
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6 text-white drop-shadow-lg" />
              </div>

              {/* Right navigation area */}
              <div
                className={cn(
                  "absolute right-0 w-[40%] flex items-center justify-end pr-4 cursor-pointer",
                  showOptions 
                    ? "top-[17.5%] bottom-0" 
                    : "top-[17.5%] bottom-[35%]"
                )}
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            </>
          )}
        </div>

        {/* Bottom blurred panel with buttons */}
        {!showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-white/20 backdrop-blur-md border-t border-white/30 p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between max-w-sm mx-auto">
              {/* Cart button - left side */}
              <button
                onClick={() => setShowOptions(true)}
                className={cn(
                  "px-4 py-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-medium",
                  isPhotoInCart()
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-800 border border-gray-300"
                )}
              >
                {isPhotoInCart() ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping Cart"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    <span>Ajouter</span>
                  </>
                )}
              </button>

              {/* Center buttons */}
              <div className="flex items-center gap-2">
                {/* Clear cart button - only show if cart has items */}
                {items.length > 0 && (
                  <button
                    onClick={() => setShowClearCartConfirm(true)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-600 border border-red-200 shadow-sm transition-all active:scale-95 hover:bg-red-500/20"
                    title="Vider le panier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                {/* Heart button - right side */}
                <HeartButton 
                  photo={{
                    id: currentPhoto.id,
                    gallery_id: currentPhoto.gallery_id,
                    gallery_name: currentPhoto.gallery?.name,
                    preview_url: currentPhoto.preview_s3_url
                  }}
                  size="md"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Options panel */}
        {showOptions && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pb-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="text-xs text-gray-600 text-center">
                <p>1ère photo : 10€ • 2ème photo : 7€ • 3ème+ : 5€ • <span className="text-purple-600 font-medium">Photos illimitées : 40€</span></p>
              </div>
              <div className="space-y-2">
                {/* Photo Numérique */}
                <button
                  onClick={() => setSelectedProductType('digital')}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all border-2 shadow-sm",
                    selectedProductType === 'digital'
                      ? "bg-blue-50 border-blue-500 shadow-md"
                      : "bg-gray-50 border-gray-300 hover:border-gray-400"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{DIGITAL_OPTION.label}</span>
                      <p className="text-sm text-gray-600">{DIGITAL_OPTION.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">
                        {hasSessionPack() ? 'Gratuit' : formatPrice(getDigitalPhotoPrice())}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Pack Session Illimité */}
                <button
                  onClick={() => !hasSessionPack() && setSelectedProductType('session_pack')}
                  disabled={hasSessionPack()}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all border-2 shadow-sm",
                    hasSessionPack()
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                      : selectedProductType === 'session_pack'
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-500 shadow-md"
                        : "bg-gray-50 border-gray-300 hover:border-gray-400"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${hasSessionPack() ? 'text-gray-500' : ''}`}>
                          {SESSION_PACK_OPTION.label} {hasSessionPack() ? '✓' : '🎁'}
                        </span>
                        {hasSessionPack() && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Retirer le pack du panier
                              const packInCart = items.find(item => item.product_type === 'session_pack');
                              if (packInCart) {
                                removeItem(packInCart.photo_id, 'session_pack');
                                toast({
                                  title: "Pack retiré",
                                  description: "Le Pack Session Illimité a été retiré du panier",
                                  duration: 3000,
                                });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors ml-2"
                            title="Retirer le pack du panier"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className={`text-sm ${hasSessionPack() ? 'text-gray-400' : 'text-gray-600'}`}>
                        {hasSessionPack() ? 'Déjà ajouté au panier' : SESSION_PACK_OPTION.description}
                      </p>
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        💰 Économisez jusqu'à 50% sur vos photos !
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-600">
                        {hasSessionPack() ? 'Ajouté' : formatPrice(getSessionPackPrice())}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Tirage avec menu déroulant */}
                <div className={cn(
                  "w-full p-4 rounded-xl transition-all border-2 shadow-sm",
                  selectedProductType === 'print'
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-gray-50 border-gray-300 hover:border-gray-400"
                )}>
                  <button
                    onClick={() => setSelectedProductType('print')}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Tirage photo</span>
                        <p className="text-sm text-gray-600">Impression professionnelle + JPEG inclus</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">
                          {selectedProductType === 'print' ? formatPrice(getPrintPhotoPrice()) : 'À partir de 15€'}
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  {/* Menu déroulant pour les formats */}
                  {selectedProductType === 'print' && (
                    <div className="mt-3">
                      <select
                        value={selectedPrintFormat}
                        onChange={(e) => setSelectedPrintFormat(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm"
                      >
                        {PRINT_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label} - {option.dimensions} - {option.price}€
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Options de livraison pour les tirages */}
              {selectedProductType === 'print' && (
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
                      <div className="text-xs text-gray-600">+ {formatPriceUtil(calculateDeliveryPrice(selectedPrintFormat, 'delivery'))}</div>
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowOptions(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium min-h-[44px] active:scale-95"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleAddToCart()
                    setShowOptions(false)
                  }}
                  disabled={isPhotoInCart()}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg font-medium min-h-[44px] active:scale-95",
                    isPhotoInCart()
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  )}
                >
                  {isPhotoInCart() ? 'Ajouté' : 'Confirmer'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clear cart confirmation modal */}
        {showClearCartConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
            onClick={() => setShowClearCartConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vider le panier ?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Cette action supprimera toutes les photos de votre panier. Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearCartConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium active:scale-95"
                  >
                    Vider
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}