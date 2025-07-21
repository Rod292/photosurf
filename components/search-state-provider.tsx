"use client"

import { ReactNode } from "react"
import { SearchStateContext, useSearchStateProvider } from "@/hooks/use-search-state"

interface SearchStateProviderProps {
  children: ReactNode
}

export function SearchStateProvider({ children }: SearchStateProviderProps) {
  const searchState = useSearchStateProvider()
  
  return (
    <SearchStateContext.Provider value={searchState}>
      {children}
    </SearchStateContext.Provider>
  )
}