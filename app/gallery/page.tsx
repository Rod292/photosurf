import { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { Database } from "@/lib/database.types"

type Gallery = Database["public"]["Tables"]["galleries"]["Row"]

// Mock data pour les tests en attendant les vraies données - UUIDs valides
const mockGalleries: Gallery[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Session Matin - La Torche",
    date: "2024-12-15",
    surf_school_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: "2024-12-15T10:00:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", 
    name: "Session Après-midi - Penhors",
    date: "2024-12-14",
    surf_school_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: "2024-12-14T14:00:00Z"
  }
]

async function getAllGalleries(): Promise<Gallery[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data: galleries, error } = await supabase
      .from("galleries")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Erreur Supabase:", error)
      return mockGalleries
    }
    
    return galleries || mockGalleries
  } catch (error) {
    console.error("Erreur lors de la récupération des galeries:", error)
    return mockGalleries
  }
}

export const metadata: Metadata = {
  title: "Galeries Photo - Arode Studio",
  description: "Découvrez toutes nos galeries de photos de surf en Bretagne. Trouvez vos photos et commandez vos tirages professionnels.",
  keywords: ["galeries photo", "surf", "bretagne", "la torche", "photos"],
}

export default async function GalleriesListPage() {
  const galleries = await getAllGalleries()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
              Nos Galeries Photo
            </h1>
            <p className="text-xl md:text-2xl font-varela-round opacity-90 max-w-3xl mx-auto">
              Découvrez vos photos de surf en Bretagne. Chaque session est immortalisée avec passion et professionnalisme.
            </p>
          </div>
        </div>

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
              Galeries Disponibles
            </h2>
            
            {galleries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-2xl font-semibold mb-4">Aucune galerie disponible</h3>
                <p className="text-gray-600">Les nouvelles galeries seront bientôt disponibles !</p>
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
      
      <Footer />
    </div>
  )
} 