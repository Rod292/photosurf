"use client"

import { useCartStore } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CartSlideOverProps {
  headerStyle?: 'light' | 'dark'
}

export function CartSlideOver({ headerStyle = 'light' }: CartSlideOverProps) {
  const { items, isOpen, toggleCart, removeItem, getTotalPrice, getItemCount } = useCartStore()

  const handleCheckout = async () => {
    // TODO: Implémenter la logique de checkout Stripe
    console.log("Proceeding to checkout with items:", items)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'digital':
        return 'Photo Numérique'
      case 'print':
        return 'Tirage A4'
      case 'bundle':
        return 'Numérique + Tirage'
      default:
        return type
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "relative",
            headerStyle === 'dark' 
              ? "text-white hover:text-white/80" 
              : "text-black hover:text-black/80"
          )}
          onClick={toggleCart}
        >
          <Image
            src="/Logos/shopping-cart.svg"
            alt="Shopping Cart"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="sr-only">Panier</span>
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full">
              {getItemCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image
              src="/Logos/shopping-cart.svg"
              alt="Shopping Cart"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Votre Panier ({getItemCount()})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Image
                src="/Logos/shopping-cart.svg"
                alt="Empty Cart"
                width={48}
                height={48}
                className="h-12 w-12 mb-4 opacity-50"
              />
              <p className="text-lg font-medium">Votre panier est vide</p>
              <p className="text-sm text-center mt-2">
                Ajoutez des photos à votre panier pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.photo_id}-${item.product_type}`} className="flex gap-3 p-3 border rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.preview_url}
                      alt={item.filename}
                      fill
                      className="object-cover rounded"
                      sizes="64px"
                    />
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                      <Image
                        src="/Logos/camera2.svg"
                        alt="Camera"
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        style={{ filter: 'brightness(0) invert(1) opacity(0.8)' }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.filename}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {getProductTypeLabel(item.product_type)}
                    </p>
                    <p className="font-semibold text-sm mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.photo_id, item.product_type)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            
            <Button 
              onClick={handleCheckout}
              className="w-full"
              size="lg"
            >
              Procéder au Paiement
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Paiement sécurisé avec Stripe
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 