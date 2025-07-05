import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png"
              alt="Arode Studio Logo"
              width={100}
              height={100}
              className="mb-2"
            />
            <p className="text-sm text-gray-400 font-lexend-deca">
              Immortalise vos meilleures sessions de surf en Bretagne.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3 font-dm-sans-handgloves">Liens Rapides</h3>
            <ul className="space-y-1 font-lexend-deca">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/cooking" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Cooking Summer 2025
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-gray-400 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Panier
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3 font-dm-sans-handgloves">Contactez-nous</h3>
            <ul className="space-y-1 font-lexend-deca">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <a
                  href="mailto:arodestudio@gmail.com"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  arodestudio@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Bretagne, France</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-3 font-dm-sans-handgloves">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-400 font-lexend-deca">
            © {new Date().getFullYear()} Arode Studio. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

