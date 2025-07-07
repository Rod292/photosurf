"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useCartStore, CartItem } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photo: {
    id: string
    src: string
    title: string
    price: number
    surfer: string
  }
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function PhotoModal({ isOpen, onClose, photo, onPrevious, onNext, hasPrevious, hasNext }: PhotoModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const isInCart = (photoId: string) => {
    return items.some(item => item.photo_id === photoId)
  }

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      photo_id: photo.id,
      product_type: 'digital',
      price: photo.price,
      preview_url: photo.src,
      filename: photo.title
    }
    addItem(cartItem)
    
    // Show confirmation toast
    toast({
      title: "Photo ajoutée au panier !",
      description: `Photo numérique - ${photo.price}€`,
      duration: 3000,
    })
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrevious) {
        onPrevious()
      } else if (e.key === "ArrowRight" && hasNext) {
        onNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    },
    [hasPrevious, hasNext, onPrevious, onNext, onClose],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    setIsLoading(true)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full p-0 overflow-hidden bg-black/95 [&>button]:hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative h-[calc(100vh-8rem)] w-full flex items-center justify-center"
            >
              {/* Custom close button */}
              <button
                onClick={onClose}
                className="absolute top-8 right-4 z-20 rounded-full bg-black/50 p-2 hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6 text-white" />
                <span className="sr-only">Fermer</span>
              </button>

              {/* Navigation Buttons */}
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {/* Image Container */}
              <div ref={containerRef} className="relative w-full h-full overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
                <motion.div ref={imageRef} className="relative w-full h-full">
                  <Image
                    src={photo.src || "/placeholder.svg"}
                    alt={photo.title}
                    fill
                    className={cn(
                      "object-contain transition-opacity duration-300",
                      isLoading ? "opacity-0" : "opacity-100",
                    )}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    onLoadingComplete={() => setIsLoading(false)}
                  />
                </motion.div>
              </div>

              {hasNext && (
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}

              {/* Info Panel */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold font-lexend-deca text-white">Surfeur: {photo.surfer}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold font-lexend-deca text-white">{photo.price}€</span>
                      <Button
                        onClick={handleAddToCart}
                        size="icon"
                        variant="outline"
                        className={cn(
                          "rounded-full w-12 h-12",
                          isInCart(photo.id)
                            ? "bg-green-500 text-white hover:bg-green-600 border-green-400"
                            : "bg-white text-black hover:bg-white/90",
                        )}
                        disabled={isInCart(photo.id)}
                      >
                        {isInCart(photo.id) ? <Check className="h-5 w-5" /> : (
                          <Image
                            src="/Logos/shopping-cart.svg"
                            alt="Add to Cart"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

