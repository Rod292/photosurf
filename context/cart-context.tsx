"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateDynamicPricing } from '@/lib/pricing'

export interface CartItem {
  photo_id: string
  product_type: 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2'
  price: number
  preview_url: string
  filename: string
  delivery_option?: 'pickup' | 'delivery'
  delivery_price?: number
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
    print_a5: ReturnType<typeof calculateDynamicPricing>
    print_a4: ReturnType<typeof calculateDynamicPricing>
    print_a3: ReturnType<typeof calculateDynamicPricing>
    print_a2: ReturnType<typeof calculateDynamicPricing>
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
        return get().items.reduce((total, item) => total + item.price + (item.delivery_price || 0), 0)
      },
      
      getItemCount: () => {
        return get().items.length
      },

      getDynamicPricing: () => {
        const items = get().items
        
        // Grouper par type de produit
        const digitalCount = items.filter(item => item.product_type === 'digital').length
        const printA5Count = items.filter(item => item.product_type === 'print_a5').length
        const printA4Count = items.filter(item => item.product_type === 'print_a4').length
        const printA3Count = items.filter(item => item.product_type === 'print_a3').length
        const printA2Count = items.filter(item => item.product_type === 'print_a2').length
        
        // Calculer les prix dynamiques pour chaque type
        const digitalPricing = calculateDynamicPricing(digitalCount, 'digital')
        const printA5Pricing = calculateDynamicPricing(printA5Count, 'print_a5')
        const printA4Pricing = calculateDynamicPricing(printA4Count, 'print_a4')
        const printA3Pricing = calculateDynamicPricing(printA3Count, 'print_a3')
        const printA2Pricing = calculateDynamicPricing(printA2Count, 'print_a2')
        
        // Calculate delivery fees
        const deliveryTotal = items.reduce((total, item) => total + (item.delivery_price || 0), 0)
        
        const total = digitalPricing.finalTotal + printA5Pricing.finalTotal + printA4Pricing.finalTotal + printA3Pricing.finalTotal + printA2Pricing.finalTotal + deliveryTotal
        const totalSavings = digitalPricing.totalSavings + printA5Pricing.totalSavings + printA4Pricing.totalSavings + printA3Pricing.totalSavings + printA2Pricing.totalSavings
        
        return {
          digital: digitalPricing,
          print_a5: printA5Pricing,
          print_a4: printA4Pricing,
          print_a3: printA3Pricing,
          print_a2: printA2Pricing,
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

