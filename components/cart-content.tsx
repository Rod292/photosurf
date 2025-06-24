"use client"

import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PhotoModal } from "@/components/photo-modal"

export function CartContent() {
  const { cart, removeFromCart, totalItems, totalPrice, discount, applyDiscount } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const { toast } = useToast()
  const [selectedPhoto, setSelectedPhoto] = useState<null | {
    id: string
    src: string
    title: string
    price: number
    surfer?: string
  }>(null)

  const handleCheckout = async () => {
    toast({
      title: "En construction",
      description: "Le système de paiement est en cours de reconstruction.",
    })
  }

  const handleApplyPromo = () => {
    if (promoCode.trim() === "") {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code promo valide.",
        variant: "destructive",
      })
      return
    }

    const success = applyDiscount(promoCode)
    if (success) {
      toast({
        title: "Succès",
        description: "Le code promo a été appliqué avec succès.",
      })
      setPromoCode("")
    } else {
      toast({
        title: "Erreur",
        description: "Code promo invalide.",
        variant: "destructive",
      })
    }
  }

  const handlePhotoClick = (photo: typeof selectedPhoto) => {
    setSelectedPhoto(photo)
  }

  const closePhotoModal = () => {
    setSelectedPhoto(null)
  }

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id)
    toast({
      title: "Photo supprimée",
      description: "La photo a été supprimée de votre panier.",
    })
  }

  return (
    <>
      {cart.length === 0 ? (
        <p className="font-lexend-deca">Votre panier est vide.</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center p-4 border-b">
                <div className="cursor-pointer mr-4" onClick={() => handlePhotoClick(item)}>
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.title}
                    width={100}
                    height={67}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold font-lexend-deca">{item.title}</h3>
                  <p className="text-sm text-gray-600 font-lexend-deca">
                    {item.price === 0 ? "Gratuit" : `${item.price.toFixed(2)}€`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveFromCart(item.id)}
                  aria-label="Supprimer du panier"
                  className="font-lexend-deca"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                placeholder="Code promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-grow font-lexend-deca"
              />
              <Button onClick={handleApplyPromo} className="font-lexend-deca">
                Appliquer
              </Button>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold font-lexend-deca">Nombre de photos :</span>
              <span className="font-lexend-deca">{totalItems}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold font-lexend-deca">Sous-total :</span>
              <span className="font-lexend-deca">{totalPrice.toFixed(2)}€</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-4 text-green-600">
                <span className="font-semibold font-lexend-deca">Réduction :</span>
                <span className="font-lexend-deca">-{discount.toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between mb-4 text-lg font-bold">
              <span className="font-lexend-deca">Total :</span>
              <span className="font-lexend-deca">{(totalPrice - discount).toFixed(2)}€</span>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
              <p className="text-sm font-lexend-deca">
                Les photos vous seront envoyées par mail dans un délai de quelques heures. Vous recevrez les photos en
                haute résolution et avec les retouches finales.
              </p>
            </div>
            <Button className="w-full font-lexend-deca" onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? "Chargement..." : "Accéder au paiement"}
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

