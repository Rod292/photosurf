"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateDynamicPricing, getNextPhotoPrice } from '@/lib/pricing'

export interface CartItem {
  photo_id: string
  product_type: 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6'
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
    print_polaroid_3: ReturnType<typeof calculateDynamicPricing>
    print_polaroid_6: ReturnType<typeof calculateDynamicPricing>
    total: number
    totalSavings: number
  }
}

// Helper function to calculate digital photos total
const calculateDigitalTotal = (items: CartItem[]): number => {
  const digitalCount = items.filter(item => item.product_type === 'digital').length
  const pricing = calculateDynamicPricing(digitalCount, 'digital')
  return pricing.finalTotal
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
          
          // Si l'item existe déjà, ne rien faire
          if (existingIndex >= 0) {
            return state
          }
          
          // Si on ajoute autre chose qu'une photo numérique, ajouter normalement
          if (item.product_type !== 'digital') {
            return { items: [...state.items, item] }
          }

          // Pour les photos numériques, calculer le prix dynamiquement
          const currentDigitalCount = state.items.filter(i => i.product_type === 'digital').length
          const currentTotal = state.items
            .filter(i => i.product_type === 'digital')
            .reduce((sum, i) => sum + i.price, 0)
          
          const newPrice = getNextPhotoPrice(currentDigitalCount, 'digital', currentTotal)
          const pricedItem = { ...item, price: newPrice }
          
          return { items: [...state.items, pricedItem] }
        })
      },

      
      removeItem: (photoId: string, productType: string) => {
        set((state) => {
          // Supprimer l'item
          let updatedItems = state.items.filter(
            (item) => !(item.photo_id === photoId && item.product_type === productType)
          )
          
          // Si on supprime une photo numérique, recalculer tous les prix
          if (productType === 'digital') {
            let digitalPosition = 0
            updatedItems = updatedItems.map((item) => {
              if (item.product_type === 'digital') {
                // Calculer le total actuel jusqu'à cette position
                const currentTotal = updatedItems
                  .slice(0, digitalPosition)
                  .filter(i => i.product_type === 'digital')
                  .reduce((sum, i) => sum + i.price, 0)
                
                const newPrice = getNextPhotoPrice(digitalPosition, 'digital', currentTotal)
                digitalPosition++
                return { ...item, price: newPrice }
              }
              return item
            })
          }
          
          return { items: updatedItems }
        })
      },
      

      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalPrice: () => {
        const items = get().items
        const digitalTotal = calculateDynamicPricing(items.filter(i => i.product_type === 'digital').length, 'digital').finalTotal
        const printTotal = items
          .filter(i => i.product_type !== 'digital')
          .reduce((sum, item) => sum + item.price + (item.delivery_price || 0), 0)
        return digitalTotal + printTotal
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
        const printPolaroid3Count = items.filter(item => item.product_type === 'print_polaroid_3').length
        const printPolaroid6Count = items.filter(item => item.product_type === 'print_polaroid_6').length
        
        // Calculer les prix pour chaque type de produit
        const digitalPricing = calculateDynamicPricing(digitalCount, 'digital')
        const printA5Pricing = calculateDynamicPricing(printA5Count, 'print_a5')
        const printA4Pricing = calculateDynamicPricing(printA4Count, 'print_a4')
        const printA3Pricing = calculateDynamicPricing(printA3Count, 'print_a3')
        const printA2Pricing = calculateDynamicPricing(printA2Count, 'print_a2')
        const printPolaroid3Pricing = calculateDynamicPricing(printPolaroid3Count, 'print_polaroid_3')
        const printPolaroid6Pricing = calculateDynamicPricing(printPolaroid6Count, 'print_polaroid_6')
        
        // Calculate delivery fees
        const deliveryTotal = items.reduce((total, item) => total + (item.delivery_price || 0), 0)
        
        const total = digitalPricing.finalTotal + printA5Pricing.finalTotal + printA4Pricing.finalTotal + printA3Pricing.finalTotal + printA2Pricing.finalTotal + printPolaroid3Pricing.finalTotal + printPolaroid6Pricing.finalTotal + deliveryTotal
        
        const totalSavings = digitalPricing.totalSavings + printA5Pricing.totalSavings + printA4Pricing.totalSavings + printA3Pricing.totalSavings + printA2Pricing.totalSavings + printPolaroid3Pricing.totalSavings + printPolaroid6Pricing.totalSavings
        
        return {
          digital: digitalPricing,
          print_a5: printA5Pricing,
          print_a4: printA4Pricing,
          print_a3: printA3Pricing,
          print_a2: printA2Pricing,
          print_polaroid_3: printPolaroid3Pricing,
          print_polaroid_6: printPolaroid6Pricing,
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

