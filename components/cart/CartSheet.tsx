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
import { X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/app/actions/checkout';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function CartSheet() {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const totalItems = getItemCount();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button variant="ghost" size="icon" className="relative">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/Logos/shopping-cart.svg"
                alt="Shopping Cart"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            </motion.div>
            {isMounted && totalItems > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-primary-foreground flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {totalItems}
              </motion.span>
            )}
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[350px] lg:w-[400px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Votre panier</SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "Votre panier est vide" 
              : `${totalItems} article${totalItems > 1 ? 's' : ''} dans votre panier`
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto mt-6 pr-2 -mr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Image
                src="/Logos/shopping-cart.svg"
                alt="Empty Cart"
                width={48}
                height={48}
                className="h-12 w-12 mb-4"
              />
              <p>Aucun article dans votre panier</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.photo_id}-${item.product_type}`} className="flex gap-3 py-3 border-b">
                  <div className="relative h-20 w-20 sm:h-16 sm:w-16 overflow-hidden rounded-md flex-shrink-0">
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
                                 item.product_type === 'print_a5' ? 'Tirage A5' :
                                 item.product_type === 'print_a4' ? 'Tirage A4' :
                                 item.product_type === 'print_a3' ? 'Tirage A3' :
                                 item.product_type === 'print_a2' ? 'Tirage A2' : 'Tirage'}
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
          <div className="flex-shrink-0 pt-4 border-t mt-4">
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