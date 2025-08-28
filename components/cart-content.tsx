"use client"

import { useState } from "react"
import { useCartStore } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PhotoModal } from "@/components/photo-modal"
import { createCheckoutSession } from "@/app/actions/checkout"
import { calculateDynamicPricing } from "@/lib/pricing"

export function CartContent() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const getDynamicPricing = useCartStore((state) => state.getDynamicPricing)
  
  const [isLoading, setIsLoading] = useState(false)
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const { toast } = useToast()
  const [selectedPhoto, setSelectedPhoto] = useState<null | {
    id: string
    src: string
    title: string
    price: number
    surfer?: string
  }>(null)

  const totalPrice = getTotalPrice()
  const totalItems = getItemCount()
  const dynamicPricing = getDynamicPricing()

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const result = await createCheckoutSession(items);
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      if (result.url) {
        // Redirect to Stripe Checkout or success page for free orders
        window.location.href = result.url;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la session de paiement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }


  const handlePhotoClick = (item: any) => {
    setSelectedPhoto({
      id: item.photo_id,
      src: item.preview_url,
      title: item.filename,
      price: item.price,
      surfer: "Inconnu"
    })
  }

  const closePhotoModal = () => {
    setSelectedPhoto(null)
  }

  const handleRemoveFromCart = (photoId: string, productType: string) => {
    removeItem(photoId, productType)
    toast({
      title: "Photo supprimée",
      description: "La photo a été supprimée de votre panier.",
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

  return (
    <>
      {items.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="mb-6 flex justify-center">
            <Image
              src="/Logos/shopping-cart.svg"
              alt="Panier vide"
              width={64}
              height={64}
              className="w-16 h-16 opacity-100"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-lexend-deca">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6 font-lexend-deca">Parcourez nos galeries pour découvrir vos photos de surf</p>
          <Link href="/gallery" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium border-2 border-black hover:bg-gray-50 transition-colors font-lexend-deca">
            <Image
              src="/Logos/camera2.svg"
              alt="Camera"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Voir les galeries
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 sm:mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 sm:px-6 py-2 sm:py-4 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/Logos/shopping-cart.svg"
                    alt="Panier"
                    width={32}
                    height={32}
                    className="w-6 sm:w-8 h-6 sm:h-8 opacity-100"
                  />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-lexend-deca">Vos photos sélectionnées</h2>
                    <p className="text-xs sm:text-sm text-blue-700 font-lexend-deca font-medium">{items.length} article{items.length > 1 ? 's' : ''} dans votre panier</p>
                  </div>
                </div>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearCartConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 font-lexend-deca"
                  >
                    <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Vider le panier</span>
                    <span className="sm:hidden">Vider</span>
                  </Button>
                )}
              </div>
            </div>
            {items.map((item) => (
              <div key={`${item.photo_id}-${item.product_type}`} className="flex items-center p-3 sm:p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <div className="mr-2 sm:mr-4 flex-shrink-0 cursor-pointer" onClick={() => handlePhotoClick(item)}>
                  <Image
                    src={item.preview_url || "/placeholder.svg"}
                    alt={item.filename}
                    width={100}
                    height={100}
                    className="rounded-md object-cover w-16 h-16 sm:w-24 sm:h-24"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold font-lexend-deca text-sm sm:text-base truncate pr-1">
                    {item.filename}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-lexend-deca">
                    {item.product_type === 'digital' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/phone-logo.svg"
                          alt="Phone"
                          width={16}
                          height={16}
                          className="w-3 sm:w-4 h-3 sm:h-4"
                        />
                        <span className="hidden sm:inline">Numérique</span>
                        <span className="sm:hidden">Num.</span>
                      </span>
                    ) : item.product_type === 'print_a5' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-3 sm:w-4 h-3 sm:h-4"
                        />
                        <span>A5</span>
                      </span>
                    ) : item.product_type === 'print_a4' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-3 sm:w-4 h-3 sm:h-4"
                        />
                        <span>A4</span>
                      </span>
                    ) : item.product_type === 'print_a3' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-3 sm:w-4 h-3 sm:h-4"
                        />
                        <span>A3</span>
                      </span>
                    ) : item.product_type === 'print_a2' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-3 sm:w-4 h-3 sm:h-4"
                        />
                        <span>A2</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        📄 {item.product_type}
                      </span>
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-lexend-deca font-medium mt-1">
                    {item.price === 0 && item.product_type === 'digital' ? "Inclus dans le pack" : `${item.price.toFixed(2)}€`}
                  </p>
                  {item.delivery_option && (
                    <p className="text-xs text-gray-500 font-lexend-deca mt-1">
                      {item.delivery_option === 'pickup' ? (
                        <span className="flex items-center gap-1">
                          🏄‍♂️ Récupération à La Torche - Gratuit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          📦 Livraison à domicile - {item.delivery_price?.toFixed(2)}€
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {(
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.photo_id, item.product_type)}
                    aria-label="Supprimer du panier"
                    className="font-lexend-deca p-1 sm:p-2 ml-1"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="bg-white shadow-lg rounded-xl p-3 sm:p-6 border border-gray-100">
            {/* Résumé de la commande */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 font-lexend-deca">Résumé de la commande</h3>
              
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-gray-600 font-lexend-deca">Nombre de photos</span>
                  <span className="text-sm sm:text-base font-medium font-lexend-deca">{items.length}</span>
                </div>
                
                {/* Pack Info */}
                {dynamicPricing.digital.finalTotal === 40 && (
                  <div className="flex justify-between items-center py-2 bg-purple-50 px-3 rounded">
                    <span className="text-sm sm:text-base font-semibold text-purple-700 font-lexend-deca">
                      📷 Pack 15 photos activé
                    </span>
                    <span className="text-sm sm:text-base font-bold text-purple-700 font-lexend-deca">
                      40€
                    </span>
                  </div>
                )}
                {dynamicPricing.digital.finalTotal === 69 && (
                  <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded">
                    <span className="text-sm sm:text-base font-semibold text-blue-700 font-lexend-deca">
                      🎁 Pack Illimité activé
                    </span>
                    <span className="text-sm sm:text-base font-bold text-blue-700 font-lexend-deca">
                      69€
                    </span>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-900 font-lexend-deca">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600 font-lexend-deca">
                    {dynamicPricing.total.toFixed(2)}€
                  </span>
                </div>
                {dynamicPricing.totalSavings > 0 && (
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium text-green-600 font-lexend-deca">
                      Vous économisez {dynamicPricing.totalSavings.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Information importante */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-6">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium font-lexend-deca mb-2 flex items-center justify-center gap-2">
                  <Image
                    src="/Logos/mail-logo.svg"
                    alt="Mail"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  Livraison rapide par email
                </p>
                <p className="text-sm text-red-600 font-medium font-lexend-deca">
                  Pensez à vérifier vos spams !
                </p>
              </div>
            </div>

            {/* Bouton de paiement */}
            <Button 
              className="w-full py-3 sm:py-4 text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 font-lexend-deca" 
              onClick={handleCheckout} 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Passer au paiement sécurisé
                </>
              )}
            </Button>
            
            {/* Sécurité paiement */}
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-lexend-deca">Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </>
      )}
      
      {/* Clear cart confirmation modal */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-xl mx-2">
            <div className="text-center">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-lexend-deca">
                Vider le panier ?
              </h3>
              <p className="text-sm text-gray-600 mb-6 font-lexend-deca">
                Cette action supprimera toutes les photos de votre panier. Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClearCartConfirm(false)}
                  className="flex-1 font-lexend-deca"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleClearCart}
                  className="flex-1 bg-red-500 hover:bg-red-600 font-lexend-deca"
                >
                  Vider
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedPhoto && selectedPhoto.surfer && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={closePhotoModal}
          photo={selectedPhoto as any}
          onPrevious={() => {}}
          onNext={() => {}}
          hasPrevious={false}
          hasNext={false}
        />
      )}
    </>
  )
}

