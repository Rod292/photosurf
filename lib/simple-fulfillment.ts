import { resend } from '@/lib/resend';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';

/**
 * Generates a download URL for a photo using the most likely pattern
 * Validation is done at download time to avoid webhook timeouts
 */
function generateDownloadUrl(photo: { id: string; original_s3_key: string }): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // Use the original_s3_key first (most likely to work)
  if (photo.original_s3_key && photo.original_s3_key !== `${photo.id}.jpg`) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`;
  }
  
  // Fallback to UUID pattern for legacy photos
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`;
}

interface SimpleOrderData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  totalAmount: number;
  photos: Array<{
    id: string;
    original_s3_key: string;
    preview_s3_url: string;
  }>;
}

/**
 * Fulfillment simple qui utilise directement les URLs publiques
 * Évite les connexions Supabase complexes
 */
export async function simpleFulfillOrder(orderData: SimpleOrderData) {
  try {
    console.log('🔄 Starting simple fulfillment for order:', orderData.orderId);
    
    // Générer les liens de téléchargement (validation différée)
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const downloadLinks = orderData.photos.map(photo => ({
      photoId: photo.id,
      downloadUrl: generateDownloadUrl(photo),
      thumbnailUrl: photo.preview_s3_url,
      expiresAt: expirationDate.toISOString()
    }));

    // Générer le token pour le téléchargement ZIP
    const zipToken = Buffer.from(`${orderData.orderId}:${expirationDate.getTime()}`).toString('base64')
    const zipDownloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arodestudio.com'}/api/download-order-zip/${zipToken}`
    
    console.log('📦 Generated ZIP download URL for order:', orderData.orderId);

    console.log('📧 Generated download links:', downloadLinks.map(l => ({ id: l.photoId, url: l.downloadUrl })));

    // Préparer les données pour l'email (utiliser les originales aussi pour les thumbnails)
    const emailDownloads = downloadLinks.map(download => ({
      photoId: download.photoId,
      downloadUrl: download.downloadUrl,
      thumbnailUrl: download.downloadUrl, // Utiliser l'original pour le thumbnail aussi
      expiresAt: download.expiresAt
    }));

    // Envoyer l'email avec template et version texte
    const plainTextContent = `Bonjour ${orderData.customerName || orderData.customerEmail.split('@')[0]},

Merci pour votre commande ! Vos photos en haute résolution sont maintenant disponibles au téléchargement.

Vos liens de téléchargement (${downloadLinks.length} photos) :
${downloadLinks.map((link, index) => `${index + 1}. Photo ${index + 1}: ${link.downloadUrl}`).join('\n')}

⚠️ Important: Ces liens sont valides pendant 7 jours.

Pour toute question, n'hésitez pas à nous contacter à contact@arodestudio.com

Merci de votre confiance,
L'équipe Arode Studio
La Torche, Bretagne
https://www.arodestudio.com`;

    console.log('📧 [Simple] Attempting to send email to:', orderData.customerEmail);
    console.log('📧 [Simple] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
    console.log('📧 [Simple] Number of photos:', emailDownloads.length);

    const { data, error } = await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: orderData.customerEmail,
      subject: '📸 Vos photos Arode Studio sont prêtes !',
      react: OrderConfirmationWithDownloadsEmail({
        customerName: orderData.customerName || orderData.customerEmail.split('@')[0],
        totalPrice: orderData.totalAmount / 100,
        downloads: emailDownloads,
        zipDownloadUrl: zipDownloadUrl
      }),
      text: plainTextContent
    });

    if (error) {
      console.error('❌ [Simple] Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log('✅ [Simple] Email sent successfully:', data?.id);

    console.log('✅ Simple fulfillment successful for order:', orderData.orderId);
    
    // Générer le ZIP en arrière-plan (ne pas attendre)
    generateZipInBackground(orderData.orderId, orderData.photos).catch(error => {
      console.error('❌ Background ZIP generation failed:', error)
    })
    
    return {
      success: true,
      message: 'Order fulfilled successfully',
      emailId: data?.id
    };
    
  } catch (error) {
    console.error('❌ Simple fulfillment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Fonction pour générer le ZIP en arrière-plan
async function generateZipInBackground(orderId: string, photos: Array<{ id: string; original_s3_key: string; preview_s3_url: string }>) {
  try {
    console.log('🔄 Starting background ZIP generation for order:', orderId)
    
    const JSZip = (await import('jszip')).default
    const { createSupabaseAdminClient } = await import('@/lib/supabase/server')
    
    const zip = new JSZip()
    
    // Télécharger toutes les photos (sans timeout - c'est en arrière-plan)
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      
      try {
        const urlCandidates = [
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`,
        ]

        let response: Response | null = null
        
        for (const url of urlCandidates) {
          try {
            response = await fetch(url)
            if (response.ok) break
          } catch (error) {
            console.log(`❌ URL failed: ${url}`)
          }
        }
        
        if (!response || !response.ok) {
          console.error(`❌ Failed to download photo ${i + 1}`)
          continue
        }

        const photoBuffer = await response.arrayBuffer()
        const filename = `Photo_${String(i + 1).padStart(2, '0')}_${photo.id}.jpg`
        
        zip.file(filename, photoBuffer)
        console.log(`✅ Added photo ${i + 1}/${photos.length} to ZIP`)
        
      } catch (error) {
        console.error(`❌ Error processing photo ${i + 1}:`, error)
      }
    }

    // Générer le ZIP
    console.log('🔄 Generating ZIP buffer...')
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'STORE',
      compressionOptions: { level: 0 }
    })
    
    // Uploader le ZIP vers Supabase Storage 
    const supabase = createSupabaseAdminClient()
    const zipFileName = `order-${orderId}-${Date.now()}.zip`
    
    // Créer le bucket s'il n'existe pas
    try {
      await supabase.storage.createBucket('temp-zips', {
        public: false,
        allowedMimeTypes: ['application/zip'],
        fileSizeLimit: 500 * 1024 * 1024 // 500MB max
      })
    } catch (bucketError) {
      // Le bucket existe probablement déjà, continuer
      console.log('ℹ️ Bucket temp-zips already exists or creation failed (continuing)')
    }
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('temp-zips')
      .upload(zipFileName, zipBuffer, {
        contentType: 'application/zip',
        cacheControl: '3600', // 1 heure de cache
      })
    
    if (uploadError) {
      console.error('❌ Failed to upload ZIP:', uploadError)
      return
    }
    
    console.log('✅ ZIP generated and uploaded successfully:', zipFileName)
    
  } catch (error) {
    console.error('❌ Background ZIP generation failed:', error)
  }
}