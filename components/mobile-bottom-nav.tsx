"use client"

import { Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function MobileBottomNav() {
  const { items } = useCartStore()
  const pathname = usePathname()
  const itemCount = items.length

  // Don't show on admin pages or cart page
  if (pathname.startsWith('/admin') || pathname === '/cart') {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="bg-white border-t border-gray-200 px-4 py-2 pb-safe">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
              alt="Arode Studio"
              width={80}
              height={32}
              className="h-8 w-auto brightness-0"
            />
          </Link>

          {/* Cart */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link 
              href="/cart"
              className={cn(
                "relative p-3 rounded-full transition-all block min-w-[44px] min-h-[44px] flex items-center justify-center",
                "hover:bg-gray-100"
              )}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Shopping Cart"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </motion.div>
              {itemCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/arode.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full hover:bg-gray-100 transition-colors active:scale-95 flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <Instagram className="h-6 w-6 text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  )
}