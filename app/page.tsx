"use client"

import { Suspense, useState } from "react"
import { MorphingSearch } from "@/components/morphing-search"
import { ContentFlowAnimation, FlowItem } from "@/components/animations/content-flow-animation"
import { LatestPhotosSectionClient } from "@/components/latest-photos-section-client"
import { PhotosByDate } from "@/components/photos-by-date"
import { PhotosBySchool } from "@/components/photos-by-school"
import { Header } from "@/components/header"
import { motion, useScroll, useTransform } from "framer-motion"

export default function HomePage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header toujours visible */}
      <Header alwaysVisible={true} />
      
      {/* Hero section avec barre de recherche */}
      <section className="bg-white border-b border-gray-200">
        <div className="relative">
          {/* Image de fond subtile */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
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
                Retrouvez vos photos de surf à{" "}
                <motion.span 
                  className="text-red-500"
                  initial={{ color: "#374151" }}
                  animate={{ color: "#ef4444" }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  La Torche
                </motion.span>
              </motion.h1>
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

      {/* Section Photos récentes */}
      <ContentFlowAnimation 
        className="bg-white border-t border-gray-100"
        layoutId="recent-photos"
        staggerChildren={0.1}
      >
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4">
            <FlowItem className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                📸 Photos récentes >
              </h2>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  📅 Sessions par jour >
                </h2>
              </FlowItem>
              <FlowItem>
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i} 
                      className="w-72 h-80 bg-white rounded-xl animate-pulse flex-shrink-0"
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
                  🏄‍♂️ Écoles de surf >
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
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
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
            <p className="text-xl mb-8 opacity-90">
              Contactez-nous directement et nous vous aiderons à les retrouver
            </p>
          </FlowItem>
          <FlowItem delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📱</span>
                Nous contacter sur Instagram
              </motion.a>
              <motion.button 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Par téléphone
              </motion.button>
            </div>
          </FlowItem>
        </div>
      </ContentFlowAnimation>

    </div>
  )
}

