import { Header } from "@/components/header"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export default function ContactPage() {
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📞 Contactez-nous
          </h1>
          <p className="text-xl text-gray-600">
            Une question ? Besoin d'aide ? Nous sommes là pour vous !
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact direct */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact direct
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold">Instagram</p>
                  <a
                    href="https://www.instagram.com/arode.studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    @arode.studio
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-semibold">Email</p>
                  <a
                    href="mailto:contact@arodestudio.com"
                    className="text-blue-600 hover:underline"
                  >
                    contact@arodestudio.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-semibold">Localisation</p>
                  <p className="text-gray-600">La Torche, Bretagne</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Comment retrouver mes photos ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Utilisez notre galerie ou contactez-nous avec la date de votre session.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quels formats proposez-vous ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Photos numériques haute résolution et tirages jusqu'au format A2.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Délais de livraison ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Photos numériques immédiatement, tirages dans les 48h.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">
              Vous ne trouvez pas vos photos ?
            </h2>
            <p className="mb-6 opacity-90">
              Envoyez-nous un message avec la date et l'heure de votre session, nous vous aiderons !
            </p>
            <a
              href="https://www.instagram.com/arode.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Nous contacter maintenant
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 