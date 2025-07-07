"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, AlertTriangle, Calendar, Image } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { deleteGallery } from './actions'
import { Gallery } from '@/lib/database.types'

interface GalleryListProps {
  galleries: Gallery[]
  onGalleryDeleted: () => void
}

export function GalleryList({ galleries, onGalleryDeleted }: GalleryListProps) {
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDeleteGallery = async (gallery: Gallery) => {
    setDeletingGalleryId(gallery.id)
    
    try {
      const result = await deleteGallery(gallery.id)
      
      if (result.success) {
        toast({
          title: "Galerie supprimée",
          description: `La galerie "${gallery.name}" et ses ${result.deletedPhotosCount || 0} photos ont été supprimées avec succès.`,
        })
        onGalleryDeleted()
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
      setDeletingGalleryId(null)
    }
  }

  if (galleries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucune galerie trouvée.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Galeries existantes</h2>
      <div className="grid gap-4">
        {galleries.map((gallery) => (
          <Card key={gallery.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{gallery.name}</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingGalleryId === gallery.id}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Supprimer la galerie
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          Êtes-vous sûr de vouloir supprimer la galerie <strong>"{gallery.name}"</strong> ?
                        </p>
                        <div className="bg-red-50 p-3 rounded-md border border-red-200">
                          <p className="text-red-700 text-sm font-medium">
                            ⚠️ Cette action est irréversible !
                          </p>
                          <p className="text-red-600 text-sm mt-1">
                            Toutes les photos de cette galerie seront définitivement supprimées 
                            du stockage et de la base de données.
                          </p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteGallery(gallery)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deletingGalleryId === gallery.id}
                      >
                        {deletingGalleryId === gallery.id ? (
                          <>Suppression...</>
                        ) : (
                          <>Supprimer définitivement</>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(gallery.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    ID: {gallery.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}