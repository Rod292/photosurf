'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart, ProductType } from '@/contexts/CartContext';
import type { Photo } from '@/lib/database.types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  photo: Photo;
  productType: ProductType;
  price: number; // Price in cents
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  photo,
  productType,
  price,
  className,
  variant = 'default',
  size = 'default',
  showIcon = true,
  children
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const isAlreadyInCart = isInCart(photo.id, productType);

  const handleAddToCart = () => {
    if (!isAlreadyInCart) {
      addToCart(photo, productType, price);
      setIsAdded(true);
      
      // Reset the "added" state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
  };

  const getButtonText = () => {
    if (isAdded) return 'Ajouté !';
    if (isAlreadyInCart) return 'Dans le panier';
    return children || 'Ajouter au panier';
  };

  const getButtonIcon = () => {
    if (isAdded) return <Check className="h-4 w-4" />;
    return <ShoppingCart className="h-4 w-4" />;
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAlreadyInCart}
      variant={isAlreadyInCart ? 'outline' : variant}
      size={size}
      className={cn(
        'flex items-center gap-2',
        isAdded && 'bg-green-600 hover:bg-green-700',
        className
      )}
    >
      {showIcon && getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}