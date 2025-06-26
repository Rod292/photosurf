'use server'

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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
    // Vérifier l'authentification
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      redirect('/login')
    }

    // Client admin pour les opérations de base de données
    const adminSupabase = createSupabaseAdminClient()

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
    const { data: surfSchool, error: schoolError } = await adminSupabase
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
      const { data: newGallery, error: galleryError } = await adminSupabase
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
      const { data: existingGallery, error: galleryCheckError } = await adminSupabase
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
        const { data: originalUpload, error: originalError } = await adminSupabase.storage
          .from('originals')
          .upload(`gallery-${galleryId}/${originalFileName}`, originalBuffer, {
            contentType: originalFile.type,
            upsert: false
          })

        if (originalError) {
          throw new Error(`Erreur upload original ${originalFile.name}: ${originalError.message}`)
        }

        // Upload de l'image preview vers Supabase Storage (bucket public)
        const { data: previewUpload, error: previewError } = await adminSupabase.storage
          .from('web-previews')
          .upload(`gallery-${galleryId}/${previewFileName}`, previewBuffer, {
            contentType: previewFile.type,
            upsert: false
          })

        if (previewError) {
          // Si preview échoue, nettoyer l'original déjà uploadé
          await adminSupabase.storage
            .from('originals')
            .remove([originalUpload.path])
          throw new Error(`Erreur upload preview ${previewFile.name}: ${previewError.message}`)
        }

        // Obtenir l'URL publique de la preview
        const { data: previewUrl } = adminSupabase.storage
          .from('web-previews')
          .getPublicUrl(previewUpload.path)

        // Enregistrer les métadonnées dans Supabase (utiliser les noms de colonnes du schéma existant)
        const { error: photoError } = await adminSupabase
          .from('photos')
          .insert({
            gallery_id: galleryId,
            original_s3_key: originalUpload.path,
            preview_s3_url: previewUrl.publicUrl,
            filename: originalFile.name,
            filesize: originalFile.size,
            content_type: originalFile.type,
          })

        if (photoError) {
          console.error('Photo metadata save error:', photoError)
          // Nettoyer les fichiers uploadés si l'insertion DB échoue
          await Promise.all([
            adminSupabase.storage.from('originals').remove([originalUpload.path]),
            adminSupabase.storage.from('web-previews').remove([previewUpload.path])
          ])
          throw new Error(`Erreur lors de la sauvegarde des métadonnées pour ${originalFile.name}`)
        }

        uploadedCount++
      } catch (error) {
        console.error(`Error processing file pair ${i}:`, error)
        // Continue avec les autres fichiers mais log l'erreur
        // L'utilisateur recevra le compte des fichiers réussis
      }
    }

    // Invalider le cache de la page admin
    revalidatePath('/admin/upload')

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