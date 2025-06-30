"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Calendar, School } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, MotionValue } from "framer-motion"

interface SearchBarProps {
  compact?: boolean
  className?: string
  searchHeight?: MotionValue<number>
}

export function SearchBar({ compact = false, className = "", searchHeight }: SearchBarProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const router = useRouter()
  const dateRef = useRef<HTMLDivElement>(null)
  const schoolRef = useRef<HTMLDivElement>(null)
  
  // Liste des écoles disponibles
  const schools = [
    "Surf School La Torche",
    "École de Surf ECF",
    "West Surf Association",
    "Glisse & Nature",
    "La Torche Surf Club",
    "Breizh Surf School"
  ]
  
  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
      if (schoolRef.current && !schoolRef.current.contains(event.target as Node)) {
        setShowSchoolList(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedDate) params.append('date', selectedDate)
    if (selectedSchool) params.append('school', selectedSchool)
    
    router.push(`/gallery?${params.toString()}`)
  }

  const formatDateDisplay = (date: string) => {
    if (!date) return "Date"
    return new Date(date).toLocaleDateString("fr-FR", { 
      day: "2-digit", 
      month: "2-digit" 
    })
  }

  const formatSchoolDisplay = (school: string) => {
    if (!school) return "École"
    return school.replace("Surf School ", "").replace("École de Surf ", "")
  }

  if (compact) {
    return (
      <motion.div 
        className={`flex items-center bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 rounded-full ${className}`}
        style={{ height: searchHeight }}
      >
        {/* Date compact */}
        <div className="relative flex-shrink-0" ref={dateRef}>
          <motion.button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors h-full whitespace-nowrap ${
              selectedDate 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            } rounded-l-full border-r border-gray-200`}
            whileHover={{ backgroundColor: selectedDate ? "rgb(239 246 255)" : "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-4 h-4" />
            <span>{formatDateDisplay(selectedDate)}</span>
          </motion.button>
          
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
              >
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setShowDatePicker(false)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* School compact */}
        <div className="relative flex-shrink-0" ref={schoolRef}>
          <motion.button
            onClick={() => setShowSchoolList(!showSchoolList)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors h-full whitespace-nowrap ${
              selectedSchool 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
            whileHover={{ backgroundColor: selectedSchool ? "rgb(239 246 255)" : "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <School className="w-4 h-4" />
            <span className="truncate max-w-[100px]">
              {formatSchoolDisplay(selectedSchool)}
            </span>
          </motion.button>
          
          <AnimatePresence>
            {showSchoolList && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 min-w-[200px]"
              >
                {schools.map((schoolName) => (
                  <motion.button
                    key={schoolName}
                    onClick={() => {
                      setSelectedSchool(schoolName)
                      setShowSchoolList(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                  >
                    {schoolName}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search button compact */}
        <motion.button
          onClick={handleSearch}
          className="h-8 w-8 rounded-full transition-colors ml-2 mr-1 flex items-center justify-center flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700"
          whileHover={{ 
            scale: 1.1,
            backgroundColor: "#1d4ed8"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="h-3.5 w-3.5" />
        </motion.button>
      </motion.div>
    )
  }

  // Version normale (non utilisée mais gardée pour compatibilité)
  return null
}