'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeartButton } from '@/components/ui/heart-button'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCartStore } from '@/context/cart-context'
import { getNextPhotoPrice } from '@/lib/pricing'
import { PhotoLightboxModal } from '@/components/photo-lightbox-modal'
import { Header } from '@/components/header'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Trash2, ShoppingCart, Home, Plus, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FavorisPage() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isAddingAll, setIsAddingAll] = useState(false)
  
  // Cart store hooks
  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  
  // Helper function to check if photo is in cart
  const isPhotoInCart = (photoId: string) => {
    return cartItems.some(item => 
      item.photo_id === photoId && item.product_type === 'digital'
    )
  }
  
  // Function to add single photo to cart
  const addPhotoToCart = (photo: any) => {
    if (!isPhotoInCart(photo.id)) {
      const digitalPhotoCount = cartItems.filter(item => item.product_type === 'digital').length
      const currentTotal = cartItems.filter(item => item.product_type === 'digital').reduce((sum, item) => sum + item.price, 0)
      const price = getNextPhotoPrice(digitalPhotoCount, 'digital', currentTotal)
      
      addItem({
        photo_id: photo.id,
        product_type: 'digital',
        price: price,
        preview_url: photo.preview_url,
        filename: `photo-${photo.id}`,
        delivery_option: undefined,
        delivery_price: 0
      })
    }
  }
  
  // Function to add all favorites to cart
  const addAllFavoritesToCart = async () => {
    setIsAddingAll(true)
    
    // Get photos that aren't already in cart
    const photosToAdd = favorites.filter(photo => !isPhotoInCart(photo.id))
    
    // Add each photo with progressive pricing
    photosToAdd.forEach((photo, index) => {
      setTimeout(() => {
        addPhotoToCart(photo)
      }, index * 100) // Small delay for UX
    })
    
    setTimeout(() => {
      setIsAddingAll(false)
    }, photosToAdd.length * 100 + 500)
  }
  
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
              <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
                <Button
                  onClick={addAllFavoritesToCart}
                  disabled={isAddingAll || favorites.every(photo => isPhotoInCart(photo.id))}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  {isAddingAll ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3" />
                      <span className="font-semibold">Ajout en cours...</span>
                    </>
                  ) : favorites.every(photo => isPhotoInCart(photo.id)) ? (
                    <>
                      <CheckCircle className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Toutes dans le panier</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Ajouter toutes au panier</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearFavorites}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Trash2 className="mr-3 h-5 w-5" />
                  <span className="font-semibold">Vider les favoris</span>
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
              {/* Grille des photos favorites - Format rectangulaire comme gallery */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                layout
              >
                <AnimatePresence>
                  {favorites.map((photo, index) => {
                    const inCart = isPhotoInCart(photo.id)
                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <div 
                          className="relative w-full pt-[133%] overflow-hidden rounded-xl bg-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                          onClick={() => setLightboxIndex(index)}
                        >
                          <Image
                            src={photo.preview_url}
                            alt={`Photo ${photo.id}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                          />
                          
                          {/* Cart button - positioned in top left with cart icon */}
                          <div 
                            className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => addPhotoToCart(photo)}
                              className={`w-10 h-10 p-0 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                                inCart
                                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
                                  : 'bg-white/95 hover:bg-white text-gray-700 hover:shadow-xl'
                              }`}
                              title={inCart ? "Déjà dans le panier" : "Ajouter au panier"}
                              disabled={inCart}
                            >
                              {inCart ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Image
                                  src="/Logos/shopping-cart.svg"
                                  alt="Ajouter au panier"
                                  width={16}
                                  height={16}
                                  className="h-4 w-4"
                                />
                              )}
                            </button>
                          </div>
                          
                          {/* Heart button - positioned in top right */}
                          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                            <HeartButton 
                              photo={photo}
                              size="sm"
                            />
                          </div>
                          
                          {/* Hover overlay with better gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                            <div className="text-white text-center">
                              <p className="text-sm font-semibold drop-shadow-lg">
                                Cliquer pour agrandir
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Section d'information améliorée */}
          {favorites.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Conseils pour vos favoris
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-800">Ajout rapide au panier</p>
                  <p>Utilisez le bouton "+" sur chaque photo pour l'ajouter directement au panier</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Image
                      src="/Logos/Heart copie.svg"
                      alt="Cœur"
                      width={20}
                      height={20}
                    />
                  </div>
                  <p className="font-medium text-gray-800">Sauvegarde locale</p>
                  <p>Vos favoris sont sauvegardés sur ce navigateur pendant 30 jours</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-800">Maximum 100 photos</p>
                  <p>Gardez vos meilleures photos favorites pour un achat facilité</p>
                </div>
              </div>
            </div>
          )}
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