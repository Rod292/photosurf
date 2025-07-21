"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Calendar, School, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from "framer-motion"
import { CollapsibleContent } from "./content-flow-animation"
import { SimpleCalendar } from "../ui/simple-calendar"
import { useSurfSchools } from "@/hooks/use-surf-schools"

interface ExpandableSearchProps {
  variant?: "compact" | "full"
  onStateChange?: (isExpanded: boolean) => void
}

export function ExpandableSearch({ variant = "full", onStateChange }: ExpandableSearchProps) {
  const { schools } = useSurfSchools()
  const [isExpanded, setIsExpanded] = useState(variant === "full")
  const [isSearching, setIsSearching] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSchoolList, setShowSchoolList] = useState(false)
  const [formData, setFormData] = useState({
    session: "",
    date: "",
    school: ""
  })
  
  const router = useRouter()
  const searchBarRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  const progress = useMotionValue(isExpanded ? 1 : 0)
  const width = useTransform(progress, [0, 1], ["300px", "100%"])
  const borderRadius = useTransform(progress, [0, 1], ["50px", "32px"])
  
  // Animations de réduction au scroll
  const searchScale = useTransform(scrollY, [0, 150], [1, 0.85])
  const searchPadding = useTransform(scrollY, [0, 150], [8, 4])

  useEffect(() => {
    progress.set(isExpanded ? 1 : 0)
    onStateChange?.(isExpanded)
  }, [isExpanded, progress, onStateChange])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSearch = () => {
    setIsSearching(true)
    // Logique de recherche ici
    setTimeout(() => {
      setIsSearching(false)
      router.push("/gallery")
    }, 800)
  }

  const clearField = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: "" }))
  }

  const hasValues = Object.values(formData).some(value => value.length > 0)

  const containerVariants = {
    compact: {
      maxWidth: "300px"
    },
    expanded: {
      maxWidth: "100%"
    }
  }

  const fieldVariants = {
    hidden: { 
      opacity: 0, 
      width: 0,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      width: "auto",
      scale: 1
    }
  }

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto px-6"
      layout
    >
      <motion.div
        ref={searchBarRef}
        className="relative"
        variants={containerVariants}
        animate={isExpanded ? "expanded" : "compact"}
        transition={{ duration: 0.5, ease: "easeOut" }}
        layout
      >
        {/* Barre de recherche principale */}
        <motion.div
          className="bg-white shadow-lg border border-gray-200 backdrop-blur-sm relative overflow-hidden"
          style={{ 
            width: variant === "compact" ? width : "100%",
            borderRadius: "32px",
            scale: variant === "full" ? searchScale : 1
          }}
          whileHover={{ 
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
          layout
        >
          {variant === "compact" && !isExpanded ? (
            // Vue compacte
            <motion.button
              onClick={toggleExpanded}
              className="flex items-center gap-3 p-4 w-full text-left"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500 font-medium">
                Rechercher des photos...
              </span>
            </motion.button>
          ) : (
            // Vue similaire à la barre compacte
            <motion.div 
              className={`flex items-center relative ${variant === "full" ? "h-14" : "h-10"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex-shrink-0" ref={useRef(null)}>
                <motion.button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center justify-center gap-2 ${variant === "full" ? "px-6 py-3 text-base" : "px-4 py-1.5 text-sm"} font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-l-full transition-colors border-r border-gray-200 h-full whitespace-nowrap`}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className={variant === "full" ? "w-5 h-5" : "w-4 h-4"} />
                  <span>{formData.date || "Date"}</span>
                </motion.button>
                
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
                    >
                      <SimpleCalendar
                        selectedDate={formData.date}
                        onDateSelect={(date) => {
                          setFormData(prev => ({ ...prev, date }))
                          setShowDatePicker(false)
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="relative flex-shrink-0" ref={useRef(null)}>
                <motion.button
                  onClick={() => setShowSchoolList(!showSchoolList)}
                  className={`flex items-center justify-center gap-2 ${variant === "full" ? "px-6 py-3 text-base" : "px-4 py-1.5 text-sm"} font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors h-full whitespace-nowrap`}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <School className={variant === "full" ? "w-5 h-5" : "w-4 h-4"} />
                  <span className="truncate max-w-[150px]">{formData.school || "École"}</span>
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
                            setFormData(prev => ({ ...prev, school: school.name }))
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

              <motion.button
                onClick={handleSearch}
                className={`bg-blue-600 text-white ${variant === "full" ? "h-12 w-12" : "h-8 w-8"} rounded-full hover:bg-blue-700 transition-colors ml-1 mr-1 flex items-center justify-center flex-shrink-0`}
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "#1d4ed8"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className={variant === "full" ? "h-5 w-5" : "h-3.5 w-3.5"} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Suggestions rapides (quand étendu et avec valeurs) */}
        <CollapsibleContent isOpen={isExpanded && hasValues}>
          <motion.div 
            className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 p-4"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-semibold text-gray-500 mb-2">
              SUGGESTIONS RAPIDES
            </div>
            <div className="flex flex-wrap gap-2">
              {[...(schools.slice(0, 2).map(school => school.name)), "Cours débutant", "Session matin"].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
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
        </CollapsibleContent>
      </motion.div>
    </motion.div>
  )
} 