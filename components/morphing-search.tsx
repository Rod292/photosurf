"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, School, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SimpleCalendar } from "./ui/simple-calendar"
import { useSurfSchools } from "@/hooks/use-surf-schools"

interface SearchState {
  date: string
  school: string
}

export function MorphingSearch() {
  const { schools } = useSurfSchools()
  const [searchState, setSearchState] = useState<SearchState>({
    date: "",
    school: ""
  })
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const router = useRouter()

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
    <div className="relative max-w-2xl mx-auto px-6 py-2">
      <motion.div 
        className="bg-white rounded-[32px] shadow-lg border border-gray-200 p-1"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6
        }}
      >
        <div className="flex items-center">
          {/* Date */}
          <div className="flex-1 px-4 py-1.5 border-r border-gray-300 relative">
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
              className="w-full text-center text-sm text-gray-700 bg-transparent border-none outline-none"
            >
              {searchState.date 
                ? new Date(searchState.date).toLocaleDateString("fr-FR")
                : "Quand ?"
              }
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
          <div className="flex-1 px-4 py-1.5 relative">
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
              className="w-full text-center text-sm text-gray-700 bg-transparent border-none outline-none"
            >
              {searchState.school || "Quelle école ?"}
            </button>
            
            {showSchoolList && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 min-w-[200px]">
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
            className={`p-3 rounded-full transition-colors ml-1 ${
              hasValues 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
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