"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"

interface DemoHeaderProps {
  alwaysVisible?: boolean
}

export function DemoHeader({ alwaysVisible = false }: DemoHeaderProps) {
  const router = useRouter()
  
  const { scrollY } = useScroll()
  const headerHeight = useTransform(scrollY, [0, 100], [80, 64])
  const headerPadding = useTransform(scrollY, [0, 100], [24, 16])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.1])

  const handleNavigation = (path: string) => {
    router.push(path)
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
        className="container mx-auto px-6 h-full flex items-center justify-center"
        style={{ paddingTop: headerPadding, paddingBottom: headerPadding }}
      >
        
        {/* Logo et nom centrés */}
        <motion.div 
          className="flex items-center gap-2"
          style={{ scale: logoScale }}
        >
          <motion.div
            style={{ 
              width: 32,
              height: 32
            }}
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
            className="font-bold text-gray-900 font-playfair text-2xl"
          >
            Arode Studio
          </motion.span>
        </motion.div>

      </motion.div>
    </motion.header>
  )
}