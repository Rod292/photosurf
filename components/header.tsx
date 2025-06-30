"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Instagram, Settings, Search, Menu, Globe, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCartStore } from "@/context/cart-context"
import { CartSlideOver } from "@/components/cart-slide-over"
import { SearchBar } from "@/components/search-bar"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

interface HeaderProps {
  alwaysVisible?: boolean
}

export function Header({ alwaysVisible = false }: HeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const { scrollY } = useScroll()
  const headerHeight = useTransform(scrollY, [0, 100], [80, 64])
  const headerPadding = useTransform(scrollY, [0, 100], [24, 16])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.1])
  
  // Transformations pour la navigation et la barre de recherche
  const navOpacity = useTransform(scrollY, [80, 140], [1, 0])
  const navScale = useTransform(scrollY, [80, 140], [1, 0.8])
  const navY = useTransform(scrollY, [80, 140], [0, -20])
  const navPointerEvents = useTransform(scrollY, [140, 141], ["auto", "none"])
  
  const searchOpacity = useTransform(scrollY, [150, 200], [0, 1])
  const searchScale = useTransform(scrollY, [150, 250], [0.8, 0.85])
  const searchY = useTransform(scrollY, [150, 200], [20, 0])
  const searchHeight = useTransform(scrollY, [200, 300], [40, 32])
  const searchPointerEvents = useTransform(scrollY, [150, 151], ["none", "auto"])

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (response.ok) {
          const { authenticated } = await response.json()
          setIsAuthenticated(authenticated)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
    const interval = setInterval(checkAuth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Gérer le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setIsAuthenticated(false)
        router.push('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0
    }
  }

  const navItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1
    },
    hover: {
      scale: 1.05
    }
  }

  return (
    <motion.header 
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }}
      style={{
        height: headerHeight,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, ${shadowOpacity})`
      }}
      layout
    >
      <motion.div 
        className="container mx-auto px-6 h-full flex items-center justify-between relative"
        style={{ paddingTop: headerPadding, paddingBottom: headerPadding }}
        layout
      >
        
        {/* Logo et nom à gauche */}
        <motion.button 
          onClick={() => handleNavigation("/")} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ scale: logoScale }}
          layout
        >
          <motion.div
            animate={{ 
              width: isScrolled ? 28 : 32,
              height: isScrolled ? 28 : 32
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
              alt="Arode Logo"
              width={32}
              height={32}
              className="w-full h-full brightness-0"
            />
          </motion.div>
          <motion.span 
            className="font-bold text-gray-900 font-playfair"
            animate={{ 
              fontSize: isScrolled ? "1.25rem" : "1.5rem"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Arode Studio
          </motion.span>
        </motion.button>

        {/* Navigation centrale - avec Boutique parfaitement centré */}
        <motion.nav 
          className="hidden lg:flex items-center justify-center absolute left-0 right-0 mx-auto h-full"
          variants={containerVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            opacity: navOpacity,
            scale: navScale,
            y: navY,
            gap: isScrolled ? "1.5rem" : "2rem",
            pointerEvents: navPointerEvents
          }}
        >
            <motion.button 
              onClick={() => handleNavigation("/gallery")}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black"
              variants={navItemVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              animate={{ 
                padding: isScrolled ? "0.375rem 0.75rem" : "0.5rem 1rem"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.2 }}
              animate={{ fontSize: isScrolled ? "1.5rem" : "1.75rem" }}
            >
              📸
            </motion.span>
            <motion.span
              animate={{ fontSize: isScrolled ? "0.875rem" : "1rem" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              Photos
            </motion.span>
            </motion.button>
            
            <motion.button 
            onClick={() => handleNavigation("/boutique")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black"
            variants={navItemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            animate={{ 
              padding: isScrolled ? "0.375rem 0.75rem" : "0.5rem 1rem"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: -10 }}
              transition={{ duration: 0.2 }}
              animate={{ fontSize: isScrolled ? "1.5rem" : "1.75rem" }}
            >
              🛍️
            </motion.span>
            <motion.span
              animate={{ fontSize: isScrolled ? "0.875rem" : "1rem" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              Boutique
            </motion.span>
            </motion.button>
            
            <motion.button 
            onClick={() => handleNavigation("/contact")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black"
            variants={navItemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            animate={{ 
              padding: isScrolled ? "0.375rem 0.75rem" : "0.5rem 1rem"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
              >
            <motion.span
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.2 }}
              animate={{ fontSize: isScrolled ? "1.5rem" : "1.75rem" }}
            >
              📞
            </motion.span>
            <motion.span
              animate={{ fontSize: isScrolled ? "0.875rem" : "1rem" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              Contact
            </motion.span>
            </motion.button>
        </motion.nav>


        {/* Search bar compacte dans le header lors du scroll */}
        <motion.div 
          className="hidden lg:flex absolute left-0 right-0 mx-auto justify-center items-center h-full"
          style={{
            opacity: searchOpacity,
            scale: searchScale,
            y: searchY,
            height: searchHeight,
            pointerEvents: searchPointerEvents
          }}
        >
          <SearchBar compact={true} searchHeight={searchHeight} />
        </motion.div>

        {/* Actions à droite */}
        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
        >
          {/* Instagram */}
          <motion.a 
            href="https://www.instagram.com/arode.studio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Instagram className="h-5 w-5 text-gray-600" />
          </motion.a>

          {/* Panier */}
          <CartSlideOver headerStyle="light" />

          {/* Menu utilisateur */}
          <motion.div 
            className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-2 hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            <button className="p-1">
              <Menu className="h-4 w-4 text-gray-600" />
            </button>
            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => handleNavigation("/admin/upload")}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Admin"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    title="Déconnexion"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => handleNavigation("/login")}
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  title="Se connecter"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <User className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
        {/* Menu mobile */}
        <motion.div className="lg:hidden">
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Menu mobile expansible */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 py-4 space-y-2">
              {[
                { name: "Photos", icon: "📸", path: "/gallery" },
                { name: "Boutique", icon: "🛍️", path: "/boutique" },
                { name: "Contact", icon: "📞", path: "/contact" }
              ].map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item.path)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </motion.button>
              ))}
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

