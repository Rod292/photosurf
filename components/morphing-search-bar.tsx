"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { UnifiedSearch } from "./unified-search"

interface MorphingSearchBarProps {
  className?: string
}

export function MorphingSearchBar({ className = "" }: MorphingSearchBarProps) {
  const [isCompact, setIsCompact] = useState(false)
  const { scrollY } = useScroll()
  
  // Trigger compact mode when user scrolls past hero section
  useEffect(() => {
    const updateMode = () => {
      const shouldBeCompact = window.scrollY > 200
      setIsCompact(shouldBeCompact)
    }

    window.addEventListener('scroll', updateMode)
    return () => window.removeEventListener('scroll', updateMode)
  }, [])

  return (
    <motion.div
      layoutId="search-bar"
      className={`${className} ${isCompact ? 'fixed top-4 left-1/2 z-50' : 'relative'}`}
      style={{
        x: isCompact ? '-50%' : '0%'
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6
      }}
    >
      <UnifiedSearch
        mode={isCompact ? "compact" : "full"}
        className={isCompact ? 'transform-none' : ''}
      />
    </motion.div>
  )
}