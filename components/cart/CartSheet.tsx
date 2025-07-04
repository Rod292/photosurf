'use client';

import { useCartStore } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/app/actions/checkout';
import { useToast } from '@/components/ui/use-toast';

export function CartSheet() {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const totalItems = getItemCount();
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // Pass Zustand cart items directly
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
        // Redirect to Stripe Checkout
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
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] lg:w-[500px]">
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "Votre panier est vide" 
              : `${totalItems} article${totalItems > 1 ? 's' : ''} dans votre panier`
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>Aucun article dans votre panier</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.photo_id}-${item.product_type}`} className="flex gap-4 py-4 border-b">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md">
                    <Image
                      src={item.preview_url}
                      alt="Photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">
                          Photo {item.product_type === 'digital' ? 'Numérique' : 
                                 item.product_type === 'print' ? 'Tirage' : 'Bundle'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.filename}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(item.price)}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeItem(item.photo_id, item.product_type)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalPrice)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Passer au paiement"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  clearCart();
                  setIsOpen(false);
                }}
              >
                Vider le panier
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Paiement sécurisé avec Stripe
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}