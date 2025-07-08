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
  const [promoCode, setPromoCode] = useState("")
  const [promoValidation, setPromoValidation] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
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
      // Include promo code in checkout session
      const result = await createCheckoutSession(items, promoValidation?.valid ? promoCode : undefined);
      
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

  const handleApplyPromo = async () => {
    if (promoCode.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code promo.",
        variant: "destructive",
      })
      return
    }

    setPromoLoading(true)

    try {
      const response = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: promoCode, 
          totalAmount: dynamicPricing.total 
        })
      })

      const result = await response.json()

      if (result.valid) {
        setPromoValidation(result)
        toast({
          title: "Code promo appliqué !",
          description: `${result.description} - Réduction de ${result.discountAmount.toFixed(2)}€`,
        })
      } else {
        setPromoValidation(null)
        toast({
          title: "Code promo invalide",
          description: result.error || "Ce code promo n'existe pas.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le code promo.",
        variant: "destructive",
      })
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoValidation(null)
    setPromoCode("")
    toast({
      title: "Code promo supprimé",
      description: "Le code promo a été retiré de votre commande.",
    })
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
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            {items.map((item) => (
              <div key={`${item.photo_id}-${item.product_type}`} className="flex items-center p-4 border-b">
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
                    ) : item.product_type === 'print' ? (
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
                    ) : '🎁 Pack Complet'}
                  </p>
                  <p className="text-sm text-gray-600 font-lexend-deca">
                    {item.price === 0 ? "Gratuit" : `${item.price.toFixed(2)}€`}
                  </p>
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
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* Code promo section */}
            {!promoValidation ? (
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-grow font-lexend-deca"
                  disabled={promoLoading}
                />
                <Button 
                  onClick={handleApplyPromo} 
                  className="font-lexend-deca"
                  disabled={promoLoading}
                >
                  {promoLoading ? "..." : "Appliquer"}
                </Button>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-green-800">Code promo appliqué:</span>
                    <p className="text-green-700 font-semibold">{promoCode} - {promoValidation.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemovePromo}
                    className="text-green-600 hover:text-green-800"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between mb-4">
              <span className="font-semibold font-lexend-deca">Nombre de photos :</span>
              <span className="font-lexend-deca">{totalItems}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold font-lexend-deca">Sous-total :</span>
              <span className="font-lexend-deca">{dynamicPricing.total.toFixed(2)}€</span>
            </div>
            
            {/* Affichage des économies automatiques */}
            {dynamicPricing.totalSavings > 0 && (
              <div className="flex justify-between mb-4 text-green-600">
                <span className="font-semibold font-lexend-deca">Économies automatiques :</span>
                <span className="font-lexend-deca">-{dynamicPricing.totalSavings.toFixed(2)}€</span>
              </div>
            )}
            
            {promoValidation && (
              <div className="flex justify-between mb-4 text-green-600">
                <span className="font-semibold font-lexend-deca">Réduction code promo ({promoValidation.discount}%) :</span>
                <span className="font-lexend-deca">-{promoValidation.discountAmount.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between mb-4 text-lg font-bold">
              <span className="font-lexend-deca">Total :</span>
              <span className="font-lexend-deca">
                {promoValidation?.isFree ? "GRATUIT" : `${(promoValidation ? promoValidation.finalAmount : dynamicPricing.total).toFixed(2)}€`}
              </span>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
              <p className="text-sm font-lexend-deca">
                Les photos vous seront envoyées par mail dans un délai de quelques heures. Vous recevrez les photos en
                haute résolution et avec les retouches finales.
              </p>
              {dynamicPricing.totalSavings > 0 && (
                <p className="text-sm font-lexend-deca mt-2 text-green-700">
                  💰 Vous économisez {dynamicPricing.totalSavings.toFixed(2)}€ grâce à notre système de réductions dégressives !
                </p>
              )}
            </div>
            <Button className="w-full font-lexend-deca" onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? "Chargement..." : "Passer au paiement"}
            </Button>
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

