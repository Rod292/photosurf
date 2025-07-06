"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { MorphingSearch } from "@/components/morphing-search"
import Image from "next/image"

export function MobileHeader() {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  // Animations for navigation icons and text
  const iconOpacity = useTransform(scrollY, [0, 100], [1, 0])
  const textY = useTransform(scrollY, [0, 100], [0, -12])
  
  // Animation for tagline - smoother transitions
  const taglineScale = useTransform(scrollY, [0, 80], [1, 0.3])
  const taglineOpacity = useTransform(scrollY, [0, 60], [1, 0])
  const taglineY = useTransform(scrollY, [0, 80], [0, -20])
  const taglineHeight = useTransform(scrollY, [0, 80], ["28px", "0px"])

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
      <div className="px-4 py-2 pb-1 flex items-center gap-2">
        <div className="flex-1">
          <MorphingSearch />
        </div>
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
            <motion.div
              style={{ opacity: iconOpacity }}
              className="w-6 h-6 flex items-center justify-center"
            >
              <Image
                src="/Logos/camera2.svg"
                alt="Camera"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </motion.div>
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
            <motion.div
              style={{ opacity: iconOpacity }}
              className="w-6 h-6 flex items-center justify-center"
            >
              <Image
                src="/Logos/Call-gesture.svg"
                alt="Contact"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </motion.div>
            <motion.span
              style={{ y: textY }}
              className="text-sm font-medium text-gray-700"
            >
              Contact
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Tagline */}
      <motion.div
        className="overflow-hidden border-b border-gray-200 transition-all"
        style={{ 
          opacity: taglineOpacity,
          height: taglineHeight
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.div
          className="flex items-center justify-center gap-4 text-xs text-black py-1 relative"
          style={{ 
            scale: taglineScale,
            y: taglineY
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ 
              x: [-8, -4, 0, -4, -8],
              y: [0, -2, 0, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/Logos/surfer.svg"
              alt="Surfer"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </motion.div>
          <span className="mx-2 font-bold">Vos photos de surf à la Torche</span>
          <motion.div
            animate={{ 
              x: [8, 4, 0, 4, 8],
              y: [0, -2, 0, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Image
              src="/Logos/surfer.svg"
              alt="Surfer"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}