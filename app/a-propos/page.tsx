import { Header } from "@/components/header"
import Image from "next/image"
import { Instagram, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "À propos de nous | Arode Studio",
  description: "Découvrez l'histoire d'Arode Studio, né de la passion pour le surf et la photographie en Bretagne.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible />
      <main className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold mb-8 font-dm-sans-handgloves">À propos de nous</h1>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/2 relative aspect-square md:sticky md:top-24">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AboutArode.jpg-6G18ndc0Wg4cWQASnzAcp4zTW1hjtP.jpeg"
              alt="Silhouette d'un surfeur au coucher du soleil"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <p className="text-xl md:text-2xl leading-relaxed font-lexend-deca">
              Arode Studio est le résultat du croisement de deux passions : le surf et la photographie. Fondé par deux
              amis, l'un surfeur et l'autre photographe, ce projet est né de notre envie de sublimer les sessions sur
              les vagues bretonnes.
            </p>
            <p className="text-xl md:text-2xl leading-relaxed font-lexend-deca">
              Découvrez nos images et contactez-nous car on pourrait peut être vous rejoindre lors de votre prochaine
              session de surf ! A bientôt🏄📸
            </p>
            <div className="pt-4 flex flex-col space-y-4">
              <Link
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-lexend-deca"
              >
                <Instagram size={28} />
                <span className="text-lg">@arode.studio</span>
              </Link>
              <Link
                href="https://www.instagram.com/arthur_lemarechal/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-lexend-deca"
              >
                <Instagram size={28} />
                <span className="text-lg">@arthur_lemarechal</span>
              </Link>
              <Link
                href="https://www.instagram.com/pcklerod/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-lexend-deca"
              >
                <Instagram size={28} />
                <span className="text-lg">@pcklerod</span>
              </Link>
            </div>
            <div className="mt-8 px-4 md:px-0">
              <Button asChild className="w-full md:w-auto font-lexend-deca" aria-label="Retourner à la page d'accueil">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <Home size={20} />
                  <span>Retour à l'accueil</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

