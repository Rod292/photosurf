'use client'

import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import type { FavoritePhoto } from '@/contexts/FavoritesContext'

interface HeartButtonProps {
  photo: FavoritePhoto
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function HeartButton({ photo, className, size = 'md', showTooltip = true }: HeartButtonProps) {
  const { isInFavorites, addToFavorites, removeFromFavorites } = useFavorites()
  const isFavorite = isInFavorites(photo.id)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isFavorite) {
      removeFromFavorites(photo.id)
    } else {
      addToFavorites(photo)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-white/90 backdrop-blur-sm",
        "shadow-md hover:shadow-lg",
        "transition-all duration-200",
        "group",
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait">
        {isFavorite ? (
          <motion.div
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Heart 
              size={iconSizes[size]} 
              className="text-red-500 fill-red-500"
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Heart 
              size={iconSizes[size]} 
              className="text-gray-600 group-hover:text-red-500 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation when added to favorites */}
      <AnimatePresence>
        {isFavorite && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

    </motion.button>
  )
}