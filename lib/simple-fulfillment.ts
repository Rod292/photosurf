import { resend } from '@/lib/resend';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';

/**
 * Generates and validates a download URL for a photo, with fallback mechanisms
 * for legacy photo paths and missing files
 */
async function generateValidDownloadUrl(photo: { id: string; original_s3_key: string }): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  // List of possible URL patterns to try
  const urlCandidates = [
    // Current format: gallery-based path
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
    // Legacy format: UUID only
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpg`,
    // Alternative legacy format
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.id}.jpeg`,
  ];

  // Test each URL candidate
  for (const url of urlCandidates) {
    try {
      console.log(`🔍 Testing download URL: ${url}`);
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Valid download URL found: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ URL test failed for ${url}:`, error);
    }
  }

  console.error(`❌ No valid download URL found for photo ${photo.id}`);
  return null;
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
    
    // Générer et valider les liens de téléchargement
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const downloadLinks = [];
    
    for (const photo of orderData.photos) {
      try {
        const downloadUrl = await generateValidDownloadUrl(photo);
        if (downloadUrl) {
          downloadLinks.push({
            photoId: photo.id,
            downloadUrl,
            thumbnailUrl: photo.preview_s3_url,
            expiresAt: expirationDate.toISOString()
          });
        } else {
          console.warn(`⚠️ Could not generate valid download URL for photo ${photo.id} in simple fulfillment`);
        }
      } catch (error) {
        console.error(`❌ Error generating download URL for photo ${photo.id} in simple fulfillment:`, error);
      }
    }

    if (downloadLinks.length === 0) {
      throw new Error('No valid download URLs could be generated for any photos');
    }

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