"use client"

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Ne pas afficher le footer sur les pages demo
  if (pathname.startsWith('/demo')) {
    return null
  }
  
  return <Footer />
}