'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'

export interface FavoritePhoto {
  id: string
  gallery_id: string
  gallery_name?: string
  preview_url: string
  created_at?: string
}

interface FavoritesContextType {
  favorites: FavoritePhoto[]
  addToFavorites: (photo: FavoritePhoto) => void
  removeFromFavorites: (photoId: string) => void
  isInFavorites: (photoId: string) => boolean
  clearFavorites: () => void
  favoritesCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const FAVORITES_COOKIE_NAME = 'arode_favorites'
const MAX_FAVORITES = 100
const COOKIE_EXPIRY_DAYS = 30

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritePhoto[]>([])
  const [mounted, setMounted] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load favorites from cookies on mount
  useEffect(() => {
    setMounted(true)
    
    // Set hydrated after a brief delay to ensure client-side is ready
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 100)
    
    const savedFavorites = Cookies.get(FAVORITES_COOKIE_NAME)
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      } catch (error) {
        console.error('Error parsing favorites from cookies:', error)
      }
    }
    
    return () => clearTimeout(timer)
  }, [])

  // Save favorites to cookies whenever they change
  useEffect(() => {
    if (mounted && isHydrated) {
      Cookies.set(FAVORITES_COOKIE_NAME, JSON.stringify(favorites), { 
        expires: COOKIE_EXPIRY_DAYS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    }
  }, [favorites, mounted, isHydrated])

  const addToFavorites = useCallback((photo: FavoritePhoto) => {
    setFavorites(prev => {
      // Check if already in favorites
      if (prev.some(fav => fav.id === photo.id)) {
        return prev
      }
      
      // Check max favorites limit
      if (prev.length >= MAX_FAVORITES) {
        console.warn(`Maximum favorites limit (${MAX_FAVORITES}) reached`)
        return prev
      }

      // Add to favorites with timestamp
      return [...prev, { ...photo, created_at: photo.created_at || new Date().toISOString() }]
    })
  }, [])

  const removeFromFavorites = useCallback((photoId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== photoId))
  }, [])

  const isInFavorites = useCallback((photoId: string) => {
    return favorites.some(fav => fav.id === photoId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
    Cookies.remove(FAVORITES_COOKIE_NAME)
  }, [])

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites,
    favoritesCount: favorites.length
  }

  // Always provide the context, even during hydration
  // This prevents the "must be used within a FavoritesProvider" error
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    // During SSR/prerendering or hydration issues, return default values instead of throwing
    if (typeof window === 'undefined' || !document.body) {
      return {
        favorites: [],
        addToFavorites: () => {},
        removeFromFavorites: () => {},
        isInFavorites: () => false,
        clearFavorites: () => {},
        favoritesCount: 0
      }
    }
    
    // Give a warning instead of throwing during development
    if (process.env.NODE_ENV === 'development') {
      console.warn('useFavorites must be used within a FavoritesProvider - returning default values')
      return {
        favorites: [],
        addToFavorites: () => {},
        removeFromFavorites: () => {},
        isInFavorites: () => false,
        clearFavorites: () => {},
        favoritesCount: 0
      }
    }
    
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}