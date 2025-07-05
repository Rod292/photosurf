"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCartStore } from "@/context/cart-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SessionDetails {
  id: string
  payment_status: string
  customer_email: string
  amount_total: number
  currency: string
}

function SuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasCleared, setHasCleared] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!hasCleared) {
      clearCart()
      setHasCleared(true)
    }
  }, [clearCart, hasCleared])

  // Fetch session details if session_id is present
  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`/api/create-checkout-session?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionDetails(data.session)
      }
    } catch (error) {
      console.error('Error fetching session details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnToGallery = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header alwaysVisible />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-pulse">
            <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto mb-8"></div>
          </div>
        </div>
      </main>
    )
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
        
        <h1 className="text-3xl font-bold mb-4 font-dm-sans-handgloves">
          Merci pour votre achat !
        </h1>
        
        {sessionDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md">
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Commande :</span>{' '}
                <span className="font-mono text-xs">{sessionDetails.id}</span>
              </p>
              <p>
                <span className="font-medium">Email :</span> {sessionDetails.customer_email}
              </p>
              <p>
                <span className="font-medium">Montant :</span>{' '}
                {(sessionDetails.amount_total / 100).toFixed(2)}€
              </p>
              <p>
                <span className="font-medium">Statut :</span>{' '}
                <span className="text-green-600 font-medium">
                  {sessionDetails.payment_status === 'paid' ? 'Payé' : sessionDetails.payment_status}
                </span>
              </p>
            </div>
          </div>
        )}
        
        <div className="text-muted-foreground mb-8 text-center max-w-md space-y-4 font-lexend-deca">
          <p>Votre commande a été traitée avec succès.</p>
          <p>
            {sessionDetails 
              ? `Un email de confirmation a été envoyé à ${sessionDetails.customer_email}. Les photos numériques sont disponibles immédiatement et les tirages seront expédiés sous 3-5 jours ouvrés.`
              : "Les photos vous seront envoyées par mail dans un délai de quelques heures. Vous recevrez les photos en haute résolution et avec les retouches finales."
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="font-lexend-deca" onClick={handleReturnToGallery}>
            Retour à la galerie
          </Button>
          
          <Button 
            variant="outline" 
            className="font-lexend-deca"
            onClick={() => router.push('/contact')}
          >
            Nous contacter
          </Button>
        </div>
        
        {sessionId && (
          <p className="text-xs text-gray-500 mt-8 text-center">
            Conservez cette page ou notez votre numéro de commande pour toute question.
          </p>
        )}
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <Header alwaysVisible />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-pulse">
            <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto mb-8"></div>
          </div>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}

