"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Instagram, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCartStore } from "@/context/cart-context"
import { CartSlideOver } from "@/components/cart-slide-over"

interface HeaderProps {
  alwaysVisible?: boolean
}

export function Header({ alwaysVisible = false }: HeaderProps) {
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [debugMode, setDebugMode] = useState(false) // Debug désactivé
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 50)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (response.ok) {
          const { authenticated } = await response.json()
          setIsAuthenticated(authenticated)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
    
    // Vérifier périodiquement l'authentification
    const interval = setInterval(checkAuth, 30000) // Toutes les 30 secondes
    
    return () => clearInterval(interval)
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleAdminClick = () => {
    handleNavigation("/admin/upload")
  }

  const isDarkMode = !alwaysVisible && isAtTop

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        alwaysVisible || !isAtTop ? "bg-white/90 backdrop-blur-sm shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between relative">
        <button onClick={() => handleNavigation("/")} className="flex items-center">
          <span
            className={`text-xl sm:text-2xl font-bold font-playfair ${
              alwaysVisible || !isAtTop ? "text-black" : "text-white"
            }`}
          >
            Arode. Studio
          </span>
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button onClick={() => handleNavigation("/")}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
              alt="Arode Logo"
              width={48}
              height={48}
              className={`w-14 h-14 sm:w-16 sm:h-16 ${alwaysVisible || !isAtTop ? "brightness-0" : "brightness-100"}`}
            />
          </button>
        </div>

        <nav className="flex items-center space-x-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminClick}
              className={`flex items-center gap-2 ${
                alwaysVisible || !isAtTop ? "text-black hover:text-black/80" : "text-white hover:text-white/80"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          <a href="https://www.instagram.com/arode.studio/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              className={
                alwaysVisible || !isAtTop ? "text-black hover:text-black/80" : "text-white hover:text-white/80"
              }
            >
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Button>
          </a>
          <CartSlideOver headerStyle={isDarkMode ? 'dark' : 'light'} />
        </nav>
      </div>
    </header>
  )
}

