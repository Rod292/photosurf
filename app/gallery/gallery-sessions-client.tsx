"use client"

import { useState } from "react"
import Image from "next/image"
import { SupabaseImage } from "@/components/ui/supabase-image"
import Link from "next/link"
import { motion } from "framer-motion"
import { StaggerContainer, StaggerItem } from "@/components/animations/page-transition"

interface GallerySessionsClientProps {
  galleries: any[]
}

export function GallerySessionsClient({ galleries }: GallerySessionsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  
  // Chaque galerie est une session séparée
  const sessionsWithPhotos = galleries
    .filter((gallery: any) => gallery.photos && gallery.photos.length > 0)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Grouper les sessions par date avec compteur
  const sessionsByDate = sessionsWithPhotos.reduce((acc: any, gallery: any) => {
    const date = gallery.date
    if (!acc[date]) {
      acc[date] = {
        date,
        sessions: [],
        totalPhotos: 0
      }
    }
    acc[date].sessions.push(gallery)
    acc[date].totalPhotos += gallery.photos?.length || 0
    return acc
  }, {})

  const uniqueDates = Object.keys(sessionsByDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Grouper par mois
  const sessionsByMonth = uniqueDates.reduce((acc: any, date: string) => {
    const dateObj = new Date(date)
    const month = dateObj.getMonth() + 1 // 1-12
    const year = dateObj.getFullYear()
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthKey,
        month,
        year,
        monthName: dateObj.toLocaleDateString('fr-FR', { month: 'long' }),
        sessions: {},
        totalPhotos: 0,
        sessionCount: 0
      }
    }
    
    acc[monthKey].sessions[date] = sessionsByDate[date]
    acc[monthKey].totalPhotos += sessionsByDate[date].totalPhotos
    acc[monthKey].sessionCount += sessionsByDate[date].sessions.length
    
    return acc
  }, {})

  // Obtenir les mois triés (plus récent en premier)
  const monthKeys = Object.keys(sessionsByMonth)
    .sort((a, b) => b.localeCompare(a)) // Tri décroissant (2024-08, 2024-07, etc.)

  const handleMonthSelect = (monthKey: string) => {
    setSelectedMonth(monthKey)
  }

  const handleBackToMonths = () => {
    setSelectedMonth(null)
  }



  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
          Sessions par mois
        </h2>
        

        
        {/* Vue conditionnelle : Mois → Jours (direct vers galerie) */}
        {selectedMonth ? (
          /* Vue 2: Jours d'un mois spécifique */
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 capitalize">
                {sessionsByMonth[selectedMonth]?.monthName} {sessionsByMonth[selectedMonth]?.year}
              </h3>
              <div className="flex justify-center gap-6 text-sm text-gray-600 mb-4">
                <span>{sessionsByMonth[selectedMonth]?.totalPhotos} photos</span>
                <span>{sessionsByMonth[selectedMonth]?.sessionCount} sessions</span>
                <span>{Object.keys(sessionsByMonth[selectedMonth]?.sessions || {}).length} jours</span>
              </div>
              <button
                onClick={handleBackToMonths}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Retour aux mois
              </button>
            </div>
            
            {sessionsByMonth[selectedMonth] ? (
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" staggerDelay={0.05}>
                {Object.keys(sessionsByMonth[selectedMonth].sessions)
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .map((date) => {
                    const dateData = sessionsByMonth[selectedMonth].sessions[date]
                    const firstSession = dateData.sessions[0]
                    
                    return (
                      <StaggerItem key={date}>
                        <Link href={`/gallery?date=${date}`} className="block">
                          <motion.div
                            className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group"
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                          <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-400 to-blue-600">
                            {firstSession.photos && firstSession.photos.length > 0 ? (
                              <SupabaseImage
                                src={firstSession.photos[0].preview_s3_url}
                                alt={`Photos du ${new Date(date).toLocaleDateString('fr-FR')}`}
                                width={300}
                                height={400}
                                className="w-full h-full object-cover"
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
                            
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                              {dateData.totalPhotos} photo{dateData.totalPhotos > 1 ? 's' : ''}
                            </div>
                            
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                              {dateData.sessions.length} session{dateData.sessions.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">
                                {new Date(date).toLocaleDateString('fr-FR', {
                                  weekday: 'long'
                                })}
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {new Date(date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </div>
                            </div>
                          </div>
                          </motion.div>
                        </Link>
                      </StaggerItem>
                    )
                  })}
              </StaggerContainer>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-2xl font-semibold mb-4">Aucune session pour ce mois</h3>
                <p className="text-gray-600">Essayez de sélectionner un autre mois</p>
              </div>
            )}
          </div>
        ) : (
          /* Vue 1: Liste des mois (Vue épurée par défaut) */
          <div>
            {monthKeys.length === 0 ? (
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
                <h3 className="text-2xl font-semibold mb-4">Aucune session disponible</h3>
                <p className="text-gray-600">Les nouvelles sessions seront bientôt disponibles !</p>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto" staggerDelay={0.1}>
                {monthKeys.map((monthKey) => {
                  const monthData = sessionsByMonth[monthKey]
                  const monthDates = Object.keys(monthData.sessions)
                  const firstDate = monthDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
                  const firstSession = firstDate ? monthData.sessions[firstDate].sessions[0] : null
                  
                  return (
                    <StaggerItem key={monthKey}>
                      <motion.div
                        onClick={() => handleMonthSelect(monthKey)}
                        className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Image d'en-tête du mois */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                          {firstSession?.photos && firstSession.photos.length > 0 ? (
                            <SupabaseImage
                              src={firstSession.photos[0].preview_s3_url}
                              alt={`${monthData.monthName} ${monthData.year}`}
                              width={400}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image
                                src="/Logos/camera2.svg"
                                alt="Camera"
                                width={60}
                                height={60}
                                className="w-15 h-15"
                                style={{ filter: 'brightness(0) invert(1)' }}
                              />
                            </div>
                          )}
                          
                          {/* Overlay avec titre du mois */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                            <div className="p-6 text-white">
                              <h3 className="text-2xl md:text-3xl font-bold capitalize">
                                {monthData.monthName}
                              </h3>
                              <p className="text-lg opacity-90">{monthData.year}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Statistiques du mois */}
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">{monthData.totalPhotos}</div>
                              <div className="text-sm text-gray-600">photos</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">{monthData.sessionCount}</div>
                              <div className="text-sm text-gray-600">sessions</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{monthDates.length}</div>
                              <div className="text-sm text-gray-600">jours</div>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-center">
                            <span className="text-blue-600 font-medium text-sm group-hover:text-blue-800 transition-colors">
                              Voir les sessions →
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            )}
          </div>
        )}
      </div>
    </div>
  )
}