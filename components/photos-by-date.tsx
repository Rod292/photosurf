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
    session_period?: string
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
            <div key={i} className="w-48 h-80 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
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
        {galleryGroups.map((group) => {
          const totalPhotos = group.galleries.reduce((sum, gallery) => sum + gallery.photoCount, 0)
          const coverPhoto = group.galleries.find(g => g.coverPhoto)?.coverPhoto || group.galleries[0]?.coverPhoto
          
          return (
            <Link key={group.date} href={`/gallery?date=${group.date}`} className="flex-shrink-0">
              <div className="w-44 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="relative h-64 rounded-t-xl overflow-hidden">
                  {coverPhoto ? (
                    <Image
                      src={coverPhoto}
                      alt={`Photos du ${new Date(group.date).toLocaleDateString('fr-FR')}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Image
                        src="/Logos/camera2.svg"
                        alt="Camera"
                        width={40}
                        height={40}
                        className="w-10 h-10"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  )}
                  
                  {/* Badge du nombre de photos centré en bas */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {totalPhotos} photo{totalPhotos > 1 ? 's' : ''}
                  </div>
                  
                  {/* Badge du nombre de sessions à droite */}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {group.galleries.length} session{group.galleries.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      {new Date(group.date).toLocaleDateString('fr-FR', {
                        weekday: 'long'
                      })}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {new Date(group.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 