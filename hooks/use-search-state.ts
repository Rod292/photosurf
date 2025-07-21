"use client"

import { useState, useCallback, useContext, createContext } from "react"

interface SearchStateContextType {
  isSearchDropdownOpen: boolean
  setSearchDropdownOpen: (open: boolean) => void
}

export const SearchStateContext = createContext<SearchStateContextType | null>(null)

export function useSearchState() {
  const context = useContext(SearchStateContext)
  if (!context) {
    // Return a fallback if context is not available
    return {
      isSearchDropdownOpen: false,
      setSearchDropdownOpen: () => {}
    }
  }
  return context
}

export function useSearchStateProvider() {
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  
  const setSearchDropdownOpen = useCallback((open: boolean) => {
    setIsSearchDropdownOpen(open)
  }, [])
  
  return {
    isSearchDropdownOpen,
    setSearchDropdownOpen
  }
}