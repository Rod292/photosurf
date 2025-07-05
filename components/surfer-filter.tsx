"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SurferFilterProps {
  surfers: string[]
  onSurferSelect: (surfer: string | null) => void
}

export function SurferFilter({ surfers, onSurferSelect }: SurferFilterProps) {
  const [selectedSurfer, setSelectedSurfer] = useState<string | null>(null)

  const handleSurferClick = (surfer: string) => {
    if (selectedSurfer === surfer) {
      setSelectedSurfer(null)
      onSurferSelect(null)
    } else {
      setSelectedSurfer(surfer)
      onSurferSelect(surfer)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {surfers.map((surfer) => (
        <Button
          key={surfer}
          variant={selectedSurfer === surfer ? "default" : "outline"}
          onClick={() => handleSurferClick(surfer)}
          className={cn(
            "w-full transition-all duration-300 rounded-xl border shadow-lg font-lexend-deca",
            selectedSurfer === surfer
              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
              : "bg-gray-700/50 hover:bg-gray-700/70 text-white border-gray-600/50 hover:border-gray-500/50",
          )}
        >
          {surfer}
        </Button>
      ))}
    </div>
  )
}

