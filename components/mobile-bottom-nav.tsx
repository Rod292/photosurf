"use client"

import { ShoppingCart, Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

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
        <div className="flex items-center justify-between">
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
          <Link 
            href="/cart"
            className={cn(
              "relative p-3 rounded-full transition-all",
              "bg-gray-100 hover:bg-gray-200 active:scale-95",
              itemCount > 0 && "bg-blue-500 hover:bg-blue-600"
            )}
          >
            <ShoppingCart 
              className={cn(
                "h-6 w-6",
                itemCount > 0 ? "text-white" : "text-gray-700"
              )} 
            />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/arode.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          >
            <Instagram className="h-6 w-6 text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  )
}