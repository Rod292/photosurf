import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Gallery } from "@/lib/database.types"
import { ArrowLeft, Home } from "lucide-react"

interface SearchParams {
  date?: string
  school?: string
}

async function getFilteredGalleries(searchParams: SearchParams): Promise<Gallery[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    let query = supabase.from("galleries").select("*")
    
    // Filtrer par date si présente
    if (searchParams.date) {
      query = query.eq("date", searchParams.date)
    }
    
    // Filtrer par école si présente
    if (searchParams.school) {
      query = query.ilike("metadata->>'school'", `%${searchParams.school}%`)
    }
    
    const { data: galleries, error } = await query.order("created_at", { ascending: false })
    
    if (error) {
      console.error("Erreur Supabase:", error)
      return []
    }
    
    return galleries || []
  } catch (error) {
    console.error("Erreur lors de la récupération des galeries:", error)
    return []
  }
}

export const metadata: Metadata = {
  title: "Galeries Photo - Arode Studio",
  description: "Découvrez toutes nos galeries de photos de surf en Bretagne. Trouvez vos photos et commandez vos tirages professionnels.",
  keywords: ["galeries photo", "surf", "bretagne", "la torche", "photos"],
}

export default async function GalleriesListPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const galleries = await getFilteredGalleries(resolvedSearchParams)
  const hasFilters = resolvedSearchParams.date || resolvedSearchParams.school

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
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

        {/* Hero Section avec image de fond */}
        <div className="relative pt-20 pb-24 overflow-hidden">
          {/* Image de fond */}
          <div className="absolute inset-0">
            <Image
              src="/latorche-aerial.jpg"
              alt="Vue aérienne de La Torche"
              fill
              className="object-cover"
              priority
            />
            {/* Léger overlay sombre uniquement pour la lisibilité du texte */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          </div>
          
          {/* Contenu */}
          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold font-playfair mb-8 drop-shadow-lg">
              Nos Galeries Photo
            </h1>
            <p className="text-xl md:text-2xl font-varela-round opacity-95 max-w-4xl mx-auto leading-relaxed drop-shadow-md">
              Découvrez vos photos de surf en Bretagne. Chaque session est immortalisée avec passion et professionnalisme sur ce magnifique spot de La Torche.
            </p>
          </div>
        </div>

        {/* Filtres actifs */}
        {hasFilters && (
          <div className="bg-blue-50 py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="text-gray-700">Filtres actifs :</span>
                {resolvedSearchParams.date && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                    📅 {new Date(resolvedSearchParams.date).toLocaleDateString("fr-FR")}
                  </span>
                )}
                {resolvedSearchParams.school && (
                  <span className="bg-white px-3 py-1 rounded-full text-sm border border-blue-200">
                    🏄‍♂️ {resolvedSearchParams.school}
                  </span>
                )}
                <Link 
                  href="/gallery"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Effacer les filtres
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-dm-sans mb-8">
                Comment retrouver vos photos ?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-blue-600 text-4xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold mb-2">1. Trouvez votre date</h3>
                  <p className="text-gray-600">Recherchez la galerie correspondant à votre date de session</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-blue-600 text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">2. Parcourez les photos</h3>
                  <p className="text-gray-600">Explorez toutes les photos de votre session</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-blue-600 text-4xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold mb-2">3. Commandez</h3>
                  <p className="text-gray-600">Sélectionnez vos photos favorites et passez commande</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Galleries Grid */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-dm-sans">
              {hasFilters ? "Résultats de recherche" : "Galeries Disponibles"}
            </h2>
            
            {galleries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-2xl font-semibold mb-4">
                  {hasFilters ? "Aucun résultat trouvé" : "Aucune galerie disponible"}
                </h3>
                <p className="text-gray-600">
                  {hasFilters 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Les nouvelles galeries seront bientôt disponibles !"}
                </p>
                {hasFilters && (
                  <Link 
                    href="/gallery"
                    className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Voir toutes les galeries
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleries.map((gallery) => (
                  <Link 
                    key={gallery.id}
                    href={`/gallery/${gallery.id}`}
                    className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="aspect-video bg-gradient-to-r from-blue-400 to-blue-600 relative overflow-hidden">
                      {/* Placeholder image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-sm opacity-90">Cliquez pour voir les photos</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {gallery.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {new Date(gallery.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric", 
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                        <span className="font-medium">Voir les photos</span>
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 