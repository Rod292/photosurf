"use client"

import { useState } from "react"
import { useCartStore } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PhotoModal } from "@/components/photo-modal"
import { createCheckoutSession } from "@/app/actions/checkout"

export function CartContent() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const getDynamicPricing = useCartStore((state) => state.getDynamicPricing)
  
  const [isLoading, setIsLoading] = useState(false)
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

  return (
    <>
      {items.length === 0 ? (
        <p className="font-lexend-deca">Votre panier est vide.</p>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 font-lexend-deca">Vos photos sélectionnées</h2>
              <p className="text-sm text-gray-600 font-lexend-deca">{items.length} article{items.length > 1 ? 's' : ''} dans votre panier</p>
            </div>
            {items.map((item) => (
              <div key={`${item.photo_id}-${item.product_type}`} className="flex items-center p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                <div className="cursor-pointer mr-4" onClick={() => handlePhotoClick(item)}>
                  <Image
                    src={item.preview_url || "/placeholder.svg"}
                    alt={item.filename}
                    width={100}
                    height={67}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold font-lexend-deca">{item.filename}</h3>
                  <p className="text-sm text-gray-600 font-lexend-deca">
                    {item.product_type === 'digital' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/phone-logo.svg"
                          alt="Phone"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Numérique
                      </span>
                    ) : item.product_type === 'print_a5' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Tirage A5
                      </span>
                    ) : item.product_type === 'print_a4' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Tirage A4
                      </span>
                    ) : item.product_type === 'print_a3' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Tirage A3
                      </span>
                    ) : item.product_type === 'print_a2' ? (
                      <span className="flex items-center gap-1">
                        <Image
                          src="/Logos/Imprimante.svg"
                          alt="Print"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        Tirage A2
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-gray-600 font-lexend-deca">
                    {item.price === 0 ? "Gratuit" : `${item.price.toFixed(2)}€`}
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
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveFromCart(item.photo_id, item.product_type)}
                  aria-label="Supprimer du panier"
                  className="font-lexend-deca"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            {/* Résumé de la commande */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-lexend-deca">Résumé de la commande</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-lexend-deca">Nombre de photos</span>
                  <span className="font-medium font-lexend-deca">{totalItems}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-lexend-deca">Sous-total photos</span>
                  <span className="font-medium font-lexend-deca">{dynamicPricing.total.toFixed(2)}€</span>
                </div>
                
                {/* Frais de livraison */}
                {(() => {
                  const deliveryTotal = items.reduce((total, item) => total + (item.delivery_price || 0), 0)
                  return deliveryTotal > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-lexend-deca">Frais de livraison</span>
                      <span className="font-medium font-lexend-deca">{deliveryTotal.toFixed(2)}€</span>
                    </div>
                  )
                })()}
                
                {/* Économies automatiques */}
                {dynamicPricing.totalSavings > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-green-600 font-lexend-deca">Économies automatiques</span>
                    <span className="font-medium text-green-600 font-lexend-deca">-{dynamicPricing.totalSavings.toFixed(2)}€</span>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 font-lexend-deca">Total</span>
                  <span className="text-xl font-bold text-blue-600 font-lexend-deca">
                    {dynamicPricing.total.toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>

            {/* Information importante */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium font-lexend-deca mb-1">
                    Livraison rapide par email
                  </p>
                  <p className="text-sm text-blue-700 font-lexend-deca">
                    Les photos vous seront envoyées par mail dans les prochaines minutes. Vous recevrez les photos en
                    haute résolution et avec les retouches finales. Pensez à vérifier vos spams !
                  </p>
                  {dynamicPricing.totalSavings > 0 && (
                    <p className="text-sm font-lexend-deca mt-2 text-green-700 font-medium">
                      💰 Vous économisez {dynamicPricing.totalSavings.toFixed(2)}€ grâce à notre système de réductions dégressives !
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <Button 
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 font-lexend-deca" 
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
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-lexend-deca">Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </>
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

