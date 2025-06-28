"use client"

import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { ReactNode } from "react"

interface ContentFlowAnimationProps {
  children: ReactNode
  className?: string
  layoutId?: string
  isVisible?: boolean
  direction?: "vertical" | "horizontal"
  staggerChildren?: number
}

export function ContentFlowAnimation({ 
  children, 
  className = "", 
  layoutId,
  isVisible = true,
  direction = "vertical",
  staggerChildren = 0.1
}: ContentFlowAnimationProps) {
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: staggerChildren,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        when: "afterChildren"
      }
    }
  }

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={layoutId || "content"}
            layoutId={layoutId}
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}

interface FlowItemProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FlowItem({ children, className = "", delay = 0 }: FlowItemProps) {
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
        duration: 0.5,
        delay: delay
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      layout
    >
      {children}
    </motion.div>
  )
}

interface CollapsibleContentProps {
  children: ReactNode
  isOpen: boolean
  className?: string
}

export function CollapsibleContent({ children, isOpen, className = "" }: CollapsibleContentProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ 
            height: 0, 
            opacity: 0,
            scale: 0.95 
          }}
          animate={{ 
            height: "auto", 
            opacity: 1,
            scale: 1
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            scale: 0.95
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut"
          }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 