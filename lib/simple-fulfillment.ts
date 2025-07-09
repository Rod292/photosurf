import { resend } from '@/lib/resend';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';

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
    
    // Générer les liens de téléchargement directement avec les URLs publiques
    const downloadLinks = orderData.photos.map(photo => ({
      photoId: photo.id,
      downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
      thumbnailUrl: photo.preview_s3_url,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h from now
    }));

    // Préparer les données pour l'email
    const emailDownloads = downloadLinks.map(download => ({
      photoId: download.photoId,
      downloadUrl: download.downloadUrl,
      thumbnailUrl: download.thumbnailUrl,
      expiresAt: download.expiresAt
    }));

    // Envoyer l'email
    const { data, error } = await resend.emails.send({
      from: 'Arode Studio <contact@arodestudio.com>',
      to: orderData.customerEmail,
      subject: '📸 Vos photos Arode Studio sont prêtes !',
      react: OrderConfirmationWithDownloadsEmail({
        customerName: orderData.customerName || orderData.customerEmail.split('@')[0],
        totalPrice: orderData.totalAmount / 100,
        downloads: emailDownloads
      })
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

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