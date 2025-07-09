import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { GalleryManageContent } from './gallery-manage-content'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { Gallery, Photo } from '@/lib/database.types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getGalleryWithPhotos(id: string): Promise<{ gallery: Gallery; photos: Photo[] } | null> {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Récupérer la galerie
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (galleryError || !gallery) {
      console.error('Erreur lors de la récupération de la galerie:', galleryError)
      return null
    }
    
    // Récupérer les photos de la galerie
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .eq('gallery_id', id)
      .order('created_at', { ascending: false })
    
    if (photosError) {
      console.error('Erreur lors de la récupération des photos:', photosError)
      return { gallery, photos: [] }
    }
    
    return { gallery, photos: photos || [] }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error)
    return null
  }
}

export default async function GalleryManagePage({ params }: PageProps) {
  // Vérifier l'authentification
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin-session')
  
  if (!adminSession || adminSession.value !== 'authenticated') {
    redirect('/login?redirect=/admin/gallery')
  }
  
  const { id } = await params
  const data = await getGalleryWithPhotos(id)
  
  if (!data) {
    redirect('/admin/upload')
  }
  
  const { gallery, photos } = data
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/upload"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour à l'upload
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Gestion de la galerie
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {gallery.name}
            </h2>
            <p className="text-gray-600">
              {new Date(gallery.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} • {photos.length} photo{photos.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <GalleryManageContent gallery={gallery} photos={photos} />
        </Suspense>
      </div>
    </div>
  )
}