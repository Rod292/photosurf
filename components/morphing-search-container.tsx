"use client"

import { useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"
import { UnifiedSearch } from "./unified-search"

export function MorphingSearchContainer() {
  const [isSticky, setIsSticky] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateSticky = () => {
      setIsSticky(window.scrollY > 250)
    }

    window.addEventListener('scroll', updateSticky)
    updateSticky()
    return () => window.removeEventListener('scroll', updateSticky)
  }, [])

  return (
    <>
      {/* Main search bar in hero section */}
      <motion.div
        className={isSticky ? "invisible" : "visible"}
        animate={{ 
          opacity: isSticky ? 0 : 1,
          scale: isSticky ? 0.8 : 1 
        }}
        transition={{ duration: 0.3 }}
      >
        <UnifiedSearch mode="full" />
      </motion.div>

      {/* Sticky search bar that morphs into header */}
      <motion.div
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 ${
          isSticky ? "pointer-events-auto" : "pointer-events-none"
        }`}
        animate={{
          opacity: isSticky ? 1 : 0,
          y: isSticky ? 0 : -20
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        <UnifiedSearch mode="compact" />
      </motion.div>
    </>
  )
}