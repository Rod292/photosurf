'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { motion } from "framer-motion"
import { LanguageSwitcher } from '@/components/language-switcher'
import { getTranslation, Language } from '@/lib/translations'
import { GalleryInstructions } from "@/components/gallery-instructions"
import { GalleryClient } from "./gallery-client"
import { GallerySessionsClient } from "./gallery-sessions-client"
import { Gallery } from "@/lib/database.types"

interface GalleryPageWrapperProps {
  galleries: Gallery[]
  latestPhotos: any[]
  hasFilters: boolean
  isSchoolFilter: boolean
  isDateFilter: boolean
  searchParams: {
    date?: string
    school?: string
    location?: string
  }
}

export function GalleryPageWrapper({
  galleries,
  latestPhotos,
  hasFilters,
  isSchoolFilter,
  isDateFilter,
  searchParams
}: GalleryPageWrapperProps) {
  const [language, setLanguage] = useState<Language>('fr')
  const t = getTranslation(language)
  
  // Determine background image based on location
  const getHeroImage = () => {
    if (searchParams.location === 'siargao') {
      return "/images/siargao-hero-bg.jpg"
    }
    return "/Logos/DJI_03862025LaTorche-3.jpg" // Default La Torche image
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton retour accueil - moved above hero */}
      <div className="relative z-20 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4" />
            <span className="font-medium">{t.gallery.backHome}</span>
          </Link>
        </div>
      </div>

      {/* Hero Section avec image de fond et animations */}
      <section className="hidden md:block bg-white border-b border-gray-200">
        <div className="relative bg-white">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={getHeroImage()}
              alt={searchParams.location === 'siargao' 
                ? "Siargao surf waves - Professional surf photography by Arode Studio"
                : "Vue aérienne La Torche Plomeur Bretagne - Spot surf emblématique photographié par Arode Studio"
              }
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          </div>
          
          {/* Content with animations */}
          <motion.div
            className="relative z-10 max-w-6xl mx-auto pt-16 pb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="text-center mb-4"
              variants={titleVariants}
            >
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {t.gallery.title}
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {t.gallery.subtitle}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filtres actifs */}
      {hasFilters && (
        <motion.div 
          className="bg-blue-50 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-gray-700">{t.gallery.activeFilters}</span>
              {searchParams.date && (
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200 flex items-center gap-1">
                  <Image
                    src="/Logos/Calendar.svg"
                    alt="Calendar"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  {searchParams.date && !isNaN(new Date(searchParams.date).getTime()) 
                    ? new Date(searchParams.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : 'en-US')
                    : t.gallery.invalidDate}
                </span>
              )}
              {searchParams.school && (
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                  <Image
                    src="/Logos/surfer.svg"
                    alt="Surfer"
                    width={16}
                    height={16}
                    className="w-4 h-4 mr-1"
                  />
                  {searchParams.school}
                </span>
              )}
              {searchParams.location && (
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                  📍 {searchParams.location === 'siargao' ? 'Siargao' : 'La Torche'}
                </span>
              )}
              <Link 
                href="/gallery"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {t.gallery.clearFilters}
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <GalleryInstructions language={language} onLanguageChange={setLanguage} />
      </motion.div>

      {/* Galleries Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        {isSchoolFilter ? (
          // Layout spécial pour le filtre par école
          <GalleryClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            schoolName={searchParams.school}
            language={language}
          />
        ) : isDateFilter ? (
          // Layout spécial pour le filtre par date
          <GalleryClient 
            latestPhotos={latestPhotos}
            galleries={galleries}
            dateFilter={searchParams.date}
            language={language}
          />
        ) : (
          // Layout organisé par sessions individuelles
          <GallerySessionsClient galleries={galleries} />
        )}
      </motion.div>
    </div>
  )
}