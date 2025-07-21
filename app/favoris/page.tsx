'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeartButton } from '@/components/ui/heart-button'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { PhotoLightboxModal } from '@/components/photo-lightbox-modal'
import { Header } from '@/components/header'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trash2, ShoppingCart, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FavorisPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Convert favorites to Photo format for lightbox
  const photosForLightbox = favorites.map(fav => ({
    id: fav.id,
    filename: `photo-${fav.id}`,
    preview_s3_url: fav.preview_url,
    original_s3_key: `originals/${fav.id}`,
    gallery_id: fav.gallery_id,
    gallery: { 
      id: fav.gallery_id,
      name: fav.gallery_name || `Galerie ${fav.gallery_id}`,
      date: new Date().toISOString().split('T')[0]
    },
    created_at: new Date().toISOString(),
    filesize: undefined,
    content_type: undefined
  }))
  return (
    <div className="min-h-screen bg-white">
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
      
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">

          {/* Titre de la page et actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
                Vos photos favorites
              </h1>
              <p className="text-gray-600">
                {favorites.length} photo{favorites.length > 1 ? 's' : ''} favorite{favorites.length > 1 ? 's' : ''}
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFavorites}
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vider les favoris
                </Button>
              </div>
            )}
          </div>

          {/* Contenu conditionnel */}
          {favorites.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 md:p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Image
                      src="/Logos/Heart copie.svg"
                      alt="Cœur"
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-black mb-4">
                  Aucune photo favorite pour le moment
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Parcourez nos galeries et cliquez sur le cœur pour ajouter vos photos préférées à vos favoris. 
                  Vous pourrez les retrouver facilement ici et les ajouter rapidement à votre panier.
                </p>
                <Link href="/gallery">
                  <Button 
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Explorer les galeries
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grille des photos favorites */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3"
                layout
              >
                <AnimatePresence>
                  {favorites.map((photo, index) => {
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="cursor-pointer group"
                        onClick={() => setLightboxIndex(index)}
                      >
                        <div className="relative w-full pt-[100%] overflow-hidden rounded-lg bg-gray-200">
                          <Image
                            src={photo.preview_url}
                            alt={`Photo ${photo.id}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
                          />
                          
                          {/* Heart button */}
                          <div className="absolute top-1 right-1 z-10">
                            <HeartButton 
                              photo={photo}
                              size="sm"
                            />
                          </div>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center">
                              <p className="text-xs font-medium">
                                Voir en grand
                              </p>
                            </div>
                          </div>
                          
                          {/* Arode Studio watermark */}
                          <div className="absolute bottom-1 right-1 bg-white/90 px-1 py-0.5 rounded text-xs font-medium opacity-70">
                            Arode Studio
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Section d'information */}
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">
              Les favoris sont sauvegardés localement sur votre navigateur
            </p>
            <p className="text-sm">
              Maximum {100} photos favorites • Suppression automatique après 30 jours d'inactivité
            </p>
          </div>
          </div>
        </div>
      </main>
      
      {/* Modal Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightboxModal
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
          photos={photosForLightbox}
          currentIndex={lightboxIndex}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}