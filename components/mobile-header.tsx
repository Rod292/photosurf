"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { MorphingSearch } from "@/components/morphing-search"

export function MobileHeader() {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  // Animations for navigation icons and text
  const iconOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const textY = useTransform(scrollY, [0, 100], [0, -12])

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
      {/* Main Search Bar - Fixed at top */}
      <div className="px-4 py-2 pb-1">
        <MorphingSearch />
      </div>

      {/* Navigation Row */}
      <motion.div 
        className="px-4 pb-2 border-b border-gray-200"
        style={{ y: textY }}
      >
        <div className="flex items-center justify-around">
          {/* Photos */}
          <motion.button
            onClick={() => handleNavigation("/gallery")}
            className="flex flex-col items-center gap-0 px-2 py-0 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-xl"
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
            className="flex flex-col items-center gap-0 px-2 py-0 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-xl"
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
            className="flex flex-col items-center gap-0 px-2 py-0 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              style={{ opacity: iconOpacity }}
              className="text-xl"
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
      </motion.div>
    </div>
  )
}