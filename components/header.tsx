"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Instagram, Menu, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { CartSheet } from "@/components/cart/CartSheet"
import { SearchBar } from "@/components/search-bar"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useFavorites } from "@/contexts/FavoritesContext"

interface HeaderProps {
  alwaysVisible?: boolean
}

export function Header({ alwaysVisible = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  
  // Handle favorites context safely
  let favoritesCount = 0
  try {
    const favoritesContext = useFavorites()
    favoritesCount = favoritesContext.favoritesCount
  } catch (error) {
    // FavoritesProvider not available, use default value
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
    
    // Listen for auth changes
    const supabase = createSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })
    
    return () => subscription.unsubscribe()
  }, [])

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

  // Gérer le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const navItemVariants = {
    hover: {
      scale: 1.05
    }
  }

  // Hide header completely on mobile
  if (isMobile) {
    return null
  }

  return (
    <motion.header 
      className="sticky top-0 z-40 bg-white"
      style={{
        height: headerHeight,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, ${shadowOpacity})`
      }}
    >
      <motion.div 
        className="container mx-auto px-6 h-full flex items-center justify-between relative"
        style={{ paddingTop: headerPadding, paddingBottom: headerPadding }}
      >
        
        {/* Logo et nom à gauche */}
        <motion.button 
          onClick={() => handleNavigation("/")} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ scale: logoScale }}
        >
          <motion.div className="w-8 h-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
              alt="Arode Logo"
              width={32}
              height={32}
              className="w-full h-full brightness-0"
            />
          </motion.div>
          <motion.span className="font-bold text-gray-900 font-playfair text-2xl">
            Arode Studio
          </motion.span>
        </motion.button>

        {/* Navigation centrale - avec Boutique parfaitement centré */}
        <motion.nav 
          className="hidden lg:flex items-center justify-center absolute left-0 right-0 mx-auto h-full pointer-events-none"
          style={{
            opacity: navOpacity,
            scale: navScale,
            y: navY,
            gap: "2rem",
            pointerEvents: navPointerEvents
          }}
        >
            <motion.button 
              onClick={() => handleNavigation("/gallery")}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black pointer-events-auto"
              variants={navItemVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-7 h-7"
            >
              <Image
                src="/Logos/camera2.svg"
                alt="Camera"
                width={28}
                height={28}
                className="w-full h-full"
              />
            </motion.div>
            <motion.span className="text-base">
              Photos
            </motion.span>
            </motion.button>
            
            <motion.button 
            onClick={() => handleNavigation("/boutique")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black pointer-events-auto"
            variants={navItemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              whileHover={{ rotate: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-7 h-7"
            >
              <Image
                src="/Logos/Nos-produits.svg"
                alt="Nos produits"
                width={28}
                height={28}
                className="w-full h-full"
              />
            </motion.div>
            <motion.span className="text-base">
              Nos produits
            </motion.span>
            </motion.button>
            
            {/* Lien Mode Démonstration - seulement pour les utilisateurs authentifiés */}
            {isAuthenticated && (
              <motion.button 
                onClick={() => handleNavigation("/demo")}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors font-medium text-purple-700 hover:text-purple-900 pointer-events-auto border border-purple-200"
                variants={navItemVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                style={{ 
                  padding: isScrolled ? "0.375rem 0.75rem" : "0.5rem 1rem"
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                  style={{ 
                    width: isScrolled ? "1.5rem" : "1.75rem",
                    height: isScrolled ? "1.5rem" : "1.75rem"
                  }}
                >
                  <Eye className="w-full h-full" />
                </motion.div>
                <motion.span
                  style={{ fontSize: isScrolled ? "0.875rem" : "1rem" }}
                >
                  Démo
                </motion.span>
              </motion.button>
            )}
            
            <motion.button 
            onClick={() => handleNavigation("/contact")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black pointer-events-auto"
            variants={navItemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
              >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-7 h-7"
            >
              <Image
                src="/Logos/Call-gesture.svg"
                alt="Contact"
                width={28}
                height={28}
                className="w-full h-full"
              />
            </motion.div>
            <motion.span className="text-base">
              Contact
            </motion.span>
            </motion.button>
            
            <motion.button 
            onClick={() => handleNavigation("/favoris")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors font-medium text-gray-700 hover:text-black pointer-events-auto relative"
            variants={navItemVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
              >
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center relative"
              style={{ 
                width: isScrolled ? "1.5rem" : "1.75rem",
                height: isScrolled ? "1.5rem" : "1.75rem"
              }}
            >
              <Image
                src="/Logos/Heart copie.svg"
                alt="Favoris"
                width={28}
                height={28}
                className="w-full h-full"
              />
              {favoritesCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold"
                  style={{ fontSize: '0.7rem' }}
                >
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </motion.div>
              )}
            </motion.div>
            <motion.span className="text-base">
              Favoris
            </motion.span>
            </motion.button>
        </motion.nav>


        {/* Search bar compacte dans le header lors du scroll */}
        <motion.div 
          className="hidden lg:flex absolute left-0 right-0 mx-auto justify-center items-center h-full pointer-events-none"
          style={{
            opacity: searchOpacity,
            scale: searchScale,
            y: searchY,
            height: searchHeight,
            pointerEvents: searchPointerEvents
          }}
        >
          <SearchBar compact={true} searchHeight={searchHeight} className="pointer-events-auto" />
        </motion.div>

        {/* Actions à droite */}
        <motion.div 
          className="flex items-center gap-2"
        >
          {/* Instagram - hidden on mobile since it's in bottom nav */}
          <motion.a 
            href="https://www.instagram.com/arode.studio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:block p-3 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Instagram className="h-5 w-5 text-gray-600" />
          </motion.a>

          {/* Panier */}
          <div>
            <CartSheet />
          </div>

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
                { name: "Photos", icon: "/Logos/camera2.svg", path: "/gallery", isImage: true },
                { name: "Nos produits", icon: "/Logos/Nos-produits.svg", path: "/boutique", isImage: true },
                { name: "Contact", icon: "/Logos/Call-gesture.svg", path: "/contact", isImage: true },
                { name: "Favoris", icon: "/Logos/Heart copie.svg", path: "/favoris", isImage: true }
              ].map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item.path)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.isImage ? (
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  ) : (
                    <span>{item.icon}</span>
                  )}
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

