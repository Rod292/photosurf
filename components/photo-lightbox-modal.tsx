"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/context/cart-context"
import { Photo } from "@/lib/database.types"
import { useToast } from "@/hooks/use-toast"
import { MobilePhotoViewer } from "./mobile-photo-viewer"
import { HeartButton } from "@/components/ui/heart-button"
import { motion } from "framer-motion"
import { getNextPhotoPrice, formatPrice as formatPriceUtil, calculateSavingsPercentage, calculateDeliveryPrice, calculateDynamicPricing } from "@/lib/pricing"

interface PhotoLightboxModalProps {
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


const PRINT_OPTIONS = [
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
  },
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
  }
] as const

export function PhotoLightboxModal({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onNavigate
}: PhotoLightboxModalProps) {
  const [selectedProductType, setSelectedProductType] = useState<'digital' | 'print'>('digital')
  const [selectedPrintFormat, setSelectedPrintFormat] = useState<string>('print_a5')
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [showPack15Tooltip, setShowPack15Tooltip] = useState(false)
  const [showUnlimitedTooltip, setShowUnlimitedTooltip] = useState(false)
  
  const getSelectedProduct = () => {
    if (selectedProductType === 'digital') {
      return DIGITAL_OPTION
    }
    return PRINT_OPTIONS.find(option => option.id === selectedPrintFormat) || PRINT_OPTIONS[0]
  }
  const [isMobile, setIsMobile] = useState(false)
  const { addItem, removeItem, items } = useCartStore()
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

    const selectedOption = getSelectedProduct()
    if (!selectedOption) return

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
    const deliveryPrice = selectedProductType === 'print' ? calculateDeliveryPrice(productId, deliveryOption) : 0
    
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

  // Calculer le prix pour la photo numérique
  const getDigitalPhotoPrice = () => {
    const currentPhotoCount = items.filter(item => item.product_type === 'digital').length
    const currentTotal = items.filter(item => item.product_type === 'digital').reduce((sum, item) => sum + item.price, 0)
    return getNextPhotoPrice(currentPhotoCount, 'digital', currentTotal)
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
    if (selectedProductType === 'print') {
      return getPrintPhotoPrice()
    }
    return 0
  }

  // Vérifier si la photo est déjà dans le panier
  const isPhotoInCart = () => {
    const productId = selectedProductType === 'digital' ? 'digital' : selectedPrintFormat
    return items.some(item => 
      item.photo_id === currentPhoto.id && item.product_type === productId
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
        className="max-w-5xl w-[95vw] h-[95vh] md:h-[90vh] p-0 flex flex-col"
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
              className="w-full md:w-80 bg-gradient-to-b from-white to-gray-50 p-3 md:p-6 border-l md:border-l md:border-t-0 border-t shadow-inner flex flex-col min-h-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Header - fixed at top */}
              <div className="mb-3 md:mb-4 flex-shrink-0">
                <div className="mb-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Galerie</h4>
                  <p className="text-sm font-medium text-gray-800">{currentPhoto.filename}</p>
                </div>
                <div className="bg-white rounded-md p-2 shadow-sm border border-gray-200 mb-3">
                  <div className="flex items-center justify-center gap-2 text-xs mb-2">
                    <div className="text-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-green-600 font-bold text-xs">1</span>
                      </div>
                      <div className="font-bold text-green-600 text-xs">10€</div>
                    </div>
                    <div className="text-gray-300 text-xs">→</div>
                    <div className="text-center">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-orange-600 font-bold text-xs">2</span>
                      </div>
                      <div className="font-bold text-orange-600 text-xs">7€</div>
                    </div>
                    <div className="text-gray-300 text-xs">→</div>
                    <div className="text-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                        <span className="text-blue-600 font-bold text-xs">3+</span>
                      </div>
                      <div className="font-bold text-blue-600 text-xs">5€</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div 
                        className="bg-purple-50 border border-purple-200 rounded-md p-2 text-center cursor-pointer hover:bg-purple-100 transition-colors"
                        onMouseEnter={() => setShowPack15Tooltip(true)}
                        onMouseLeave={() => setShowPack15Tooltip(false)}
                        onClick={() => setShowPack15Tooltip(!showPack15Tooltip)}
                      >
                        <div className="h-3 flex items-center justify-center mb-1">
                          <Image
                            src="/Logos/camera2.svg"
                            alt="Pack 15 photos"
                            width={10}
                            height={10}
                            className="opacity-70"
                          />
                        </div>
                        <div className="font-bold text-purple-700 text-xs">Pack 15</div>
                        <div className="text-purple-600 font-bold text-xs">40€</div>
                      </div>
                      {showPack15Tooltip && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-300 rounded-md p-2 shadow-lg z-10">
                          <p className="text-xs text-red-600 font-medium text-center">
                            S'applique automatiquement dès que votre total atteint 40€
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <div 
                        className="bg-blue-50 border border-blue-200 rounded-md p-2 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                        onMouseEnter={() => setShowUnlimitedTooltip(true)}
                        onMouseLeave={() => setShowUnlimitedTooltip(false)}
                        onClick={() => setShowUnlimitedTooltip(!showUnlimitedTooltip)}
                      >
                        <div className="h-3 flex items-center justify-center mb-1">
                          <div className="text-xs">🎁</div>
                        </div>
                        <div className="font-bold text-blue-700 text-xs">Illimité</div>
                        <div className="text-blue-600 font-bold text-xs">69€</div>
                      </div>
                      {showUnlimitedTooltip && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-300 rounded-md p-2 shadow-lg z-10">
                          <p className="text-xs text-red-600 font-medium text-center">
                            S'applique automatiquement dès que votre total atteint 69€
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-red-600 italic text-center mt-2">
                  Ajoutez vos photos une à une, les prix de pack s'appliqueront automatiquement dans le panier
                </p>
              </div>
              
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-3">
                  {/* Photo Numérique */}
                  <div className="group relative">
                    <div 
                      className={`flex items-start space-x-2 p-3 border-2 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        selectedProductType === 'digital' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 group-hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedProductType('digital')}
                    >
                      <input
                        type="radio"
                        name="productType"
                        value="digital"
                        checked={selectedProductType === 'digital'}
                        onChange={() => setSelectedProductType('digital')}
                        className="mt-0.5 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <Label 
                          className="text-sm font-semibold cursor-pointer text-gray-900 group-hover:text-blue-700 transition-colors pointer-events-none"
                        >
                          {DIGITAL_OPTION.label}
                        </Label>
                        <p className="text-xs text-gray-600 leading-tight pointer-events-none">
                          {DIGITAL_OPTION.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-base font-bold text-blue-600 pointer-events-none">
                            {formatPrice(getDigitalPhotoPrice())}
                          </p>
                        </div>
                        
                        {/* Compteur pour débloquer les packs */}
                        {(() => {
                          const digitalPhotosCount = items.filter(item => item.product_type === 'digital').length;
                          const photosFor15Pack = Math.max(0, 8 - digitalPhotosCount);
                          const photosForUnlimited = Math.max(0, 14 - digitalPhotosCount);
                          
                          if (digitalPhotosCount >= 14) {
                            return (
                              <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-md border border-green-200">
                                <p className="text-xs font-bold text-green-700 text-center">
                                  🎁 Pack Illimité débloqué !
                                </p>
                              </div>
                            );
                          } else if (digitalPhotosCount >= 8) {
                            return (
                              <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border border-purple-200">
                                <p className="text-xs font-bold text-purple-700 text-center">
                                  📷 Pack 15 débloqué ! Encore <span className="text-orange-600">{photosForUnlimited}</span> photo{photosForUnlimited > 1 ? 's' : ''} pour le Pack Illimité
                                </p>
                              </div>
                            );
                          } else {
                            return (
                              <div className="mt-2 p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-md border border-orange-200">
                                <p className="text-xs font-bold text-orange-700 text-center">
                                  Encore <span className="text-orange-600">{photosFor15Pack}</span> photo{photosFor15Pack > 1 ? 's' : ''} pour débloquer le Pack 15
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>


                  {/* Tirage avec menu déroulant */}
                  <div className="group relative">
                    <div 
                      className={`flex items-start space-x-2 p-3 border-2 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        selectedProductType === 'print' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 group-hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedProductType('print')}
                    >
                      <input
                        type="radio"
                        name="productType"
                        value="print"
                        checked={selectedProductType === 'print'}
                        onChange={() => setSelectedProductType('print')}
                        className="mt-0.5 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <Label 
                          className="text-sm font-semibold cursor-pointer text-gray-900 group-hover:text-blue-700 transition-colors pointer-events-none"
                        >
                          Tirage photo
                        </Label>
                        <p className="text-xs text-gray-600 leading-tight pointer-events-none">
                          Impression professionnelle + JPEG inclus
                        </p>
                        
                        {/* Menu déroulant pour les formats */}
                        {selectedProductType === 'print' && (
                          <div className="mt-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <Select value={selectedPrintFormat} onValueChange={setSelectedPrintFormat}>
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Sélectionner un format" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRINT_OPTIONS.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium">{option.label}</span>
                                      <span className="text-xs text-gray-500 ml-2">{option.dimensions}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-base font-bold text-blue-600 pointer-events-none">
                            {selectedProductType === 'print' ? formatPrice(getPrintPhotoPrice()) : `À partir de ${formatPrice(Math.min(...PRINT_OPTIONS.map(o => o.price)))}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options de livraison pour les tirages */}
                {selectedProductType === 'print' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Options de livraison</h3>
                    <div className="space-y-2">
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
                              +{formatPriceUtil(calculateDeliveryPrice(selectedPrintFormat, 'delivery'))}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">Tube carton sécurisé</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Button - fixed at bottom */}
              <div className="flex-shrink-0 pt-3 border-t border-gray-200 mt-3 space-y-3">
                {/* Message informatif sur les favoris */}
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  Ajoute à tes favoris et reviens en fin de semaine pour sélectionner les meilleures photos.
                </p>
                
                {/* Conteneur pour le bouton favori et le bouton panier */}
                <div className="flex gap-3 items-center">
                  {/* Bouton favori plus grand */}
                  <div className="flex-shrink-0">
                    <HeartButton 
                      photo={{
                        id: currentPhoto.id,
                        gallery_id: currentPhoto.gallery_id,
                        gallery_name: currentPhoto.gallery?.name,
                        preview_url: currentPhoto.preview_s3_url
                      }}
                      size="lg"
                    />
                  </div>
                  
                  {/* Bouton ajouter au panier */}
                  <Button 
                    onClick={handleAddToCart}
                    disabled={isPhotoInCart()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="default"
                  >
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping Cart"
                      width={20}
                      height={20}
                      className="h-5 w-5 mr-2 inline-block"
                    />
                    {isPhotoInCart() ? "Déjà dans le panier" : "Ajouter au panier"}
                  </Button>
                </div>
                
                {/* Compteur de photos dans le panier */}
                <div className="text-center mt-3">
                  <p className="text-xs text-gray-600">
                    {items.length === 0 
                      ? "Aucune photo dans le panier" 
                      : `${items.length} photo${items.length > 1 ? 's' : ''} dans le panier`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 