import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"

export default function BoutiquePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible={true} />
      
      {/* Bouton retour accueil */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <Home className="w-4 h-4" />
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Image
              src="/Logos/Nos-produits.svg"
              alt="Nos produits"
              width={64}
              height={64}
              className="w-16 h-16"
            />
            Boutique Arode Studio
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Bientôt disponible
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600 mb-6">
              Notre boutique en ligne sera bientôt disponible avec :
            </p>
            <ul className="text-left space-y-3 text-gray-700 max-w-md mx-auto">
              <li>• Tirages photo haute qualité</li>
              <li>• Formats personnalisés</li>
              <li>• Objets dérivés</li>
              <li>• Packs sessions complètes</li>
            </ul>
            <div className="mt-8">
              <a
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Nous suivre pour les nouveautés
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 