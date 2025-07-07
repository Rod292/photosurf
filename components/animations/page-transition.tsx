"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  className?: string
  key?: string
}

export function PageTransition({ children, className = "", key }: PageTransitionProps) {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  }

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.4
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className={className}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface SlideTransitionProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "down"
  className?: string
}

export function SlideTransition({ 
  children, 
  direction = "right", 
  className = "" 
}: SlideTransitionProps) {
  const directionVariants = {
    left: { x: "-100%" },
    right: { x: "100%" },
    up: { y: "-100%" },
    down: { y: "100%" }
  }

  const slideVariants = {
    initial: directionVariants[direction],
    in: { x: 0, y: 0 },
    out: {
      x: direction === "left" ? "100%" : direction === "right" ? "-100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0
    }
  }

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      transition={{
        type: "tween" as const,
        ease: "easeInOut" as const,
        duration: 0.3
      }}
    >
      {children}
    </motion.div>
  )
}

interface ScaleTransitionProps {
  children: ReactNode
  className?: string
  isVisible?: boolean
}

export function ScaleTransition({ 
  children, 
  className = "",
  isVisible = true 
}: ScaleTransitionProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ 
            opacity: 0, 
            scale: 0.8,
            transformOrigin: "center"
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface SpringTransitionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function SpringTransition({ 
  children, 
  className = "", 
  delay = 0 
}: SpringTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: 50,
        scale: 0.9
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      transition={{
        type: "spring" as const,
        damping: 20,
        stiffness: 300,
        delay
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = "" }: { children: ReactNode, className?: string }) {
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  )
}