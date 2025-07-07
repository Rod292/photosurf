"use client"

import { useState, useEffect } from "react"

interface AnimationConfig {
  shouldAnimate: boolean
  reducedMotion: boolean
  isMobile: boolean
  isLowPower: boolean
}

export function useOptimizedAnimations(): AnimationConfig {
  const [config, setConfig] = useState<AnimationConfig>({
    shouldAnimate: true,
    reducedMotion: false,
    isMobile: false,
    isLowPower: false
  })

  useEffect(() => {
    const updateConfig = () => {
      // Détection mobile
      const isMobile = window.innerWidth < 768 || 
                      ('ontouchstart' in window && window.innerWidth < 1024)
      
      // Préférence utilisateur pour mouvement réduit
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      
      // Détection des performances (batterie faible, connexion lente, etc.)
      let isLowPower = false
      
      try {
        // @ts-ignore - Experimental API
        if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) {
          isLowPower = true
        }
        
        // @ts-ignore - Experimental API  
        if ((navigator as any).connection && (navigator as any).connection.effectiveType && 
           ['slow-2g', '2g', '3g'].includes((navigator as any).connection.effectiveType)) {
          isLowPower = true
        }
      } catch (e) {
        // Les APIs peuvent ne pas être supportées
      }

      // Décision d'animation
      const shouldAnimate = !reducedMotion && (!isMobile || !isLowPower)

      setConfig({
        shouldAnimate,
        reducedMotion,
        isMobile,
        isLowPower
      })
    }

    updateConfig()

    // Écouter les changements
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', updateConfig)
    
    window.addEventListener('resize', updateConfig)

    return () => {
      mediaQuery.removeEventListener('change', updateConfig)
      window.removeEventListener('resize', updateConfig)
    }
  }, [])

  return config
}

// Configurations d'animation optimisées pour mobile
export const getMobileAnimationConfig = (isMobile: boolean, shouldAnimate: boolean) => {
  if (!shouldAnimate) {
    return {
      duration: 0,
      staggerDelay: 0,
      enabled: false
    }
  }

  if (isMobile) {
    return {
      duration: 0.2, // Plus rapide sur mobile
      staggerDelay: 0.03, // Stagger réduit
      enabled: true,
      // Désactiver certaines animations coûteuses
      disableScale: true,
      disableShadow: true,
      disableBlur: true
    }
  }

  return {
    duration: 0.3,
    staggerDelay: 0.05,
    enabled: true,
    disableScale: false,
    disableShadow: false,
    disableBlur: false
  }
}