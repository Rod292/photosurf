"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateDynamicPricing } from '@/lib/pricing'

export interface CartItem {
  photo_id: string
  product_type: 'digital' | 'print' | 'bundle'
  price: number
  preview_url: string
  filename: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (photoId: string, productType: string) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
  getDynamicPricing: () => {
    digital: ReturnType<typeof calculateDynamicPricing>
    print: ReturnType<typeof calculateDynamicPricing>
    bundle: ReturnType<typeof calculateDynamicPricing>
    total: number
    totalSavings: number
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item: CartItem) => {
        set((state) => {
          // Vérifier si l'item existe déjà (même photo et même type de produit)
          const existingIndex = state.items.findIndex(
            (i) => i.photo_id === item.photo_id && i.product_type === item.product_type
          )
          
          if (existingIndex >= 0) {
            // Remplacer l'item existant
            const newItems = [...state.items]
            newItems[existingIndex] = item
            return { items: newItems }
      } else {
            // Ajouter le nouvel item
            return { items: [...state.items, item] }
          }
        })
      },
      
      removeItem: (photoId: string, productType: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.photo_id === photoId && item.product_type === productType)
          )
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price, 0)
      },
      
      getItemCount: () => {
        return get().items.length
      },

      getDynamicPricing: () => {
        const items = get().items
        
        // Grouper par type de produit
        const digitalCount = items.filter(item => item.product_type === 'digital').length
        const printCount = items.filter(item => item.product_type === 'print').length
        const bundleCount = items.filter(item => item.product_type === 'bundle').length
        
        // Calculer les prix dynamiques pour chaque type
        const digitalPricing = calculateDynamicPricing(digitalCount, 'digital')
        const printPricing = calculateDynamicPricing(printCount, 'print')
        const bundlePricing = calculateDynamicPricing(bundleCount, 'bundle')
        
        const total = digitalPricing.finalTotal + printPricing.finalTotal + bundlePricing.finalTotal
        const totalSavings = digitalPricing.totalSavings + printPricing.totalSavings + bundlePricing.totalSavings
        
        return {
          digital: digitalPricing,
          print: printPricing,
          bundle: bundlePricing,
          total,
          totalSavings
        }
      }
    }),
    {
      name: 'arode-cart-storage',
      partialize: (state) => ({ items: state.items })
  }
  )
)

