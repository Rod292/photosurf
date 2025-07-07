"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { useOptimizedAnimations, getMobileAnimationConfig } from "@/hooks/use-optimized-animations"

interface PhotoGridProps {
  children: ReactNode
  className?: string
  columns?: number
}

export function PhotoGrid({ children, className = "", columns = 6 }: PhotoGridProps) {
  const { shouldAnimate, isMobile } = useOptimizedAnimations()
  const animConfig = getMobileAnimationConfig(isMobile, shouldAnimate)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animConfig.staggerDelay,
        delayChildren: animConfig.enabled ? 0.1 : 0
      }
    }
  }

  return (
    <motion.div
      className={`grid gap-3 md:gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
      }}
      variants={animConfig.enabled ? containerVariants : undefined}
      initial={animConfig.enabled ? "hidden" : undefined}
      animate={animConfig.enabled ? "visible" : undefined}
    >
      {children}
    </motion.div>
  )
}

interface PhotoCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  index?: number
}

export function PhotoCard({ children, className = "", onClick, index = 0 }: PhotoCardProps) {
  const { shouldAnimate, isMobile } = useOptimizedAnimations()
  const animConfig = getMobileAnimationConfig(isMobile, shouldAnimate)

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 10 : 20,
      scale: isMobile ? 0.98 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animConfig.duration
      }
    }
  }

  // Optimisations mobiles : réduire ou désactiver certains effets
  const hoverVariants = animConfig.enabled && !animConfig.disableScale ? {
    scale: isMobile ? 1.02 : 1.05,
    y: isMobile ? -4 : -8,
    transition: {
      duration: animConfig.duration * 0.7
    }
  } : {}

  const tapVariants = animConfig.enabled ? {
    scale: isMobile ? 0.99 : 0.98,
    transition: {
      duration: 0.05
    }
  } : {}

  return (
    <motion.div
      className={`cursor-pointer group relative w-full pt-[150%] rounded-lg overflow-hidden shadow-md ${className}`}
      variants={animConfig.enabled ? itemVariants : undefined}
      whileHover={animConfig.enabled ? hoverVariants : undefined}
      whileTap={animConfig.enabled ? tapVariants : undefined}
      onClick={onClick}
      layout={!isMobile} // Désactiver layout animations sur mobile
      layoutId={!isMobile ? `photo-${index}` : undefined}
    >
      {children}
      
      {/* Hover overlay avec animation - Optimisé pour mobile */}
      {animConfig.enabled && (
        <motion.div
          className="absolute inset-0 bg-black/30 opacity-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          whileHover={!isMobile ? { 
            opacity: 1,
            transition: { duration: animConfig.duration }
          } : undefined}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={!isMobile ? { 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.05, duration: animConfig.duration }
            } : undefined}
            className="text-white text-center"
          >
            <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 12, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full pt-[150%] bg-gray-200 rounded-lg relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface FadeInViewProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeInView({ children, className = "", delay = 0 }: FadeInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
          delay,
          ease: "easeOut"
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  )
}