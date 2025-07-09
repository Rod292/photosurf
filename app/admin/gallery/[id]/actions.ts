'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { deleteBulkPhotoFiles } from '@/lib/storage'

export async function deletePhotos(photoIds: string[]) {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Récupérer les informations des photos à supprimer
    const { data: photos, error: fetchError } = await supabase
      .from('photos')
      .select('id, original_s3_key, preview_s3_url, filename')
      .in('id', photoIds)
    
    if (fetchError) {
      console.error('Erreur lors de la récupération des photos:', fetchError)
      return { success: false, error: 'Erreur lors de la récupération des photos' }
    }
    
    if (!photos || photos.length === 0) {
      return { success: false, error: 'Aucune photo trouvée' }
    }
    
    // Supprimer les fichiers de stockage (originals et web-previews)
    console.log(`Suppression des fichiers de stockage pour ${photos.length} photos...`)
    const fileDeleteResults = await deleteBulkPhotoFiles(photos)
    
    // Compter les suppressions réussies
    const successfulFileDeletions = fileDeleteResults.filter(result => 
      result.originalDeleted && result.previewDeleted
    ).length
    
    const fileErrors = fileDeleteResults.filter(result => 
      result.errors.length > 0
    )
    
    console.log(`Fichiers supprimés avec succès: ${successfulFileDeletions}/${photos.length}`)
    
    if (fileErrors.length > 0) {
      console.warn(`Erreurs lors de la suppression des fichiers:`, fileErrors)
    }
    
    // Supprimer les photos de la base de données
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .in('id', photoIds)
    
    if (deleteError) {
      console.error('Erreur lors de la suppression des photos:', deleteError)
      return { success: false, error: 'Erreur lors de la suppression des photos' }
    }
    
    console.log(`${photos.length} photos supprimées avec succès de la base de données`)
    
    // Revalider les pages concernées
    revalidatePath('/admin/upload')
    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    
    return { 
      success: true, 
      deletedCount: photos.length,
      filesDeleted: successfulFileDeletions,
      fileErrors: fileErrors.length,
      message: `${photos.length} photo${photos.length > 1 ? 's' : ''} supprimée${photos.length > 1 ? 's' : ''} avec succès${fileErrors.length > 0 ? ` (${fileErrors.length} erreur${fileErrors.length > 1 ? 's' : ''} de fichier)` : ''}`
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des photos:', error)
    return { success: false, error: 'Une erreur inattendue est survenue' }
  }
}