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
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-6">
            <Image
              src="/Logos/Nos-produits.svg"
              alt="Nos produits"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <h1 className="text-5xl font-bold text-gray-900">
              Boutique <span className="text-blue-600">Arode Studio</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos services photo professionnels pour immortaliser vos moments de surf
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Section PHOTOS NUMÉRIQUES */}
          <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/Logos/camera2.svg"
                  alt="Photos numériques"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <h2 className="text-2xl font-bold text-gray-900">PHOTOS NUMÉRIQUES</h2>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Recevez vos photos instantanément par email en haute résolution, sans filigrane. Parfait pour vos réseaux sociaux et souvenirs numériques.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <span>Envoi instantané par email 📧✨</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <span>Haute résolution sans filigrane 📸🔥</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <span>Idéal pour les réseaux sociaux 📱💫</span>
                </div>
              </div>
              
              {/* Nouveau système de tarifs dégressifs */}
              <div className="text-center">
                <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Tarifs dégressifs - Photos numériques</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">15€</div>
                      <div className="text-sm text-gray-600">1ère photo</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-emerald-300">
                      <div className="text-2xl font-bold text-emerald-600">10€</div>
                      <div className="text-sm text-gray-600">2ème photo</div>
                      <div className="text-xs text-emerald-600 font-medium">-33%</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-emerald-400">
                      <div className="text-2xl font-bold text-emerald-700">5€</div>
                      <div className="text-sm text-gray-600">3ème+ photos</div>
                      <div className="text-xs text-emerald-700 font-medium">-67%</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Plus vous commandez, plus vous économisez !
                  </p>
                </div>
                
                <Link 
                  href="/gallery"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src="/Logos/camera-icon.svg"
                    alt="Prix"
                    width={24}
                    height={24}
                    className="w-6 h-6 invert"
                  />
                  Découvrir nos photos
                </Link>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href="https://www.instagram.com/arode.studio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 text-sm"
                    >
                      📸 Instagram
                    </a>
                    <a
                      href="mailto:contact@arodestudio.com"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm"
                    >
                      ✉️ Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section TIRAGES PHOTO */}
          <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-700 to-gray-900"></div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/Logos/Imprimante.svg"
                  alt="Tirages photo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <h2 className="text-2xl font-bold text-gray-900">TIRAGES PHOTO</h2>
              </div>
              
              <div className="mb-6">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Beige%20Minimalist%20Picture%20Frame%20Mockup%20Instagram%20Post-1qtGHkoHXu1DX4vj6NlRbO5b1nORxP.png"
                    alt="Exemple de tirage photo encadré"
                    width={500}
                    height={375}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Vous souhaitez imprimer vos photos ? Nous proposons des tirages professionnels sur papier photo haute qualité avec le fichier JPEG inclus.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold">✓</span>
                  </div>
                  <span>Formats A5, A4, A3, A2 disponibles 📄✨</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold">✓</span>
                  </div>
                  <span>Papier photo haute qualité 📸✨</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold">✓</span>
                  </div>
                  <span>Fichier JPEG haute résolution inclus 💾🔥</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold">✓</span>
                  </div>
                  <span>Récupération gratuite à La Torche 🏄‍♂️</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold">✓</span>
                  </div>
                  <span>Livraison à domicile possible 📦</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-6 p-4 bg-gray-100 rounded-2xl border-2 border-gray-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Formats disponibles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-gray-800">20€</div>
                      <div className="text-sm text-gray-600">A5 + JPEG</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-gray-800">30€</div>
                      <div className="text-sm text-gray-600">A4 + JPEG</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-gray-800">50€</div>
                      <div className="text-sm text-gray-600">A3 + JPEG</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xl font-bold text-gray-800">80€</div>
                      <div className="text-sm text-gray-600">A2 + JPEG</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-3">Prix fixes, pas de dégressif</div>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="text-sm font-bold text-blue-800 mb-3">Options de livraison</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>🏄‍♂️ Récupération à La Torche</span>
                      <span className="font-bold text-green-600">GRATUIT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 Livraison A5</span>
                      <span className="font-bold">+5€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 Livraison A4</span>
                      <span className="font-bold">+7€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 Livraison A3</span>
                      <span className="font-bold">+10€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📦 Livraison A2</span>
                      <span className="font-bold">+15€</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/gallery"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-black text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-300 cursor-pointer"
                >
                  <Image
                    src="/Logos/Imprimante.svg"
                    alt="Tirage"
                    width={24}
                    height={24}
                    className="w-6 h-6 invert"
                  />
                  Commander vos tirages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 