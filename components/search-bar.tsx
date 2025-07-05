"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Calendar, School } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, MotionValue } from "framer-motion"
import { SimpleCalendar } from "./ui/simple-calendar"
import { useSurfSchools } from "@/hooks/use-surf-schools"

interface SearchBarProps {
  compact?: boolean
  className?: string
  searchHeight?: MotionValue<number>
  mobile?: boolean
}

export function SearchBar({ compact = false, className = "", searchHeight, mobile = false }: SearchBarProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const router = useRouter()
  const dateRef = useRef<HTMLDivElement>(null)
  const schoolRef = useRef<HTMLDivElement>(null)
  
  // Récupérer les écoles depuis la base de données
  const { schools } = useSurfSchools()
  
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

  if (compact || mobile) {
    return (
      <motion.div 
        className={`flex items-center bg-white/90 backdrop-blur-sm shadow-sm border border-gray-200 rounded-full ${className}`}
        style={mobile ? {} : { height: searchHeight }}
      >
        {/* Date compact */}
        <div className="relative flex-shrink-0" ref={dateRef}>
          <motion.button
            onClick={() => {
              setShowDatePicker(!showDatePicker)
              // Close school dropdown when opening date picker
              if (!showDatePicker) {
                setShowSchoolList(false)
              }
            }}
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
                className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <SimpleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    setShowDatePicker(false)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* School compact */}
        <div className="relative flex-shrink-0" ref={schoolRef}>
          <motion.button
            onClick={() => {
              setShowSchoolList(!showSchoolList)
              // Close date picker when opening school dropdown
              if (!showSchoolList) {
                setShowDatePicker(false)
              }
            }}
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
                {schools.map((school) => (
                  <motion.button
                    key={school.id}
                    onClick={() => {
                      setSelectedSchool(school.name)
                      setShowSchoolList(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                  >
                    {school.name}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search button compact */}
        <motion.button
          onClick={handleSearch}
          className="h-8 w-8 rounded-full transition-colors ml-2 mr-1 flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600 hover:bg-gray-300"
          whileHover={{ 
            scale: 1.1,
            backgroundColor: "#d1d5db"
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