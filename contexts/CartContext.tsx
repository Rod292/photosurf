'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Photo } from '@/lib/database.types';

export type ProductType = 'digital' | 'print';

export interface CartItem {
  photo: Photo;
  productType: ProductType;
  quantity: number;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (photo: Photo, productType: ProductType, price: number) => void;
  removeFromCart: (photoId: string, productType: ProductType) => void;
  updateQuantity: (photoId: string, productType: ProductType, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (photoId: string, productType: ProductType) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'arode-studio-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((photo: Photo, productType: ProductType, price: number) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.photo.id === photo.id && item.productType === productType
      );

      if (existingItemIndex > -1) {
        // Item already exists, increase quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Add new item
        return [...currentItems, {
          photo,
          productType,
          quantity: 1,
          price
        }];
      }
    });
  }, []);

  const removeFromCart = useCallback((photoId: string, productType: ProductType) => {
    setItems(currentItems => 
      currentItems.filter(
        item => !(item.photo.id === photoId && item.productType === productType)
      )
    );
  }, []);

  const updateQuantity = useCallback((photoId: string, productType: ProductType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(photoId, productType);
      return;
    }

    setItems(currentItems => {
      const updatedItems = [...currentItems];
      const itemIndex = updatedItems.findIndex(
        item => item.photo.id === photoId && item.productType === productType
      );

      if (itemIndex > -1) {
        updatedItems[itemIndex].quantity = quantity;
      }

      return updatedItems;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const isInCart = useCallback((photoId: string, productType: ProductType) => {
    return items.some(
      item => item.photo.id === photoId && item.productType === productType
    );
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}