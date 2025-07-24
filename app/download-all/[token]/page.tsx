'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface PhotoDownload {
  photoId: string
  downloadUrl: string
  alternativeUrls?: string[]
  filename?: string
}

export default function DownloadAllPage() {
  const params = useParams()
  const token = params.token as string
  const [downloads, setDownloads] = useState<PhotoDownload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadCount, setDownloadCount] = useState(0)

  useEffect(() => {
    if (!token) return

    // Décoder le token pour récupérer l'order ID
    try {
      const decoded = atob(token)
      const [orderId] = decoded.split(':')
      
      // Récupérer les liens de téléchargement
      fetchDownloadLinks(orderId)
    } catch (error) {
      setError('Token invalide')
      setIsLoading(false)
    }
  }, [token])

  const fetchDownloadLinks = async (orderId: string) => {
    try {
      // Timeout plus court et retry logic
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 secondes max
      
      const response = await fetch(`/api/get-order-photos/${orderId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.photos || data.photos.length === 0) {
        setError('Aucune photo trouvée pour cette commande')
        setIsLoading(false)
        return
      }

      // Construire les liens de téléchargement avec validation
      const downloadLinks: PhotoDownload[] = data.photos.map((photo: any, index: number) => {
        const baseUrl = 'https://chwddsmqzjzpfikuupuf.supabase.co'
        
        // Essayer plusieurs patterns d'URL
        const urlCandidates = [
          `${baseUrl}/storage/v1/object/public/originals/${photo.original_s3_key}`,
          `${baseUrl}/storage/v1/object/public/originals/${photo.id}.jpg`,
        ]
        
        return {
          photoId: photo.id,
          downloadUrl: urlCandidates[0], // Utiliser le premier par défaut
          alternativeUrls: urlCandidates.slice(1),
          filename: `Photo_${String(index + 1).padStart(2, '0')}_${(photo.filename || `photo-${photo.id}.jpg`).replace(/[^a-zA-Z0-9.-]/g, '_')}`
        }
      })

      console.log(`✅ Found ${downloadLinks.length} photos to download`)
      setDownloads(downloadLinks)
      setIsLoading(false)
      
      // Commencer les téléchargements automatiquement après 2 secondes
      setTimeout(() => {
        startDownloads(downloadLinks)
      }, 2000)
      
    } catch (error: any) {
      console.error('❌ Error fetching download links:', error)
      
      if (error.name === 'AbortError') {
        setError('Timeout - La récupération des photos a pris trop de temps. Réessayez dans quelques instants.')
      } else if (error.message?.includes('ETIMEDOUT')) {
        setError('Problème de connexion - Réessayez dans quelques instants.')
      } else {
        setError(`Erreur lors de la récupération des photos: ${error.message || 'Erreur inconnue'}`)
      }
      
      setIsLoading(false)
    }
  }

  const startDownloads = (downloadLinks: PhotoDownload[]) => {
    let count = 0
    
    downloadLinks.forEach((download, index) => {
      setTimeout(async () => {
        let success = false
        
        // Essayer l'URL principale
        try {
          const link = document.createElement('a')
          link.href = download.downloadUrl
          link.download = download.filename || `photo-${download.photoId}.jpg`
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          success = true
        } catch (error) {
          console.warn(`❌ Primary URL failed for photo ${index + 1}:`, download.downloadUrl)
        }
        
        // Si l'URL principale échoue, essayer les alternatives
        if (!success && download.alternativeUrls) {
          for (const altUrl of download.alternativeUrls) {
            try {
              const link = document.createElement('a')
              link.href = altUrl
              link.download = download.filename || `photo-${download.photoId}.jpg`
              link.target = '_blank'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              console.log(`✅ Alternative URL worked for photo ${index + 1}:`, altUrl)
              success = true
              break
            } catch (error) {
              console.warn(`❌ Alternative URL failed for photo ${index + 1}:`, altUrl)
            }
          }
        }
        
        if (success) {
          console.log(`✅ Download started for photo ${index + 1}`)
        } else {
          console.error(`❌ All URLs failed for photo ${index + 1}`)
        }
        
        setDownloadCount(prev => prev + 1)
      }, index * 500) // 500ms entre chaque téléchargement
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Préparation des téléchargements...
          </h2>
          <p className="text-gray-600">
            Récupération de vos photos en cours
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erreur
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('')
              setIsLoading(true)
              // Retry fetch
              const decoded = atob(token)
              const [orderId] = decoded.split(':')
              fetchDownloadLinks(orderId)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors mr-2"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.close()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Téléchargement de vos photos
          </h1>
          
          <p className="text-gray-600 mb-4">
            {downloads.length} photos trouvées
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Téléchargements en cours :</strong> {downloadCount}/{downloads.length}
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(downloadCount / downloads.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {downloadCount === downloads.length && downloads.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold">
                ✅ Tous les téléchargements ont été lancés !
              </p>
              <p className="text-xs text-green-600 mt-1">
                Vérifiez votre dossier de téléchargements
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => window.close()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Fermer cette page
        </button>
      </div>
    </div>
  )
}