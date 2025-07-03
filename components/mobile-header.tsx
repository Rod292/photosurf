"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { SearchBar } from "@/components/search-bar"

export function MobileHeader() {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  // Animations for navigation icons and text
  const iconOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const textY = useTransform(scrollY, [0, 100], [0, -20])
  
  // Animation for tagline
  const taglineOpacity = useTransform(scrollY, [100, 200], [1, 0])
  const taglineScale = useTransform(scrollY, [100, 200], [1, 0.8])
  const taglineY = useTransform(scrollY, [100, 200], [0, -10])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (!isMobile) {
    return null
  }

  return (
    <div className="sticky top-0 z-40 bg-white">
      {/* Search Bar - Fixed at top */}
      <div className="px-4 py-3 border-b border-gray-200">
        <SearchBar compact={false} className="w-full" />
      </div>

      {/* Navigation Row */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-around">
          {/* Photos */}
          <motion.button
            onClick={() => handleNavigation("/gallery")}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-2xl"
            >
              📸
            </motion.span>
            <motion.span
              style={{ y: textY }}
              className="text-sm font-medium text-gray-700"
            >
              Photos
            </motion.span>
          </motion.button>

          {/* Boutique */}
          <motion.button
            onClick={() => handleNavigation("/boutique")}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-2xl"
            >
              🛍️
            </motion.span>
            <motion.span
              style={{ y: textY }}
              className="text-sm font-medium text-gray-700"
            >
              Boutique
            </motion.span>
          </motion.button>

          {/* Contact */}
          <motion.button
            onClick={() => handleNavigation("/contact")}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-2xl"
            >
              📞
            </motion.span>
            <motion.span
              style={{ y: textY }}
              className="text-sm font-medium text-gray-700"
            >
              Contact
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Tagline */}
      <motion.div
        style={{
          opacity: taglineOpacity,
          scale: taglineScale,
          y: taglineY
        }}
        className="px-4 py-3 text-center"
      >
        <p className="text-sm text-gray-600 font-medium">
          Retrouvez vos photos de surf à La Torche
        </p>
      </motion.div>
    </div>
  )
}