import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { LatestPhotosSectionClient } from "@/components/latest-photos-section-client"
import StructuredData from "@/components/structured-data"
import { Camera, MapPin, Clock, Award, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Photos Surf La Torche - Photographe Professionnel | Arode Studio",
  description: "Découvrez nos photos de surf professionnel à La Torche, Bretagne. Sessions immortalisées quotidiennement sur le spot emblématique du Finistère. Qualité haute résolution, livraison immédiate.",
  keywords: "photos surf la torche, photographe surf la torche, session surf bretagne, photos surf finistère, arode studio la torche, surf photography brittany",
  openGraph: {
    title: "Photos Surf La Torche - Photographe Professionnel | Arode Studio",
    description: "Photos de surf professionnel à La Torche, Bretagne. Sessions immortalisées quotidiennement.",
    images: [
      {
        url: "/Logos/DJI_03862025LaTorche-3.jpg",
        width: 1200,
        height: 630,
        alt: "Photos surf La Torche par Arode Studio",
      },
    ],
  },
  alternates: {
    canonical: "https://www.arodestudio.com/photos-surf-la-torche",
  },
}

export default function PhotosSurfLaTorchePage() {
  return (
    <>
      <StructuredData 
        title="Photos Surf La Torche - Photographe Professionnel | Arode Studio"
        description="Photos de surf professionnel à La Torche, Bretagne. Sessions immortalisées quotidiennement."
        page="gallery"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header alwaysVisible={true} />
        
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/Logos/DJI_03862025LaTorche-3.jpg"
              alt="Photos surf La Torche Bretagne - Vue aérienne du spot emblématique"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
            <div className="max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Photos Surf La Torche
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Photographe professionnel spécialisé dans l'immortalisation 
                de vos sessions de surf sur le spot emblématique de La Torche, Bretagne
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/gallery"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Voir Toutes les Photos
                </Link>
                <Link 
                  href="#services"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                  Nos Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-600">500+</div>
                <div className="text-gray-600">Sessions photographiées</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-600">10,000+</div>
                <div className="text-gray-600">Photos de surf prises</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-600">365</div>
                <div className="text-gray-600">Jours par an à La Torche</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-600">24h</div>
                <div className="text-gray-600">Livraison maximale</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Services de Photographie Surf à La Torche
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Arode Studio propose une gamme complète de services photographiques 
                dédiés aux surfeurs de tous niveaux sur le spot mythique de La Torche
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                  <Camera className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Photos Session Individuelle
                </h3>
                <p className="text-gray-600 mb-6">
                  Immortalisation personnalisée de votre session de surf à La Torche. 
                  Photos haute résolution prises depuis la plage avec équipement professionnel.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Suivi personnalisé pendant votre session
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Minimum 50 photos haute qualité
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                    Livraison sous 24h par email
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Photos Écoles de Surf
                </h3>
                <p className="text-gray-600 mb-6">
                  Partenariat avec les écoles de surf de La Torche pour photographier 
                  les cours et stages. Service continu durant la saison.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Couverture des cours collectifs
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Photos de progression des élèves
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Galeries organisées par date
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Tirages Professionnels
                </h3>
                <p className="text-gray-600 mb-6">
                  Impression haute qualité de vos photos préférées. 
                  Différents formats disponibles, du polaroid à l'affiche A2.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Papier photo professionnel
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Formats de A5 à A2
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Livraison ou retrait à La Torche
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Spot La Torche Info */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  La Torche : Le Spot Incontournable du Surf Breton
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Située sur la commune de Plomeur dans le Finistère Sud, La Torche est 
                  considérée comme le spot de surf le plus emblématique de Bretagne. 
                  Ses vagues constantes et sa beauté naturelle en font un terrain de jeu 
                  exceptionnel pour les surfeurs de tous niveaux.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Localisation</h4>
                      <p className="text-gray-600">Plomeur, Finistère Sud, Bretagne (29120)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Conditions Optimales</h4>
                      <p className="text-gray-600">Houle d'Ouest à Sud-Ouest, vent offshore de secteur Est</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Caractéristiques</h4>
                      <p className="text-gray-600">Beach break puissant, vagues longues, adaptée à tous niveaux</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/Logos/DJI_03862025LaTorche-3.jpg"
                    alt="Spot de surf La Torche vu du ciel - Plage mythique Bretagne Finistère"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">7km</div>
                    <div className="text-sm text-gray-600">de plage de surf</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photos récentes */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Dernières Photos de Surf à La Torche
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez les dernières sessions immortalisées par Arode Studio
              </p>
            </div>
            
            <LatestPhotosSectionClient />
            
            <div className="text-center mt-12">
              <Link 
                href="/gallery"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                <Camera className="h-5 w-5" />
                Voir Toutes les Galeries
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-red-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt pour Votre Session Photo à La Torche ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contactez Arode Studio pour immortaliser votre prochaine session de surf 
              sur le spot mythique de La Torche en Bretagne
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/arode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Nous contacter sur Instagram
              </a>
              <a 
                href="mailto:contact@arodestudio.com"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Par email
              </a>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg mx-auto text-gray-600">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pourquoi Choisir un Photographe Professionnel pour Vos Sessions de Surf à La Torche ?
              </h3>
              <p>
                <strong>La Torche</strong> n'est pas seulement un spot de surf, c'est un terrain de jeu 
                exceptionnel où chaque vague raconte une histoire. En tant que photographe spécialisé 
                dans le surf breton, <strong>Arode Studio</strong> capture ces moments uniques avec 
                une expertise technique et une connaissance intime des conditions locales.
              </p>
              
              <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Notre Expertise du Spot de La Torche
              </h4>
              <p>
                Présents quotidiennement sur le spot, nous connaissons parfaitement les <strong>marées</strong>, 
                les <strong>conditions de houle</strong>, et les meilleurs <strong>angles de prise de vue</strong> 
                à La Torche. Cette connaissance approfondie nous permet de capturer vos performances 
                sous leur meilleur jour, que vous soyez débutant ou surfeur confirmé.
              </p>
              
              <div className="bg-white p-6 rounded-lg mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Mots-clés : Photos Surf La Torche
                </h4>
                <p className="text-sm text-gray-500">
                  Cette page est optimisée pour : <em>photos surf la torche, photographe surf la torche, 
                  session surf bretagne, photos surf finistère, arode studio la torche, surf photography brittany, 
                  photographe professionnel surf, session surf plomeur, photos surf qualité professionnelle</em>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}