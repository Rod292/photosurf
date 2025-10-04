"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { MorphingSearch } from "@/components/morphing-search"
import { ContentFlowAnimation, FlowItem } from "@/components/animations/content-flow-animation"
import { LatestPhotosSectionClient } from "@/components/latest-photos-section-client"
import { PhotosByDate } from "@/components/photos-by-date"
import { PhotosBySchool } from "@/components/photos-by-school"
import { Header } from "@/components/header"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SimpleCalendar } from "@/components/ui/simple-calendar"

interface LocationData {
  name: string
  title: string
  subtitle: string
  description: string
  zone: string
  schoolName: string
  schoolUrl: string
  schoolLogo: string
  coverageArea: {
    title: string
    subtitle: string
    points: string[]
  }
}

export function LocationPageClient({ location, slug }: { location: LocationData; slug: string }) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const router = useRouter()
  const dateRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const titleScale = useTransform(scrollY, [0, isMobile ? 100 : 200], [1, isMobile ? 0.8 : 0])
  const titleOpacity = useTransform(scrollY, [isMobile ? 50 : 100, isMobile ? 100 : 200], [1, 0])
  const titleY = useTransform(scrollY, [0, isMobile ? 100 : 200], [0, isMobile ? -20 : -50])
  
  const searchScale = useTransform(scrollY, [0, isMobile ? 100 : 200], [1, isMobile ? 0.9 : 0])
  const searchOpacity = useTransform(scrollY, [isMobile ? 50 : 100, isMobile ? 100 : 200], [1, 0])
  const searchY = useTransform(scrollY, [0, isMobile ? 100 : 200], [0, isMobile ? -20 : -50])
  
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

  const searchBarVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.6
      }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  }

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
    router.push(`/gallery?date=${date}&location=${slug}`)
  }

  const handleCalendarClick = () => {
    setShowDatePicker(!showDatePicker)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible={true} />
      
      {/* Hero section */}
      <section className="hidden md:block bg-white border-b border-gray-200">
        <div className="relative bg-white">
          <motion.div
            className="relative z-10 max-w-6xl mx-auto pt-6 pb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="text-center mb-4"
              variants={titleVariants}
              style={{
                scale: titleScale,
                opacity: titleOpacity,
                y: titleY
              }}
            >
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {location.title.split(location.name).map((part, index) => (
                  <span key={index}>
                    {part}
                    {index === 0 && (
                      <motion.span 
                        className="text-red-500"
                        initial={{ color: "#374151" }}
                        animate={{ color: "#ef4444" }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                      >
                        {location.name}
                      </motion.span>
                    )}
                  </span>
                ))}
              </motion.h1>
            </motion.div>

            <motion.div
              variants={searchBarVariants}
              initial="hidden"
              animate="visible"
              style={{
                scale: searchScale,
                opacity: searchOpacity,
                y: searchY
              }}
            >
              <MorphingSearch locationSlug={slug} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sessions par jour */}
      <ContentFlowAnimation 
        className="bg-gray-50"
        layoutId={`sessions-by-date-${slug}`}
        staggerChildren={0.15}
      >
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="px-6 py-4">
              <FlowItem>
                <div className="relative mb-6" ref={dateRef}>
                  <button 
                    onClick={handleCalendarClick}
                    className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer p-2 -m-2 rounded-lg hover:bg-gray-100"
                  >
                    <Image
                      src="/Logos/Calendar.svg"
                      alt={`Calendrier sessions surf ${location.name} - Arode Studio`}
                      width={24}
                      height={24}
                      className="w-5 h-5 md:w-6 md:h-6"
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
              </FlowItem>
              <FlowItem>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i} 
                      className="w-48 h-72 bg-white rounded-xl animate-pulse flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </FlowItem>
            </div>
          }>
            <PhotosByDate locationSlug={slug} />
          </Suspense>
        </div>
      </ContentFlowAnimation>

      {/* Photos récentes */}
      <ContentFlowAnimation 
        className={`${slug === 'siargao' ? 'relative' : 'bg-white'} border-t border-gray-100`}
        layoutId={`recent-photos-${slug}`}
        staggerChildren={0.1}
      >
        {slug === 'siargao' && (
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/siargao-hero-bg.jpg"
              alt="Siargao surf background"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-white/90" />
          </div>
        )}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="px-6 py-4">
            <FlowItem className="mb-6">
              <Link href={`/gallery?location=${slug}`}>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer">
                  <Image
                    src="/Logos/camera2.svg"
                    alt={`Appareil photo - Photos surf professionnel ${location.name}`}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  Photos récentes {'>'}
                </h2>
              </Link>
            </FlowItem>
            <FlowItem>
              <Suspense fallback={
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="w-80 h-64 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              }>
                <LatestPhotosSectionClient locationSlug={slug} />
              </Suspense>
            </FlowItem>
          </div>
        </div>
      </ContentFlowAnimation>
              
      {/* Écoles de surf */}
      <ContentFlowAnimation 
        className="bg-white"
        layoutId={`schools-${slug}`}
        staggerChildren={0.1}
      >
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="px-6 py-4">
              <FlowItem>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  🏄‍♂️ Écoles de surf {'>'}
                </h2>
              </FlowItem>
              <FlowItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="bg-gray-200 rounded-xl h-64 animate-pulse"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </FlowItem>
            </div>
          }>
            <PhotosBySchool locationSlug={slug} />
          </Suspense>
        </div>
      </ContentFlowAnimation>

      {/* Call-to-Action */}
      <ContentFlowAnimation 
        className="bg-white text-black"
        layoutId={`cta-${slug}`}
        staggerChildren={0.2}
      >
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <FlowItem>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vous ne trouvez pas vos photos ?
            </h2>
          </FlowItem>
          <FlowItem delay={0.2}>
            <p className="text-xl mb-8">
              Contactez-nous directement et nous vous aiderons à les retrouver
            </p>
          </FlowItem>
          <FlowItem delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/Logos/phone-logo.svg"
                  alt={`Téléphone - Contacter photographe surf ${location.name}`}
                  width={20}
                  height={20}
                  className="w-5 h-5 inline"
                />
                Nous contacter sur Instagram
              </motion.a>
              <motion.a 
                href="mailto:contact@arodestudio.com"
                className="border-2 border-black text-black px-8 py-3 rounded-full font-semibold hover:bg-black/10 transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/Logos/mail-logo.svg"
                  alt="Email - Contact Arode Studio photographe surf"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Par email
              </motion.a>
            </div>
          </FlowItem>
        </div>
      </ContentFlowAnimation>

      {/* SEO & Partenariat */}
      <ContentFlowAnimation 
        className="bg-gray-50 border-t border-gray-200"
        layoutId={`seo-partner-section-${slug}`}
        staggerChildren={0.15}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">
          <FlowItem>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {location.subtitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {location.description}
              </p>
            </div>
          </FlowItem>
          
          {/* Partenaire */}
          <FlowItem delay={0.2}>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  École de Surf Partenaire Officielle
                </h3>
                <a 
                  href={location.schoolUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block hover:scale-105 transition-transform duration-300"
                >
                  <div className="flex items-center justify-center gap-4">
                    <Image
                      src={location.schoolLogo}
                      alt={`${location.schoolName} - École de surf partenaire`}
                      width={80}
                      height={80}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain"
                    />
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-gray-900">{location.schoolName}</h4>
                      <p className="text-gray-600 text-sm">Cours et stages de surf à {location.name}</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </FlowItem>
          
          {/* Contenu SEO */}
          <div className="grid md:grid-cols-3 gap-8">
            <FlowItem delay={0.3}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/Logos/camera2.svg"
                    alt="Photos surf professionnel"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Sessions Surf Immortalisées
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Photos haute résolution de vos sessions de surf à {location.name}. 
                  Présents quotidiennement sur les spots.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Qualité professionnelle
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Livraison immédiate par email
                  </li>
                </ul>
              </div>
            </FlowItem>
            
            <FlowItem delay={0.4}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/Logos/surfer.svg"
                    alt={`Expertise surf ${location.name}`}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Expertise {location.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Spécialisés dans la photographie de surf à {location.name}. 
                  Connaissance parfaite des conditions et meilleurs angles.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Tous niveaux de surfeurs
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Service client personnalisé
                  </li>
                </ul>
              </div>
            </FlowItem>
            
            <FlowItem delay={0.5}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/Logos/maps.svg"
                    alt={`Zone couverture ${location.name}`}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Zone de Couverture
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  <strong>{location.coverageArea.title}</strong> - {location.coverageArea.subtitle}. 
                  Couverture complète des spots de surf.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {location.coverageArea.points.map((point, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </FlowItem>
          </div>
        </div>
      </ContentFlowAnimation>
    </div>
  )
}