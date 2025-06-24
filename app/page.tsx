"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LandingSection } from "@/components/landing-section"
import { FilterProvider } from "@/context/filter-context"
import Link from "next/link"
import dynamic from "next/dynamic"
const Image = dynamic(() => import("next/image"), { ssr: true })
import { Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import StructuredData from "@/components/structured-data"
import { useEffect } from "react"
import { loadNonCriticalResources } from "@/utils/performance"

// Importer les composants d'animation
import { motion } from "framer-motion"
import { ScrollAnimation } from "@/components/animations/scroll-animation"

const sessions = [
  {
    name: "Cooking Summer 2025 🧑‍🍳",
    link: "/cooking",
    imageUrl: "/image.png",
  },
  // { name: "Session Pays Basque", link: "#" },
  // { name: "Session Landes", link: "#" },
  // { name: "Portfolio", link: "#" },
];

export default function Home() {
  useEffect(() => {
    loadNonCriticalResources()
  }, [])
  return (
    <>
      <FilterProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <LandingSection />
          <main className="relative z-10 bg-white">
            <div className="bg-gray-200">
              <div className="w-full py-2 bg-white border-y border-gray-200">
                <p className="text-center text-sm text-gray-600 font-montserrat font-medium tracking-wide">
                  Tirages photo disponibles
                </p>
              </div>
              <div className="container mx-auto px-4 py-8">
                {" "}
                {/* Update: Reduced padding bottom */}
                <div className="mb-12">
                  <h2 className="text-4xl font-bold mb-12 text-center font-dm-sans-handgloves relative">
                    <span className="relative inline-block">
                      Dernières Sessions
                      <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></span>
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sessions.map((session) => (
                      <SessionCard key={session.name} name={session.name} link={session.link} imageUrl={session.imageUrl} />
                    ))}
                  </div>

                  {/* Image Showcase */}
                  <ScrollAnimation animation="stagger" className="mt-16 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-xl"
                      >
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cadre.jpg-rsUlwefP6JP0REBu5BHmpR27LyVLBG.jpeg"
                          alt="Surf photography by Arode Studio"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-xl"
                      >
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode4.jpg-70CUfejJb0gE5JwCk3oOs8xLol5AhS.jpeg"
                          alt="Surf photography by Arode Studio"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-xl"
                      >
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode3.jpg-Ewu1fTeEgnPkO1luTPm21XTxmmhIPK.jpeg"
                          alt="Surf photography by Arode Studio"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="relative aspect-[3/2] rounded-2xl overflow-hidden shadow-xl"
                      >
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode.jpg-4zAe9Jv5Ilkq5g7JzIH8mHoeusllQ5.jpeg"
                          alt="Surf photography by Arode Studio"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </motion.div>
                    </div>
                  </ScrollAnimation>
                </div>
                {/* Print Quality Showcase Section */}
                <ScrollAnimation animation="fadeUp" className="max-w-6xl mx-auto mb-6 bg-white rounded-lg shadow-lg">
                  <div className="grid md:grid-cols-2 gap-8 items-center p-8">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="relative aspect-[4/3] w-full h-full"
                    >
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Beige%20Minimalist%20Picture%20Frame%20Mockup%20Instagram%20Post-1ioAq2Nvl9jngZhCj9bXtUgordejoH.png"
                        alt="Impression photo haute qualité encadrée"
                        fill
                        className="object-contain rounded-3xl"
                        priority
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="space-y-4 font-lexend-deca"
                    >
                      <div className="flex flex-col items-center mb-6">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
                          alt="Arode Logo"
                          width={100}
                          height={100}
                          className="brightness-0 mb-3"
                        />
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="text-3xl md:text-4xl font-bold font-dm-sans"
                        >
                          TIRAGES PHOTO
                        </motion.h2>
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-600"
                      >
                        Nous pouvons imprimer vos photos avec notre imprimante professionnelle EPSON sur du papier photo
                        de haute qualité.
                      </motion.p>
                      <motion.ul
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5, staggerChildren: 0.1 }}
                        viewport={{ once: true }}
                        className="space-y-4 text-gray-600 mt-4"
                      >
                        <motion.li
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="flex items-center"
                        >
                          <span className="mr-2">•</span>
                          Formats disponibles jusqu'à A2 📄✅
                        </motion.li>
                        <motion.li
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 }}
                          viewport={{ once: true }}
                          className="flex items-center"
                        >
                          <span className="mr-2">•</span>
                          Papier photo haute qualité 📸✨
                        </motion.li>
                        <motion.li
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.7 }}
                          viewport={{ once: true }}
                          className="flex items-center"
                        >
                          <span className="mr-2">•</span>
                          Rendu des couleurs exceptionnel 🎨🔥
                        </motion.li>
                      </motion.ul>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-6 flex justify-center"
                      >
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="bg-white/10 text-black border-black hover:bg-black/5 hover:text-black transition-all duration-300 px-8 py-6 text-lg rounded-full group relative overflow-hidden font-lexend-deca"
                        >
                          <Link
                            href="https://www.instagram.com/arode.studio/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            <Instagram className="mr-3 h-6 w-6 transition-transform group-hover:scale-110" />
                            <span>Contactez nous</span>
                          </Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </ScrollAnimation>
                {/* About Section */}
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
                        alt="Arode Logo"
                        width={160}
                        height={160}
                        className="brightness-0 mb-4" // Changed from mb-6 to mb-4
                      />
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-white/10 text-black border-black hover:bg-black/5 hover:text-black transition-all duration-300 px-8 py-6 text-lg rounded-full group relative overflow-hidden font-lexend-deca"
                      >
                        <Link href="/a-propos" className="inline-flex items-center">
                          <span>À propos de Arode Studio</span>
                        </Link>
                      </Button>
                    </div>
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode7.jpg-sWuRiQWQCOz5Ya4L3SGXUxBYXJpyMc.jpeg"
                        alt="Surfer at sunset between rocks"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <div className="hidden md:block">
            <Sidebar />
          </div>
        </div>
      </FilterProvider>
      <StructuredData
        title="Arode Studio - Photographie de surf en Bretagne"
        description="Immortalisez vos meilleures sessions de surf en Bretagne avec Arode Studio. Découvrez nos galeries photo et commandez vos tirages."
        imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HomePageArode.jpg-4zAe9Jv5Ilkq5g7JzIH8mHoeusllQ5.jpeg"
      />
    </>
  )
}

function SessionCard({ name, link, imageUrl }: { name: string; link: string; imageUrl: string }) {
  return (
    <Link href={link}>
      <div className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors text-center">
        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover"/>
        </div>
        <h3 className="text-lg font-bold">{name}</h3>
      </div>
    </Link>
  );
}

