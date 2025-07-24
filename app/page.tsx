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
import StructuredData from "@/components/structured-data"

export default function HomePage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const router = useRouter()
  const dateRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  
  // Animations de réduction du titre et de la search bar au scroll
  const titleScale = useTransform(scrollY, [0, 200], [1, 0])
  const titleOpacity = useTransform(scrollY, [100, 200], [1, 0])
  const titleY = useTransform(scrollY, [0, 200], [0, -50])
  
  const searchScale = useTransform(scrollY, [0, 200], [1, 0])
  const searchOpacity = useTransform(scrollY, [100, 200], [1, 0])
  const searchY = useTransform(scrollY, [0, 200], [0, -50])
  
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

  // Gestion du calendrier
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
  
  return (
    <>
      <StructuredData page="home" />
      <div className="min-h-screen bg-gray-50">
      {/* Header toujours visible */}
      <Header alwaysVisible={true} />
      
      {/* Hero section avec barre de recherche - Hidden on mobile */}
      <section className="hidden md:block bg-white border-b border-gray-200">
        <div className="relative bg-white">
          
                      <motion.div
            className="relative z-10 max-w-6xl mx-auto pt-6 pb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Titre principal */}
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
                Photos de surf professionnel à{" "}
                <motion.span 
                  className="text-red-500"
                  initial={{ color: "#374151" }}
                  animate={{ color: "#ef4444" }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  La Torche
                </motion.span>
                {" "}- Bretagne
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 mb-6 max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Arode Studio immortalise vos meilleures sessions de surf à La Torche. 
                Retrouvez, visualisez et achetez vos photos de surf en haute qualité. 
                Livraison immédiate par email.
              </motion.p>
                      </motion.div>

            {/* Barre de recherche expansible */}
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
              <MorphingSearch />
                      </motion.div>
                      </motion.div>
                    </div>
      </section>

      {/* Section Sessions par jour */}
      <ContentFlowAnimation 
        className="bg-gray-50"
        layoutId="sessions-by-date"
        staggerChildren={0.15}
      >
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="px-6 py-4">
              <FlowItem>
                <div className="relative mb-6" ref={dateRef}>
                  <button 
                    onClick={handleCalendarClick}
                    className="text-xl font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <Image
                      src="/Logos/Calendar.svg"
                      alt="Calendrier sessions surf La Torche - Arode Studio"
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
            <PhotosByDate />
          </Suspense>
                  </div>
      </ContentFlowAnimation>

      {/* Section Photos récentes */}
      <ContentFlowAnimation 
        className="bg-white border-t border-gray-100"
        layoutId="recent-photos"
        staggerChildren={0.1}
      >
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4">
            <FlowItem className="mb-6">
              <Link href="/gallery">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700 transition-colors cursor-pointer">
                  <Image
                    src="/Logos/camera2.svg"
                    alt="Appareil photo - Photos surf professionnel La Torche"
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
                <LatestPhotosSectionClient />
              </Suspense>
            </FlowItem>
          </div>
        </div>
      </ContentFlowAnimation>
              
      {/* Section Écoles de surf */}
      <ContentFlowAnimation 
        className="bg-white"
        layoutId="schools"
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
            <PhotosBySchool />
          </Suspense>
              </div>
      </ContentFlowAnimation>

      {/* Section Call-to-Action */}
      <ContentFlowAnimation 
        className="bg-white text-black"
        layoutId="cta"
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
                  alt="Téléphone - Contacter photographe surf La Torche"
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
                  alt="Email - Contact Arode Studio photographe surf Bretagne"
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

      {/* Section SEO - Photos Surf La Torche */}
      <ContentFlowAnimation 
        className="bg-gray-50 border-t border-gray-200"
        layoutId="seo-latorche"
        staggerChildren={0.15}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">
          <FlowItem>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Photographe Surf Professionnel à La Torche
              </h2>
              <div className="w-24 h-1 bg-red-500 mx-auto mb-8"></div>
            </div>
          </FlowItem>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FlowItem delay={0.2}>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Sessions de Surf à La Torche Immortalisées
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  La Torche est le spot de surf emblématique de la Bretagne, et Arode Studio y capture 
                  vos plus beaux moments sur les vagues. Que vous soyez débutant ou surfeur confirmé, 
                  nos photographes professionnels immortalisent chaque session avec passion et expertise.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span>Photos haute résolution en qualité professionnelle</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span>Livraison immédiate par email sécurisé</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span>Service client personnalisé pour chaque surfeur</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    <span>Présent quotidiennement sur le spot de La Torche</span>
                  </div>
                </div>
              </div>
            </FlowItem>
            
            <FlowItem delay={0.4}>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Pourquoi Choisir Arode Studio ?
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Spécialisés dans la photographie de surf en Bretagne depuis plusieurs années, 
                  nous connaissons parfaitement les conditions et les meilleurs angles de La Torche. 
                  Notre expertise technique et notre passion du surf garantissent des clichés d'exception.
                </p>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Zone de Couverture</h4>
                  <p className="text-gray-600 text-sm">
                    <strong>La Torche</strong> - Plomeur, Finistère Sud, Bretagne<br/>
                    Couverture complète du spot : du phare jusqu'à la pointe, 
                    tous les pics et toutes les conditions de houle.
                  </p>
                </div>
              </div>
            </FlowItem>
          </div>
          
          <FlowItem delay={0.6}>
            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-4">
                Mots-clés associés : photos surf la torche, photographe surf bretagne, session surf finistère, 
                photos surf professionnel, arode studio la torche, surf photography brittany
              </p>
            </div>
          </FlowItem>
        </div>
      </ContentFlowAnimation>

      </div>
    </>
  )
}

