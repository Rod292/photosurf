"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Calendar, School, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

interface UnifiedSearchProps {
  mode?: "compact" | "full"
  className?: string
  onModeChange?: (mode: "compact" | "full") => void
}

interface SearchState {
  date: string
  school: string
  session: string
}

const SURF_SCHOOLS = [
  "Surf School La Torche",
  "École de Surf ECF", 
  "West Surf Association",
  "Glisse & Nature",
  "La Torche Surf Club",
  "Breizh Surf School"
]

export function UnifiedSearch({ mode = "full", className = "", onModeChange }: UnifiedSearchProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    date: "",
    school: "",
    session: ""
  })
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [dynamicMode, setDynamicMode] = useState(mode)
  
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const schoolRef = useRef<HTMLDivElement>(null)
  
  const { scrollY } = useScroll()
  const searchScale = useTransform(scrollY, [0, 150], [1, 0.92])
  
  // Auto-switch to compact mode when scrolling past hero
  useEffect(() => {
    if (mode === "full") {
      const updateMode = () => {
        const shouldBeCompact = window.scrollY > 250
        const newMode = shouldBeCompact ? "compact" : "full"
        setDynamicMode(newMode)
        onModeChange?.(newMode)
      }

      window.addEventListener('scroll', updateMode)
      updateMode() // Check initial state
      return () => window.removeEventListener('scroll', updateMode)
    }
  }, [mode, onModeChange])
  
  // Close dropdowns when clicking outside
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
    if (!searchState.date && !searchState.school && !searchState.session) return
    
    setIsSearching(true)
    const params = new URLSearchParams()
    
    if (searchState.date) params.append('date', searchState.date)
    if (searchState.school) params.append('school', searchState.school)
    if (searchState.session) params.append('session', searchState.session)
    
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

  const formatDateDisplay = (date: string) => {
    if (!date) return "Date"
    return new Date(date).toLocaleDateString("fr-FR", { 
      day: "2-digit", 
      month: "2-digit" 
    })
  }

  const formatSchoolDisplay = (school: string) => {
    if (!school) return "École"
    // Shorten school names for compact display
    return school.replace("Surf School ", "").replace("École de Surf ", "")
  }

  // Use layout ID for seamless morphing animation
  const layoutId = "unified-search-bar"
  const isCompactMode = dynamicMode === "compact"
  
  if (isCompactMode) {
    return (
      <motion.div 
        ref={containerRef}
        layoutId={layoutId}
        className={`inline-flex items-center bg-white rounded-full shadow-sm border border-gray-200 h-10 ${className}`}
        style={{ scale: searchScale }}
        whileHover={{ 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6
        }}
      >
        {/* Session indicator (only show if has value) */}
        <AnimatePresence>
          {searchState.session && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex items-center px-3 py-1.5 border-r border-gray-200"
            >
              <span className="text-xs font-medium text-blue-600 truncate max-w-[80px]">
                {searchState.session}
              </span>
              <button
                onClick={() => clearField("session")}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date */}
        <div className="relative flex-shrink-0" ref={dateRef}>
          <motion.button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors h-full whitespace-nowrap ${
              searchState.date 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            } ${searchState.session ? "" : "rounded-l-full"} border-r border-gray-200`}
            whileHover={{ backgroundColor: searchState.date ? "rgb(239 246 255)" : "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-4 h-4" />
            <span>{formatDateDisplay(searchState.date)}</span>
            {searchState.date && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearField("date")
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
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
                  value={searchState.date}
                  onChange={(e) => {
                    updateSearchState("date", e.target.value)
                    setShowDatePicker(false)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* School */}
        <div className="relative flex-shrink-0" ref={schoolRef}>
          <motion.button
            onClick={() => setShowSchoolList(!showSchoolList)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors h-full whitespace-nowrap ${
              searchState.school 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
            whileHover={{ backgroundColor: searchState.school ? "rgb(239 246 255)" : "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}
          >
            <School className="w-4 h-4" />
            <span className="truncate max-w-[100px]">
              {formatSchoolDisplay(searchState.school)}
            </span>
            {searchState.school && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearField("school")
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
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
                {SURF_SCHOOLS.map((schoolName) => (
                  <motion.button
                    key={schoolName}
                    onClick={() => {
                      updateSearchState("school", schoolName)
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

        {/* Search button */}
        <motion.button
          onClick={handleSearch}
          disabled={!hasValues || isSearching}
          className={`h-8 w-8 rounded-full transition-colors ml-2 mr-1 flex items-center justify-center flex-shrink-0 ${
            hasValues 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          whileHover={hasValues ? { 
            scale: 1.1,
            backgroundColor: "#1d4ed8"
          } : {}}
          whileTap={hasValues ? { scale: 0.95 } : {}}
        >
          <motion.div
            animate={isSearching ? { rotate: 360 } : {}}
            transition={{ duration: 0.6, repeat: isSearching ? Infinity : 0 }}
          >
            <Search className="h-3.5 w-3.5" />
          </motion.div>
        </motion.button>
      </motion.div>
    )
  }

  // Full mode
  return (
    <div className={`max-w-2xl mx-auto px-6 py-2 ${className}`}>
      <motion.div 
        ref={containerRef}
        layoutId={layoutId}
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
          {/* Session */}
          <motion.div 
            className="flex-1 px-4 py-1.5 border-r border-gray-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.label 
              className="block text-xs font-semibold text-gray-700 mb-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Session
            </motion.label>
            <div className="relative">
              <motion.input
                type="text"
                placeholder="Rechercher une session..."
                value={searchState.session}
                onChange={(e) => updateSearchState("session", e.target.value)}
                className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none pr-6"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              {searchState.session && (
                <button
                  onClick={() => clearField("session")}
                  className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Date */}
          <motion.div 
            className="flex-1 px-4 py-1.5 border-r border-gray-300 relative"
            ref={dateRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.label 
              className="block text-xs font-semibold text-gray-700 mb-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Date
            </motion.label>
            <div className="relative">
              <motion.button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full text-left text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none pr-6"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {searchState.date 
                  ? new Date(searchState.date).toLocaleDateString("fr-FR")
                  : "Quand ?"
                }
              </motion.button>
              {searchState.date && (
                <button
                  onClick={() => clearField("date")}
                  className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
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
                    value={searchState.date}
                    onChange={(e) => {
                      updateSearchState("date", e.target.value)
                      setShowDatePicker(false)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* School */}
          <motion.div 
            className="flex-1 px-4 py-1.5 relative"
            ref={schoolRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.label 
              className="block text-xs font-semibold text-gray-700 mb-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              École
            </motion.label>
            <div className="relative">
              <motion.button
                onClick={() => setShowSchoolList(!showSchoolList)}
                className="w-full text-left text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none pr-6"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {searchState.school || "Quelle école ?"}
              </motion.button>
              {searchState.school && (
                <button
                  onClick={() => clearField("school")}
                  className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {showSchoolList && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 min-w-[200px]"
                >
                  {SURF_SCHOOLS.map((schoolName) => (
                    <motion.button
                      key={schoolName}
                      onClick={() => {
                        updateSearchState("school", schoolName)
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
          </motion.div>

          {/* Search button */}
          <motion.button
            onClick={handleSearch}
            disabled={!hasValues || isSearching}
            className={`p-3 rounded-full transition-colors ml-1 ${
              hasValues 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            whileHover={hasValues ? { 
              scale: 1.1,
              backgroundColor: "#1d4ed8"
            } : {}}
            whileTap={hasValues ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              animate={isSearching ? { rotate: 360 } : {}}
              transition={{ duration: 0.6, repeat: isSearching ? Infinity : 0 }}
            >
              <Search className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick suggestions */}
      <AnimatePresence>
        {hasValues && (
          <motion.div 
            className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Suggestions rapides
            </div>
            <div className="flex flex-wrap gap-2">
              {["Matin", "Après-midi", "Débutant", "Perfectionnement"].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  onClick={() => updateSearchState("session", suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full text-sm text-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}