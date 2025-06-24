"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

export function LandingSection() {
  return (
    <section className="relative h-[calc(100vh-5rem)] min-h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodesurf-32.jpg-Tvlf2Ll5xApOCKGGqyWl6yi28WcNTT.jpeg"
          alt="Surf background"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
          className="landing-background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent md:from-black/70 md:via-black/40 md:to-transparent" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-bold font-playfair tracking-tight text-white drop-shadow-lg transform transition-all duration-300"
          >
            Arode. Studio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl font-varela-round tracking-wide text-white/90 drop-shadow-md max-w-xl mx-auto px-4"
          >
            Immortalise vos meilleures sessions en Bretagne
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="pt-6 md:pt-8"
          >
            <Link
              href="https://www.instagram.com/arode.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white hover:bg-white/20 hover:text-white 
                         transition-all duration-300 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg 
                         rounded-full group relative overflow-hidden"
              >
                <Instagram className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:scale-110" />
                <span className="text-lg md:text-xl font-lexend-deca">Contactez nous</span>
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

