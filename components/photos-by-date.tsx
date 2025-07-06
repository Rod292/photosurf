"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { SimpleCalendar } from "./ui/simple-calendar"
import { motion, AnimatePresence } from "framer-motion"

interface GalleryByDate {
  date: string
  galleries: Array<{
    id: string
    name: string
    photoCount: number
    coverPhoto?: string
  }>
}

export function PhotosByDate() {
  const [galleryGroups, setGalleryGroups] = useState<GalleryByDate[]>([])
  const [loading, setLoading] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const router = useRouter()
  const dateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchGalleriesByDate() {
      try {
        const response = await fetch('/api/galleries-by-date')
        if (response.ok) {
          const data = await response.json()
          setGalleryGroups(data.galleryGroups || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleriesByDate()
  }, [])

  // Fermer le calendrier au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setShowDatePicker(false)
    router.push(`/gallery?date=${date}`)
  }

  const handleCalendarClick = () => {
    setShowDatePicker(!showDatePicker)
  }

  if (loading) {
    return (
      <div className="px-6 py-4">
        <div className="relative" ref={dateRef}>
          <button 
            onClick={handleCalendarClick}
            className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <Image
              src="/Logos/Calendar.svg"
              alt="Calendar"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            Sessions par jour {'>'}
          </button>
          
          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2"
              >
                <SimpleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-64 h-48 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (galleryGroups.length === 0) {
    return null
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6 relative" ref={dateRef}>
        <button 
          onClick={handleCalendarClick}
          className="text-xl font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <Image
            src="/Logos/Calendar.svg"
            alt="Calendar"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          Sessions par jour {'>'}
        </button>
        
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2"
            >
              <SimpleCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {galleryGroups.map((group) => (
          <Link key={group.date} href={`/gallery?date=${group.date}`} className="flex-shrink-0">
            <div className="w-72 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              {/* Image de couverture */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                {group.galleries[0]?.coverPhoto ? (
                  <Image
                    src={group.galleries[0].coverPhoto}
                    alt={`Photos du ${new Date(group.date).toLocaleDateString('fr-FR')}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">📸</span>
                  </div>
                )}
                
                {/* Badge avec nombre de sessions */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {group.galleries.length} session{group.galleries.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {/* Date sous la photo */}
              <div className="p-4">
                <h3 className="text-center font-semibold text-black">
                  {new Date(group.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 