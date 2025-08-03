'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Language = 'fr' | 'en' | 'de'

interface LanguageSwitcherProps {
  onLanguageChange: (lang: Language) => void
  currentLanguage: Language
  className?: string
}

export function LanguageSwitcher({ onLanguageChange, currentLanguage, className }: LanguageSwitcherProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const languages: { code: Language; flag: string; alt: string }[] = [
    { code: 'fr', flag: '🇫🇷', alt: 'Français' },
    { code: 'en', flag: '🇬🇧', alt: 'English' },
    { code: 'de', flag: '🇩🇪', alt: 'Deutsch' },
  ]

  return (
    <div className={cn("flex gap-2", className)}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant="ghost"
          size="sm"
          onClick={() => onLanguageChange(lang.code)}
          className={cn(
            "px-2 py-1 hover:bg-white/80 transition-all",
            currentLanguage === lang.code 
              ? "bg-white shadow-sm scale-110" 
              : "bg-transparent"
          )}
          aria-label={lang.alt}
        >
          <span className={cn(
            "transition-all",
            currentLanguage === lang.code ? "text-2xl" : "text-xl"
          )}>{lang.flag}</span>
        </Button>
      ))}
    </div>
  )
}