"use client"

import { useState } from 'react'
import { Gallery, Photo } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Search, Download, Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SupabaseImage } from '@/components/ui/supabase-image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePhotos } from './actions'

interface GalleryManageContentProps {
  gallery: Gallery
  photos: Photo[]
}

const PHOTOS_PER_PAGE = 50

export function GalleryManageContent({ gallery, photos: initialPhotos }: GalleryManageContentProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  // Filtrer les photos selon le terme de recherche
  const filteredPhotos = photos.filter(photo => 
    photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE)
  const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE
  const endIndex = startIndex + PHOTOS_PER_PAGE
  const currentPhotos = filteredPhotos.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Gestion de la sélection
  const handleSelectPhoto = (photoId: string) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === currentPhotos.length) {
      // Désélectionner toutes les photos de la page actuelle
      const newSelected = new Set(selectedPhotos)
      currentPhotos.forEach(photo => newSelected.delete(photo.id))
      setSelectedPhotos(newSelected)
    } else {
      // Sélectionner toutes les photos de la page actuelle
      const newSelected = new Set(selectedPhotos)
      currentPhotos.forEach(photo => newSelected.add(photo.id))
      setSelectedPhotos(newSelected)
    }
  }

  // Suppression des photos
  const handleDeletePhotos = async () => {
    if (selectedPhotos.size === 0) return
    
    setIsDeleting(true)
    
    try {
      const result = await deletePhotos(Array.from(selectedPhotos))
      
      if (result.success) {
        // Mettre à jour la liste locale
        const newPhotos = photos.filter(p => !selectedPhotos.has(p.id))
        setPhotos(newPhotos)
        setSelectedPhotos(new Set())
        
        // Ajuster la page si nécessaire
        const newFilteredPhotos = newPhotos.filter(photo => 
          photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const newTotalPages = Math.ceil(newFilteredPhotos.length / PHOTOS_PER_PAGE)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
        
        toast({
          title: "Photos supprimées",
          description: `${result.deletedCount || 0} photo${(result.deletedCount || 0) > 1 ? 's' : ''} supprimée${(result.deletedCount || 0) > 1 ? 's' : ''} avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom de fichier ou ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showDetails ? 'Masquer' : 'Détails'}
              </Button>
              
              {selectedPhotos.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer ({selectedPhotos.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Supprimer les photos sélectionnées
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-2">
                          <p>
                            Êtes-vous sûr de vouloir supprimer <strong>{selectedPhotos.size}</strong> photo{selectedPhotos.size > 1 ? 's' : ''} ?
                          </p>
                          <div className="bg-red-50 p-3 rounded-md border border-red-200">
                            <p className="text-red-700 text-sm font-medium">
                              ⚠️ Cette action est irréversible !
                            </p>
                            <p className="text-red-600 text-sm mt-1">
                              Les photos seront définitivement supprimées du stockage S3 et de la base de données.
                            </p>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeletePhotos}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          {/* Statistiques */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>{filteredPhotos.length} photo{filteredPhotos.length > 1 ? 's' : ''} trouvée{filteredPhotos.length > 1 ? 's' : ''}</span>
            {totalPages > 1 && (
              <span>Page {currentPage} sur {totalPages}</span>
            )}
            {selectedPhotos.size > 0 && (
              <span className="text-blue-600 font-medium">
                {selectedPhotos.size} sélectionnée{selectedPhotos.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sélection globale */}
      {currentPhotos.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={currentPhotos.every(photo => selectedPhotos.has(photo.id))}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Sélectionner tout sur cette page ({currentPhotos.length})
            </label>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Grille de photos */}
      {currentPhotos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucune photo trouvée pour cette recherche.' : 'Aucune photo dans cette galerie.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Checkbox de sélection */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedPhotos.has(photo.id)}
                      onCheckedChange={() => handleSelectPhoto(photo.id)}
                      className="bg-white/80 border-gray-300"
                    />
                  </div>
                  
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gray-200">
                    <SupabaseImage
                      src={photo.preview_s3_url}
                      alt={photo.filename}
                      width={400}
                      height={533}
                      className="w-full h-full object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    />
                  </div>
                  
                  {/* Informations */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate" title={photo.filename}>
                      {photo.filename}
                    </p>
                    
                    {showDetails && (
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p>ID: {photo.id.slice(0, 8)}...</p>
                        <p>Taille: {formatFileSize(photo.filesize || 0)}</p>
                        <p>Type: {photo.content_type}</p>
                        <p>Créé: {new Date(photo.created_at || Date.now()).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {/* Pagination en bas */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                Premier
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Dernier
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}