import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for server-side operations
export function createServiceRoleClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(30000) // 30 second timeout
          });
        }
      }
    }
  );
}

interface GenerateDownloadUrlOptions {
  originalS3Key: string;
  expiresIn?: number; // seconds, default 48 hours
}

/**
 * Generates a public download URL for an original photo
 * @param options - The options for generating the download URL
 * @returns The public URL and expiration date (now indefinite)
 */
export async function generateDownloadUrl({
  originalS3Key,
  expiresIn = 48 * 60 * 60 // 48 hours in seconds (kept for compatibility)
}: GenerateDownloadUrlOptions) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!originalS3Key) {
    throw new Error('originalS3Key is required');
  }
  
  // Generate a public URL for the original photo (bucket is now public)
  const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${originalS3Key}`;
  
  // Calculate expiration date (kept for compatibility, but URLs don't expire)
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
  
  return {
    downloadUrl,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Generates download URLs for multiple photos
 * @param originalS3Keys - Array of original photo storage keys
 * @param expiresIn - Expiration time in seconds (default 48 hours)
 * @returns Array of download URLs with photo IDs
 */
export async function generateBulkDownloadUrls(
  photos: Array<{ id: string; original_s3_key: string }>,
  expiresIn = 48 * 60 * 60
) {
  const downloadPromises = photos.map(async (photo) => {
    try {
      const { downloadUrl, expiresAt } = await generateDownloadUrl({
        originalS3Key: photo.original_s3_key,
        expiresIn
      });
      
      return {
        photoId: photo.id,
        downloadUrl,
        expiresAt
      };
    } catch (error) {
      console.error(`Failed to generate URL for photo ${photo.id}:`, error);
      throw error;
    }
  });
  
  return Promise.all(downloadPromises);
}

/**
 * Supprime les fichiers de stockage correspondants à une photo
 * @param originalS3Key - Clé du fichier original
 * @param previewS3Url - URL du fichier de prévisualisation
 * @returns Résultat de la suppression
 */
export async function deletePhotoFiles(originalS3Key: string, previewS3Url: string) {
  const supabase = createServiceRoleClient();
  const results = {
    originalDeleted: false,
    previewDeleted: false,
    errors: [] as string[]
  };
  
  try {
    // Supprimer le fichier original du bucket 'originals'
    if (originalS3Key) {
      const { error: originalError } = await supabase.storage
        .from('originals')
        .remove([originalS3Key]);
      
      if (originalError) {
        console.error('Erreur lors de la suppression du fichier original:', originalError);
        results.errors.push(`Erreur suppression original: ${originalError.message}`);
      } else {
        results.originalDeleted = true;
        console.log(`Fichier original supprimé: ${originalS3Key}`);
      }
    }
    
    // Extraire le nom du fichier de prévisualisation depuis l'URL
    if (previewS3Url) {
      // L'URL de prévisualisation est généralement quelque chose comme:
      // https://project.supabase.co/storage/v1/object/public/web-previews/filename.jpg
      const urlParts = previewS3Url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName && fileName !== '') {
        const { error: previewError } = await supabase.storage
          .from('web-previews')
          .remove([fileName]);
        
        if (previewError) {
          console.error('Erreur lors de la suppression du fichier de prévisualisation:', previewError);
          results.errors.push(`Erreur suppression preview: ${previewError.message}`);
        } else {
          results.previewDeleted = true;
          console.log(`Fichier de prévisualisation supprimé: ${fileName}`);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Erreur lors de la suppression des fichiers:', error);
    results.errors.push(`Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return results;
  }
}

/**
 * Supprime les fichiers de stockage pour plusieurs photos
 * @param photos - Array des photos avec leurs clés de stockage
 * @returns Résultats de suppression pour chaque photo
 */
export async function deleteBulkPhotoFiles(
  photos: Array<{ id: string; original_s3_key: string; preview_s3_url: string; filename: string }>
) {
  const results = [];
  
  for (const photo of photos) {
    console.log(`Suppression des fichiers pour la photo: ${photo.filename}`);
    
    const deleteResult = await deletePhotoFiles(photo.original_s3_key, photo.preview_s3_url);
    
    results.push({
      photoId: photo.id,
      filename: photo.filename,
      ...deleteResult
    });
  }
  
  return results;
}