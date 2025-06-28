import { Header } from "@/components/header"

export default function BoutiquePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible={true} />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ Boutique Arode Studio
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