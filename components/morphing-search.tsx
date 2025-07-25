"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, School, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SimpleCalendar } from "./ui/simple-calendar"
import { useSurfSchools } from "@/hooks/use-surf-schools"
import { useSearchState } from "@/hooks/use-search-state"

interface SearchState {
  date: string
  school: string
}

export function MorphingSearch() {
  const { schools } = useSurfSchools()
  const { setSearchDropdownOpen } = useSearchState()
  const [searchState, setSearchState] = useState<SearchState>({
    date: "",
    school: ""
  })
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const router = useRouter()

  // Update global search state when dropdowns open/close
  useEffect(() => {
    setSearchDropdownOpen(showDatePicker || showSchoolList)
  }, [showDatePicker, showSchoolList, setSearchDropdownOpen])

  const handleSearch = () => {
    if (!searchState.date && !searchState.school) return
    
    setIsSearching(true)
    const params = new URLSearchParams()
    
    if (searchState.date) params.append('date', searchState.date)
    if (searchState.school) params.append('school', searchState.school)
    
    setTimeout(() => {
      setIsSearching(false)
      router.push(`/gallery?${params.toString()}`)
    }, 600)
  }

  const updateSearchState = (field: keyof SearchState, value: string) => {
    setSearchState(prev => ({ ...prev, [field]: value }))
  }

  const clearField = (field: keyof SearchState) => {
    setSearchState(prev => ({ ...prev, [field]: "" }))
  }

  const hasValues = Object.values(searchState).some(value => value.length > 0)

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-2">
      <motion.div 
        className="bg-white rounded-[24px] shadow-md border border-gray-200 p-1"
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)"
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 35,
          duration: 0.3
        }}
      >
        <div className="flex items-center">
          {/* Date */}
          <div className="flex-1 px-3 py-2 border-r border-gray-300 relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1 text-center">
              Date
            </label>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker)
                // Close school dropdown when opening date picker
                if (!showDatePicker) {
                  setShowSchoolList(false)
                }
              }}
              className="w-full text-center text-sm text-gray-700 bg-transparent border-none outline-none min-h-[20px]"
            >
              {searchState.date 
                ? new Date(searchState.date).toLocaleDateString("fr-FR")
                : "Quand ?"
              }
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200" style={{ zIndex: 9999 }}>
                <SimpleCalendar
                  selectedDate={searchState.date}
                  onDateSelect={(date) => {
                    updateSearchState("date", date)
                    setShowDatePicker(false)
                  }}
                />
              </div>
            )}
          </div>

          {/* School */}
          <div className="flex-1 px-3 py-2 relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1 text-center">
              École
            </label>
            <button
              onClick={() => {
                setShowSchoolList(!showSchoolList)
                // Close date picker when opening school dropdown
                if (!showSchoolList) {
                  setShowDatePicker(false)
                }
              }}
              className="w-full text-center text-sm text-gray-700 bg-transparent border-none outline-none min-h-[20px]"
            >
              {searchState.school || "Quelle école ?"}
            </button>
            
            {showSchoolList && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]" style={{ zIndex: 9999 }}>
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => {
                      updateSearchState("school", school.name)
                      setShowSchoolList(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {school.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!hasValues || isSearching}
            className={`p-2.5 rounded-full transition-colors ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              hasValues 
                ? "bg-black text-white hover:bg-gray-800" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

    </div>
  )
}