"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateDynamicPricing } from '@/lib/pricing'

export interface CartItem {
  photo_id: string
  product_type: 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6' | 'session_pack'
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
  addSessionPack: (item: CartItem) => void
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
    session_pack: ReturnType<typeof calculateDynamicPricing>
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

      addSessionPack: (item: CartItem) => {
        set((state) => {
          // Vérifier si le pack session existe déjà
          const hasSessionPack = state.items.some(i => i.product_type === 'session_pack')
          if (hasSessionPack) {
            return state // Ne rien faire si le pack existe déjà
          }
          
          // Supprimer toutes les photos numériques existantes et ajouter le pack session
          const newItems = state.items.filter(i => i.product_type !== 'digital')
          newItems.push(item)
          
          return { items: newItems }
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
        const printPolaroid3Count = items.filter(item => item.product_type === 'print_polaroid_3').length
        const printPolaroid6Count = items.filter(item => item.product_type === 'print_polaroid_6').length
        const sessionPackCount = items.filter(item => item.product_type === 'session_pack').length
        
        // Vérifier si le pack session a été explicitement ajouté
        const hasExplicitSessionPack = sessionPackCount > 0
        
        // Calculer les prix pour les photos numériques avec application automatique du pack session
        const digitalPricing = calculateDynamicPricing(digitalCount, 'digital', hasExplicitSessionPack)
        
        // Calculer les prix pour les tirages (pas affectés par le pack session)
        const printA5Pricing = calculateDynamicPricing(printA5Count, 'print_a5')
        const printA4Pricing = calculateDynamicPricing(printA4Count, 'print_a4')
        const printA3Pricing = calculateDynamicPricing(printA3Count, 'print_a3')
        const printA2Pricing = calculateDynamicPricing(printA2Count, 'print_a2')
        const printPolaroid3Pricing = calculateDynamicPricing(printPolaroid3Count, 'print_polaroid_3')
        const printPolaroid6Pricing = calculateDynamicPricing(printPolaroid6Count, 'print_polaroid_6')
        
        // Si un pack session a été explicitement ajouté, on ne compte que les tirages
        const sessionPackPricing = hasExplicitSessionPack ? 
          calculateDynamicPricing(1, 'session_pack') : 
          calculateDynamicPricing(0, 'session_pack')
        
        // Calculate delivery fees
        const deliveryTotal = items.reduce((total, item) => total + (item.delivery_price || 0), 0)
        
        // Si pack session explicite : on compte le pack + les tirages
        // Sinon : on compte les photos numériques (avec application automatique du pack si > 40€) + les tirages
        const digitalTotal = hasExplicitSessionPack ? sessionPackPricing.finalTotal : digitalPricing.finalTotal
        const total = digitalTotal + printA5Pricing.finalTotal + printA4Pricing.finalTotal + printA3Pricing.finalTotal + printA2Pricing.finalTotal + printPolaroid3Pricing.finalTotal + printPolaroid6Pricing.finalTotal + deliveryTotal
        
        const totalSavings = digitalPricing.totalSavings + printA5Pricing.totalSavings + printA4Pricing.totalSavings + printA3Pricing.totalSavings + printA2Pricing.totalSavings + printPolaroid3Pricing.totalSavings + printPolaroid6Pricing.totalSavings + sessionPackPricing.totalSavings
        
        return {
          digital: digitalPricing,
          print_a5: printA5Pricing,
          print_a4: printA4Pricing,
          print_a3: printA3Pricing,
          print_a2: printA2Pricing,
          print_polaroid_3: printPolaroid3Pricing,
          print_polaroid_6: printPolaroid6Pricing,
          session_pack: sessionPackPricing,
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

