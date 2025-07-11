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

  // Simplified animations for better performance
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])
  const taglineOpacity = useTransform(scrollY, [0, 60], [1, 0])
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
        style={{ opacity: headerOpacity }}
      >
        <div className="flex items-center justify-around">
          {/* Photos */}
          <motion.button
            onClick={() => handleNavigation("/gallery")}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image
                src="/Logos/camera2.svg"
                alt="Camera"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Photos
            </span>
          </motion.button>

          {/* Nos produits */}
          <motion.button
            onClick={() => handleNavigation("/boutique")}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image
                src="/Logos/Nos-produits.svg"
                alt="Nos produits"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Nos produits
            </span>
          </motion.button>

          {/* Contact */}
          <motion.button
            onClick={() => handleNavigation("/contact")}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Image
                src="/Logos/Call-gesture.svg"
                alt="Contact"
                width={24}
                height={24}
                className="w-full h-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Contact
            </span>
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
        <div className="flex items-center justify-center gap-4 text-xs text-black py-1 relative">
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
            style={{ willChange: 'transform' }}
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
            style={{ willChange: 'transform' }}
          >
            <Image
              src="/Logos/surfer.svg"
              alt="Surfer"
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}