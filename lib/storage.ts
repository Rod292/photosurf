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
      }
    }
  );
}

interface GenerateDownloadUrlOptions {
  originalS3Key: string;
  expiresIn?: number; // seconds, default 48 hours
}

/**
 * Generates a time-limited download URL for an original photo
 * @param options - The options for generating the download URL
 * @returns The signed URL and expiration date
 */
export async function generateDownloadUrl({
  originalS3Key,
  expiresIn = 48 * 60 * 60 // 48 hours in seconds
}: GenerateDownloadUrlOptions) {
  const supabase = createServiceRoleClient();
  
  // Generate a signed URL for the original photo
  const { data, error } = await supabase.storage
    .from('originals')
    .createSignedUrl(originalS3Key, expiresIn);
    
  if (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
  
  if (!data?.signedUrl) {
    throw new Error('No signed URL returned');
  }
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
  
  return {
    downloadUrl: data.signedUrl,
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