"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { SupabaseImage } from "@/components/ui/supabase-image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { StaggerContainer, StaggerItem } from "@/components/animations/page-transition"
import { SimpleCalendar } from "@/components/ui/simple-calendar"
import { Calendar } from "lucide-react"

interface GallerySessionsClientProps {
  galleries: any[]
}

export function GallerySessionsClient({ galleries }: GallerySessionsClientProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)
  
  // Chaque galerie est une session séparée
  const sessionsWithPhotos = galleries
    .filter((gallery: any) => gallery.photos && gallery.photos.length > 0)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filtrer par date si sélectionnée
  const filteredSessions = selectedDate 
    ? sessionsWithPhotos.filter((gallery: any) => gallery.date === selectedDate)
    : sessionsWithPhotos

  // Obtenir toutes les dates uniques pour le sélecteur
  const uniqueDates = [...new Set(sessionsWithPhotos.map((gallery: any) => gallery.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const handleDateFilter = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date)
  }

  // Fermer le date picker au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowCustomDatePicker(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCustomDateSelect = (date: string) => {
    if (uniqueDates.includes(date)) {
      setSelectedDate(date)
    }
    setShowCustomDatePicker(false)
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
          Sessions par jour
        </h2>
        
        {/* Sélecteur de dates */}
        {uniqueDates.length > 1 && (
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <span className="text-sm font-medium text-gray-700">Filtrer par date :</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap items-center">
              {/* Bouton toutes les dates */}
              <motion.button
                onClick={() => setSelectedDate(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDate === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Toutes les dates
              </motion.button>
              
              {/* Les 3 dernières dates */}
              {uniqueDates.slice(0, 3).map((date) => (
                <motion.button
                  key={date}
                  onClick={() => handleDateFilter(date)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {new Date(date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </motion.button>
              ))}
              
              {/* Date picker personnalisé pour les autres dates */}
              <div className="relative" ref={datePickerRef}>
                <motion.button
                  onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    selectedDate && !uniqueDates.slice(0, 3).includes(selectedDate)
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {selectedDate && !uniqueDates.slice(0, 3).includes(selectedDate)
                      ? new Date(selectedDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Plus de dates'
                    }
                  </span>
                </motion.button>
                
                <AnimatePresence>
                  {showCustomDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    >
                      <SimpleCalendar
                        selectedDate={selectedDate || ''}
                        onDateSelect={handleCustomDateSelect}
                        availableDates={uniqueDates}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                  {uniqueDates.length > 3 ? 'Plus de dates' : 'Choisir une date'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <Image
                src="/Logos/camera2.svg"
                alt="Camera"
                width={96}
                height={96}
                className="w-24 h-24"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">
              {selectedDate ? "Aucune session pour cette date" : "Aucune session disponible"}
            </h3>
            <p className="text-gray-600">
              {selectedDate 
                ? "Essayez de sélectionner une autre date ou voir toutes les sessions" 
                : "Les nouvelles sessions seront bientôt disponibles !"}
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4" staggerDelay={0.1}>
            {filteredSessions.map((gallery: any, index: number) => (
              <StaggerItem key={gallery.id}>
                <Link href={`/gallery/${gallery.id}`} className="block">
                  <motion.div
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Image en format portrait optimisé */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-400 to-blue-600">
                      {gallery.photos && gallery.photos.length > 0 ? (
                        <SupabaseImage
                          src={gallery.photos[0].preview_s3_url}
                          alt={`Photos de ${gallery.name}`}
                          width={300}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
                      
                      {/* Badge du nombre de photos */}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {gallery.photos?.length || 0}
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {gallery.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {new Date(gallery.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-600">
                          {gallery.photos?.length || 0} photo{(gallery.photos?.length || 0) > 1 ? 's' : ''}
                        </span>
                        {/* École de surf si disponible */}
                        {gallery.surf_schools && (
                          <div className="flex items-center gap-1">
                            <Image
                              src="/Logos/surfer.svg"
                              alt="Surf school"
                              width={12}
                              height={12}
                              className="w-3 h-3"
                            />
                            <span className="text-xs text-gray-500 truncate max-w-[60px]">
                              {gallery.surf_schools.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}