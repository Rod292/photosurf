"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { MorphingSearch } from "@/components/morphing-search"
import StructuredData from "@/components/structured-data"

export default function HomePage() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  // Scroll animations like location pages
  const { scrollY } = useScroll()
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Header scroll animations
  const titleScale = useTransform(scrollY, [0, isMobile ? 100 : 200], [1, isMobile ? 0.8 : 0])
  const titleOpacity = useTransform(scrollY, [isMobile ? 50 : 100, isMobile ? 100 : 200], [1, 0])
  const titleY = useTransform(scrollY, [0, isMobile ? 100 : 200], [0, isMobile ? -20 : -50])
  
  const searchScale = useTransform(scrollY, [0, isMobile ? 100 : 200], [1, isMobile ? 0.9 : 0])
  const searchOpacity = useTransform(scrollY, [isMobile ? 50 : 100, isMobile ? 100 : 200], [1, 0])
  const searchY = useTransform(scrollY, [0, isMobile ? 100 : 200], [0, isMobile ? -20 : -50])
  
  // Using your actual surf images
  const backgroundImages = [
    "/images/surf-air-1.jpg",      // Pink board aerial
    "/images/surf-barrel-1.jpg",   // Surfer in barrel  
    "/images/surf-barrel-2.jpg"    // Siargao barrel wave
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [backgroundImages.length])
  
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
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

  const locations = [
    {
      name: "La Torche",
      slug: "la-torche",
      image: "/images/la-torche-aerial.jpg",
      description: "Brittany, France"
    },
    {
      name: "Siargao",
      slug: "siargao", 
      image: "/images/surf-barrel-2.jpg",
      description: "Philippines"
    }
  ]

  return (
    <>
      <StructuredData page="home" />
      <div className="min-h-screen relative overflow-hidden">
        {/* Background - instant switch */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImages[currentBgIndex]}
            alt="Surf Photography by Arode Studio"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Header with scroll animations */}
        <Header alwaysVisible={true} />

        {/* Hero section with scroll-based animations - Desktop */}
        <section className="hidden md:block relative z-10">
          <div className="relative">
            <motion.div
              className="relative z-10 max-w-6xl mx-auto pt-6 pb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Title with scroll animations */}
              <motion.div
                className="text-center mb-8"
                variants={titleVariants}
                style={{
                  scale: titleScale,
                  opacity: titleOpacity,
                  y: titleY
                }}
              >
                <motion.h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  Your Surf Photos
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-white/90 drop-shadow-md mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  by <span className="font-semibold">Arode Studio</span>
                </motion.p>

              </motion.div>

              {/* Location Selection - moved up and excluded from scroll animations */}
              <motion.div 
                className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                  {locations.map((location, index) => (
                    <motion.div
                      key={location.slug}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.4 + (index * 0.2) }}
                    >
                      <Link href={`/location/${location.slug}`}>
                        <div className="group cursor-pointer">
                          {/* Round Image Container */}
                          <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-4 overflow-hidden rounded-full border-4 border-white/20 group-hover:border-white/40 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                            <Image
                              src={location.image}
                              alt={`${location.name} - Surf Photography`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              unoptimized
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                                {location.name}
                              </h2>
                            </div>
                          </div>
                          {/* Location Description */}
                          <p className="text-lg md:text-xl text-white/80 group-hover:text-white transition-colors text-center">
                            {location.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.8 }}
                >
                  <p className="text-white/70 text-lg">
                    Select your spot to view photos
                  </p>
                </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Mobile Hero section */}
        <section className="md:hidden relative z-10">
          <div className="relative">
            <motion.div
              className="relative z-10 max-w-6xl mx-auto pt-6 pb-8 px-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Mobile Title */}
              <motion.div
                className="text-center mb-8"
                variants={titleVariants}
              >
                <motion.h1 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  Your Surf Photos
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-white/90 drop-shadow-md mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  by <span className="font-semibold">Arode Studio</span>
                </motion.p>
              </motion.div>

              {/* Mobile Location Selection - excluded from scroll animations */}
              <motion.div 
                className="flex flex-row gap-6 justify-center items-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {locations.map((location, index) => (
                  <motion.div
                    key={location.slug}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 + (index * 0.2) }}
                  >
                    <Link href={`/location/${location.slug}`}>
                      <div className="group cursor-pointer">
                        {/* Mobile Round Image Container */}
                        <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full border-4 border-white/20 group-hover:border-white/40 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                          <Image
                            src={location.image}
                            alt={`${location.name} - Surf Photography`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                              {location.name}
                            </h2>
                          </div>
                        </div>
                        {/* Mobile Location Description */}
                        <p className="text-lg text-white/80 group-hover:text-white transition-colors text-center">
                          {location.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile Call to Action */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <p className="text-white/70 text-lg">
                  Select your spot to view photos
                </p>
              </motion.div>

            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}