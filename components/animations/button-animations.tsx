"use client"

import { motion, MotionProps } from "framer-motion"
import { ReactNode, forwardRef } from "react"

interface AnimatedButtonProps extends MotionProps {
  children: ReactNode
  className?: string
  variant?: "default" | "subtle" | "spring" | "scale" | "bounce"
  disabled?: boolean
  onClick?: () => void
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className = "", variant = "default", disabled = false, onClick, ...props }, ref) => {
    const variants = {
      default: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { duration: 0.2 }
      },
      subtle: {
        whileHover: { scale: 1.02, y: -1 },
        whileTap: { scale: 0.98, y: 0 },
        transition: { duration: 0.15 }
      },
      spring: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: "spring" as const, stiffness: 300, damping: 20 }
      },
      scale: {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.9 },
        transition: { duration: 0.2 }
      },
      bounce: {
        whileHover: { scale: 1.05, y: -2 },
        whileTap: { scale: 0.95, y: 0 },
        transition: { type: "spring" as const, stiffness: 400, damping: 10 }
      }
    }

    const currentVariant = variants[variant]

    return (
      <motion.button
        ref={ref}
        className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={disabled ? {} : currentVariant.whileHover}
        whileTap={disabled ? {} : currentVariant.whileTap}
        transition={currentVariant.transition}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

interface FloatingActionButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function FloatingActionButton({ children, className = "", onClick }: FloatingActionButtonProps) {
  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg z-50 flex items-center justify-center ${className}`}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.5
        }
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

interface PulsatingButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  pulseColor?: string
}

export function PulsatingButton({ 
  children, 
  className = "", 
  onClick,
  pulseColor = "rgb(59, 130, 246)"
}: PulsatingButtonProps) {
  return (
    <motion.button
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: pulseColor }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {children}
    </motion.button>
  )
}

interface LoadingButtonProps {
  children: ReactNode
  className?: string
  isLoading?: boolean
  onClick?: () => void
  loadingText?: string
}

export function LoadingButton({ 
  children, 
  className = "", 
  isLoading = false, 
  onClick,
  loadingText = "Chargement..."
}: LoadingButtonProps) {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      whileHover={!isLoading ? { scale: 1.05 } : {}}
      whileTap={!isLoading ? { scale: 0.95 } : {}}
      disabled={isLoading}
      onClick={onClick}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{
          opacity: isLoading ? 0 : 1,
          y: isLoading ? -20 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: isLoading ? 1 : 0,
          y: isLoading ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {loadingText}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}

interface SuccessButtonProps {
  children: ReactNode
  className?: string
  showSuccess?: boolean
  onClick?: () => void
  successIcon?: ReactNode
}

export function SuccessButton({ 
  children, 
  className = "", 
  showSuccess = false, 
  onClick,
  successIcon
}: SuccessButtonProps) {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      whileHover={!showSuccess ? { scale: 1.05 } : {}}
      whileTap={!showSuccess ? { scale: 0.95 } : {}}
      onClick={onClick}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{
          opacity: showSuccess ? 0 : 1,
          scale: showSuccess ? 0.8 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          opacity: showSuccess ? 1 : 0,
          scale: showSuccess ? 1 : 0.8
        }}
        transition={{ duration: 0.3, delay: showSuccess ? 0.1 : 0 }}
      >
        {successIcon || (
          <motion.svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: showSuccess ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </motion.svg>
        )}
      </motion.div>
    </motion.button>
  )
}