import { FilterProvider } from "@/context/filter-context"
import { CartProvider } from "@/contexts/CartContext"
import {
  Playfair_Display,
  Montserrat,
  DM_Sans,
  Lexend_Deca,
  DM_Sans as DM_Sans_Handgloves,
  Varela_Round,
} from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ConditionalFooter } from "@/components/conditional-footer"
import { CursorPreload } from "@/components/cursor-preload"
import { Toaster } from "@/components/ui/toaster"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import Script from "next/script"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
})

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
  display: "swap",
  preload: true,
})

const dmSansHandgloves = DM_Sans_Handgloves({
  subsets: ["latin"],
  variable: "--font-dm-sans-handgloves",
  display: "swap",
  preload: true,
})

const varelaRound = Varela_Round({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-varela-round",
  display: "swap",
  preload: true,
})

export const metadata = {
  title: "Arode Studio",
  description: "Surf photography in Brittany",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  metadataBase: new URL("https://www.arodestudio.com"),
  alternates: {
    canonical: "/",
  },
  generator: 'v0.dev'
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${dmSans.variable} ${lexendDeca.variable} ${dmSansHandgloves.variable} ${varelaRound.variable}`}
    >
      <body className="bg-gray-50 font-sans flex flex-col min-h-screen">
        <CursorPreload />
        <CartProvider>
          <FilterProvider>
            <MobileHeader />
            <div className="flex-grow pb-16 md:pb-0">{children}</div>
            <MobileBottomNav />
            <ConditionalFooter />
          </FilterProvider>
        </CartProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
        {/* Stripe sera chargé de manière différée pour ne pas bloquer le rendu initial */}
        <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
      </body>
    </html>
  )
}

