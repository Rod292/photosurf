"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"

interface FilterContextType {
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  selectedSurfer: string | null
  setSelectedSurfer: (surfer: string | null) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSurfer, setSelectedSurfer] = useState<string | null>(null)

  return (
    <FilterContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedSurfer,
        setSelectedSurfer,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider")
  }
  return context
}

