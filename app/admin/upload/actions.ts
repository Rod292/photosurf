'use server'

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { SurfSchool, Gallery } from '@/lib/database.types'
import { cookies } from 'next/headers'

// Server Actions pour récupérer les données - SIMPLIFIÉ
export async function fetchSurfSchools(): Promise<SurfSchool[]> {
  try {
    console.log('🏄‍♂️ Fetching surf schools with standard client...')
    
    const supabase = await createSupabaseServerClient()
    
    const { data: schools, error } = await supabase
      .from('surf_schools')
      .select('id, name, slug')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching surf schools:', error)
      return []
    }
    
    console.log('✅ Surf schools fetched successfully:', schools?.length || 0)
    return schools || []
  } catch (error) {
    console.error('💥 Unexpected error in fetchSurfSchools:', error)
    return []
  }
}

export async function fetchGalleries(): Promise<Gallery[]> {
  try {
    console.log('🖼️ Fetching galleries with standard client...')
    
    const supabase = await createSupabaseServerClient()
    
    const { data: galleries, error } = await supabase
      .from('galleries')
      .select('id, name, date, school_id, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching galleries:', error)
      return []
    }
    
    console.log('✅ Galleries fetched successfully:', galleries?.length || 0)
    return galleries || []
  } catch (error) {
    console.error('💥 Unexpected error in fetchGalleries:', error)
    return []
  }
}

// Schéma de validation côté serveur
const uploadServerSchema = z.object({
  school_id: z.number().min(1, "École de surf requise"),
  gallerySelection: z.string().min(1, "Sélection de galerie requise"),
  newGalleryName: z.string().optional(),
  galleryDate: z.string().min(1, "Date requise"),
  originalFiles: z.array(z.instanceof(File)).min(1, "Au moins un fichier original requis"),
  previewFiles: z.array(z.instanceof(File)).min(1, "Au moins un fichier preview requis"),
})

// Type de retour pour le Server Action
interface UploadResult {
  success: boolean
  error?: string
  uploadedCount?: number
}

export async function uploadPhotos(formData: FormData): Promise<UploadResult> {
  try {
    // Vérifier l'authentification avec cookies
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      redirect('/login')
    }

    // Use admin client to bypass RLS for admin operations
    const supabase = createSupabaseAdminClient()

    // Extraire et valider les données du FormData
    const schoolId = parseInt(formData.get('school_id') as string)
    const gallerySelection = formData.get('gallerySelection') as string
    const newGalleryName = formData.get('newGalleryName') as string | null
    const galleryDate = formData.get('galleryDate') as string
    const originalFiles = formData.getAll('originalFiles') as File[]
    const previewFiles = formData.getAll('previewFiles') as File[]

    // Validation avec Zod
    const validationResult = uploadServerSchema.safeParse({
      school_id: schoolId,
      gallerySelection,
      newGalleryName: newGalleryName || undefined,
      galleryDate,
      originalFiles,
      previewFiles,
    })

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Données de formulaire invalides: ' + validationResult.error.issues.map(i => i.message).join(', ')
      }
    }

    const { school_id, gallerySelection: selectedGallery, newGalleryName: newName, galleryDate: date } = validationResult.data

    // Vérifier que l'école de surf existe
    const { data: surfSchool, error: schoolError } = await supabase
      .from('surf_schools')
      .select('id, name')
      .eq('id', school_id)
      .single()

    if (schoolError || !surfSchool) {
      return {
        success: false,
        error: 'École de surf sélectionnée introuvable'
      }
    }

    // Valider que le nombre de fichiers correspond
    if (originalFiles.length !== previewFiles.length) {
      return {
        success: false,
        error: `Nombre de fichiers différent: ${originalFiles.length} originaux, ${previewFiles.length} previews`
      }
    }

    // Trier les fichiers par nom pour garantir l'appariement
    const sortedOriginals = originalFiles.sort((a, b) => a.name.localeCompare(b.name))
    const sortedPreviews = previewFiles.sort((a, b) => a.name.localeCompare(b.name))

    // Vérifier que les noms correspondent (optionnel, pour une validation supplémentaire)
    for (let i = 0; i < sortedOriginals.length; i++) {
      const originalName = sortedOriginals[i].name
      const previewName = sortedPreviews[i].name
      
      if (originalName !== previewName) {
        console.warn(`Fichiers non-correspondants à l'index ${i}: ${originalName} vs ${previewName}`)
        // On continue quand même - l'utilisateur a été prévenu côté client
      }
    }

    // Gérer la galerie (créer ou utiliser existante)
    let galleryId: string

    if (selectedGallery === 'new') {
      if (!newName?.trim()) {
        return {
          success: false,
          error: 'Le nom de la nouvelle galerie est requis'
        }
      }

      // Créer une nouvelle galerie avec school_id
      const { data: newGallery, error: galleryError } = await supabase
        .from('galleries')
        .insert({
          name: newName.trim(),
          date: date,
          school_id: school_id,
        })
        .select('id')
        .single()

      if (galleryError || !newGallery) {
        console.error('Gallery creation error:', galleryError)
        return {
          success: false,
          error: 'Erreur lors de la création de la galerie: ' + (galleryError?.message || 'Erreur inconnue')
        }
      }

      galleryId = newGallery.id
    } else {
      // Vérifier que la galerie existe et appartient à la bonne école
      const { data: existingGallery, error: galleryCheckError } = await supabase
        .from('galleries')
        .select('id, school_id')
        .eq('id', selectedGallery)
        .eq('school_id', school_id)
        .single()

      if (galleryCheckError || !existingGallery) {
        return {
          success: false,
          error: 'Galerie sélectionnée introuvable ou incompatible avec l\'école'
        }
      }

      galleryId = existingGallery.id
    }

    // Traiter chaque paire de fichiers
    let uploadedCount = 0
    
    for (let i = 0; i < sortedOriginals.length; i++) {
      const originalFile = sortedOriginals[i]
      const previewFile = sortedPreviews[i]
      
      try {
        // Valider les types de fichiers
        if (!originalFile.type.startsWith('image/') || !previewFile.type.startsWith('image/')) {
          throw new Error(`Fichiers ${originalFile.name}/${previewFile.name} ne sont pas des images`)
        }

        // Générer un nom de fichier unique basé sur l'index et timestamp
        const timestamp = Date.now()
        const uniqueId = `${galleryId.replace(/-/g, '')}_${timestamp}_${i.toString().padStart(3, '0')}`
        const originalExtension = originalFile.name.split('.').pop() || 'jpg'
        const previewExtension = previewFile.name.split('.').pop() || 'jpg'
        
        const originalFileName = `${uniqueId}_original.${originalExtension}`
        const previewFileName = `${uniqueId}_preview.${previewExtension}`

        // Lire les fichiers
        const originalBuffer = Buffer.from(await originalFile.arrayBuffer())
        const previewBuffer = Buffer.from(await previewFile.arrayBuffer())

        // Upload de l'image originale vers Supabase Storage (bucket privé)
        const { data: originalUpload, error: originalError } = await supabase.storage
          .from('originals')
          .upload(`gallery-${galleryId}/${originalFileName}`, originalBuffer, {
            contentType: originalFile.type,
            upsert: false
          })

        if (originalError) {
          throw new Error(`Erreur upload original ${originalFile.name}: ${originalError.message}`)
        }

        // Upload de l'image preview vers Supabase Storage (bucket public)
        const { data: previewUpload, error: previewError } = await supabase.storage
          .from('web-previews')
          .upload(`gallery-${galleryId}/${previewFileName}`, previewBuffer, {
            contentType: previewFile.type,
            upsert: false
          })

        if (previewError) {
          // Si preview échoue, nettoyer l'original déjà uploadé
          await supabase.storage
            .from('originals')
            .remove([originalUpload.path])
          throw new Error(`Erreur upload preview ${previewFile.name}: ${previewError.message}`)
        }

        // ÉTAPE CRUCIALE : Obtenir l'URL publique de l'image de prévisualisation
        const { data: { publicUrl: previewPublicUrl } } = supabase.storage
          .from('web-previews')
          .getPublicUrl(previewUpload.path)

        if (!previewPublicUrl) {
          // Si on ne peut pas obtenir l'URL, on considère que c'est une erreur et on nettoie
          await supabase.storage.from('originals').remove([originalUpload.path])
          await supabase.storage.from('web-previews').remove([previewUpload.path])
          throw new Error(`Impossible d'obtenir l'URL publique pour ${previewFile.name}`)
        }

        // Insérer les métadonnées de la photo dans la base de données
        const { error: dbError } = await supabase.from('photos').insert({
          gallery_id: galleryId,
          filename: originalFile.name,
          original_s3_key: originalUpload.path,
          preview_s3_url: previewPublicUrl,
          filesize: originalFile.size,
          content_type: originalFile.type
        })

        if (dbError) {
          // Si l'insertion échoue, nettoyer les fichiers uploadés
          await supabase.storage.from('originals').remove([originalUpload.path])
          await supabase.storage.from('web-previews').remove([previewUpload.path])
          throw new Error(`Erreur DB pour ${originalFile.name}: ${dbError.message}`)
        }

        uploadedCount++
      } catch (error) {
        console.error(`Error processing file pair ${i}:`, error)
        // Continue avec les autres fichiers mais log l'erreur
        // L'utilisateur recevra le compte des fichiers réussis
      }
    }

    // Invalider le cache des pages concernées
    revalidatePath('/admin/upload')
    revalidatePath('/gallery')
    revalidatePath(`/gallery/${galleryId}`)

    return {
      success: true,
      uploadedCount
    }

  } catch (error) {
    console.error('Upload action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload'
    }
  }
}

// Type de retour pour la suppression de galerie
interface DeleteGalleryResult {
  success: boolean
  error?: string
  deletedPhotosCount?: number
}

export async function deleteGallery(galleryId: string): Promise<DeleteGalleryResult> {
  try {
    // Vérifier l'authentification avec cookies
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      redirect('/login')
    }

    // Use admin client to bypass RLS for admin operations
    const supabase = createSupabaseAdminClient()

    console.log(`🗑️ Starting deletion of gallery ${galleryId}`)

    // 1. Récupérer toutes les photos de la galerie
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, original_s3_key, preview_s3_url')
      .eq('gallery_id', galleryId)

    if (photosError) {
      console.error('Error fetching photos:', photosError)
      return {
        success: false,
        error: 'Erreur lors de la récupération des photos: ' + photosError.message
      }
    }

    const photosCount = photos?.length || 0
    console.log(`📷 Found ${photosCount} photos to delete`)

    // 2. Supprimer les fichiers de stockage pour chaque photo
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          // Supprimer le fichier original
          if (photo.original_s3_key) {
            const { error: originalDeleteError } = await supabase.storage
              .from('originals')
              .remove([photo.original_s3_key])
            
            if (originalDeleteError) {
              console.warn(`Warning: Could not delete original file ${photo.original_s3_key}:`, originalDeleteError)
            }
          }

          // Supprimer le fichier preview (extraire le path de l'URL)
          if (photo.preview_s3_url) {
            try {
              const url = new URL(photo.preview_s3_url)
              const pathParts = url.pathname.split('/')
              const bucketIndex = pathParts.findIndex(part => part === 'web-previews')
              if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                const previewPath = pathParts.slice(bucketIndex + 1).join('/')
                
                const { error: previewDeleteError } = await supabase.storage
                  .from('web-previews')
                  .remove([previewPath])
                
                if (previewDeleteError) {
                  console.warn(`Warning: Could not delete preview file ${previewPath}:`, previewDeleteError)
                }
              }
            } catch (urlError) {
              console.warn(`Warning: Could not parse preview URL ${photo.preview_s3_url}:`, urlError)
            }
          }
        } catch (error) {
          console.warn(`Warning: Error deleting files for photo ${photo.id}:`, error)
        }
      }
    }

    // 3. Supprimer les enregistrements de photos de la base de données
    const { error: deletePhotosError } = await supabase
      .from('photos')
      .delete()
      .eq('gallery_id', galleryId)

    if (deletePhotosError) {
      console.error('Error deleting photos from database:', deletePhotosError)
      return {
        success: false,
        error: 'Erreur lors de la suppression des photos: ' + deletePhotosError.message
      }
    }

    // 4. Supprimer la galerie elle-même
    const { error: deleteGalleryError } = await supabase
      .from('galleries')
      .delete()
      .eq('id', galleryId)

    if (deleteGalleryError) {
      console.error('Error deleting gallery:', deleteGalleryError)
      return {
        success: false,
        error: 'Erreur lors de la suppression de la galerie: ' + deleteGalleryError.message
      }
    }

    console.log(`✅ Gallery ${galleryId} deleted successfully with ${photosCount} photos`)

    // Invalider le cache des pages concernées
    revalidatePath('/admin/upload')
    revalidatePath('/gallery')
    revalidatePath('/demo')

    return {
      success: true,
      deletedPhotosCount: photosCount
    }

  } catch (error) {
    console.error('Delete gallery action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la suppression'
    }
  }
} 