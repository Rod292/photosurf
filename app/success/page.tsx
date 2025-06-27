"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/context/cart-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function SuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()
  const [hasCleared, setHasCleared] = useState(false)

  useEffect(() => {
    if (!hasCleared) {
      clearCart()
      setHasCleared(true)
    }
  }, [clearCart, hasCleared])

  const handleReturnToGallery = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background">
      <Header alwaysVisible />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-40 h-40 mb-8 relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Scene-JStbmUrSdpKnr2qeekxnU9kXBoHALJ.gif"
            alt="Surfer riding a wave animation"
            fill
            className="object-contain"
            unoptimized // Required for GIF animation to work
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 font-dm-sans-handgloves">Merci pour votre achat !</h1>
        <div className="text-muted-foreground mb-8 text-center max-w-md space-y-4 font-lexend-deca">
          <p>Votre commande a été traitée avec succès.</p>
          <p>
            Les photos vous seront envoyées par mail dans un délai de quelques heures. Vous recevrez les photos en haute
            résolution et avec les retouches finales.
          </p>
        </div>
        <Button className="font-lexend-deca" onClick={handleReturnToGallery}>
          Retour à la galerie
        </Button>
      </div>
    </main>
  )
}

