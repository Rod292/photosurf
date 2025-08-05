'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
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

  return (
    <>
      {/* Bouton retour accueil */}
      <div className="bg-white py-4 border-b border-gray-200">
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

      {/* Hero Section avec image de fond */}
      <div className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/Logos/DJI_03862025LaTorche-3.jpg"
            alt="Vue aérienne La Torche Plomeur Bretagne - Spot surf emblématique photographié par Arode Studio"
            fill
            className="object-cover"
            priority
          />
          {/* Léger overlay sombre uniquement pour la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>
        
        {/* Contenu */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold font-playfair mb-4 md:mb-8 drop-shadow-lg">
            {t.gallery.title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-varela-round opacity-95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
            {t.gallery.subtitle}
          </p>
        </div>
      </div>

      {/* Filtres actifs */}
      {hasFilters && (
        <div className="bg-blue-50 py-4">
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
              <Link 
                href="/gallery"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {t.gallery.clearFilters}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <GalleryInstructions language={language} onLanguageChange={setLanguage} />

      {/* Galleries Grid */}
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
    </>
  )
}