"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Calendar, School } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface SearchBarProps {
  compact?: boolean
  className?: string
}

export function SearchBar({ compact = false, className = "" }: SearchBarProps) {
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [school, setSchool] = useState("")
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const fieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  }

  if (compact) {
    return (
      <motion.div 
        className={`bg-white rounded-full shadow-sm border border-gray-200 h-10 flex items-center relative inline-flex ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
      >
        {/* Version compacte - 2 parties cliquables */}
        <div className="relative flex-shrink-0" ref={dateRef}>
          <motion.button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-200 h-full whitespace-nowrap"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{selectedDate || "Date"}</span>
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
        
        <div className="relative flex-shrink-0" ref={schoolRef}>
          <motion.button
            onClick={() => setShowSchoolList(!showSchoolList)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors h-full whitespace-nowrap"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <School className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{selectedSchool || "École"}</span>
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

        <motion.button
          onClick={handleSearch}
          className="bg-blue-600 text-white h-8 w-8 rounded-full hover:bg-blue-700 transition-colors ml-1 mr-1 flex items-center justify-center flex-shrink-0"
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

  return (
    <div className={`max-w-2xl mx-auto px-6 py-2 ${className}`}>
      <motion.div 
        className="bg-white rounded-[32px] shadow-lg border border-gray-200 p-1 flex items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Session/Destination */}
        <motion.div 
          className="flex-1 px-4 py-1.5 border-r border-gray-300"
          variants={fieldVariants}
        >
          <motion.label 
            className="block text-xs font-semibold text-gray-700 mb-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Session
          </motion.label>
          <motion.input
            type="text"
            placeholder="Rechercher une session..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Date */}
        <motion.div 
          className="flex-1 px-4 py-1.5 border-r border-gray-300"
          variants={fieldVariants}
        >
          <motion.label 
            className="block text-xs font-semibold text-gray-700 mb-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            Date
          </motion.label>
          <motion.input
            type="text"
            placeholder="Quand ?"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* École de surf */}
        <motion.div 
          className="flex-1 px-4 py-1.5"
          variants={fieldVariants}
        >
          <motion.label 
            className="block text-xs font-semibold text-gray-700 mb-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            École
          </motion.label>
          <motion.input
            type="text"
            placeholder="Quelle école ?"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Bouton de recherche */}
        <motion.button
          onClick={handleSearch}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors ml-1"
          whileHover={{ 
            scale: 1.1,
            backgroundColor: "#1d4ed8"
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  )
} 