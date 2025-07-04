import { resend } from '@/lib/resend';
import { generateBulkDownloadUrls } from '@/lib/storage';
import { createServiceRoleClient } from '@/lib/storage';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';
import { SimpleOrderConfirmationEmail } from '@/utils/email-templates/SimpleOrderConfirmationEmail';
import type { Order, OrderItem, Photo } from '@/lib/database.types';

interface FulfillOrderOptions {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  totalAmount: number;
}

/**
 * Fulfills an order by sending download links to the customer
 * @param options - The order fulfillment options
 * @returns Success status and any error message
 */
export async function fulfillOrder({
  orderId,
  customerEmail,
  customerName,
  totalAmount
}: FulfillOrderOptions) {
  try {
    const supabase = createServiceRoleClient();
    
    // 1. Fetch order items with photo details
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        photo_id,
        product_type,
        price
      `)
      .eq('order_id', orderId);
      
    if (orderItemsError) {
      throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
    }
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items found');
    }
    
    // 2. Filter digital photos and get photo IDs
    const digitalPhotoIds = orderItems
      .filter(item => item.product_type === 'digital')
      .map(item => item.photo_id);
      
    if (digitalPhotoIds.length === 0) {
      console.log('No digital photos to fulfill for order:', orderId);
      return { success: true, message: 'No digital photos to fulfill' };
    }
    
    // 3. Fetch photo details
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, original_s3_key, preview_s3_url')
      .in('id', digitalPhotoIds);
      
    if (photosError) {
      throw new Error(`Failed to fetch photos: ${photosError.message}`);
    }
    
    if (!photos || photos.length === 0) {
      throw new Error('No photos found for order items');
    }
    
    // 4. Generate download URLs for all digital photos
    const downloadUrls = await generateBulkDownloadUrls(photos);
    
    // 5. Prepare email data
    const emailDownloads = downloadUrls.map((download, index) => {
      const photo = photos.find(p => p.id === download.photoId);
      return {
        photoId: download.photoId,
        downloadUrl: download.downloadUrl,
        thumbnailUrl: photo?.preview_s3_url,
        expiresAt: download.expiresAt
      };
    });
    
    // 6. Generate real download URLs and send email with links
    let emailData: any = null;
    try {
      // Generate real signed URLs from Supabase
      const downloadUrls = await generateBulkDownloadUrls(photos);
      
      // Prepare email data with real download links
      const emailDownloads = downloadUrls.map((download, index) => {
        const photo = photos.find(p => p.id === download.photoId);
        return {
          photoId: download.photoId,
          downloadUrl: download.downloadUrl,
          thumbnailUrl: photo?.preview_s3_url,
          expiresAt: download.expiresAt
        };
      });

      const { data, error: emailError } = await resend.emails.send({
        from: 'Arode Studio <arodestudio@gmail.com>',
        to: customerEmail,
        subject: '📸 Vos photos Arode Studio sont prêtes !',
        react: OrderConfirmationWithDownloadsEmail({
          customerName: customerName || customerEmail.split('@')[0],
          totalPrice: totalAmount / 100, // Convert cents to euros
          downloads: emailDownloads
        })
      });
      
      emailData = data;
      
      if (emailError) {
        throw new Error(`Failed to send email: ${emailError.message}`);
      }
    } catch (downloadError) {
      console.error('Error generating download URLs:', downloadError);
      
      // Fallback: Send simple confirmation email
      const orderItems = photos.map((photo, index) => 
        `Photo ${index + 1} - Format numérique`
      );

      const { data, error: emailError } = await resend.emails.send({
        from: 'Arode Studio <arodestudio@gmail.com>',
        to: customerEmail,
        subject: '✅ Commande confirmée - Arode Studio',
        react: SimpleOrderConfirmationEmail({
          customerName: customerName || customerEmail.split('@')[0],
          totalPrice: totalAmount / 100, // Convert cents to euros
          orderItems: orderItems
        })
      });
      
      emailData = data;
      
      if (emailError) {
        throw new Error(`Failed to send fallback email: ${emailError.message}`);
      }
    }
    
    // 7. Update order status to indicate fulfillment
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Failed to update order status:', updateError);
      // Don't throw here as the email was already sent
    }
    
    console.log(`Order ${orderId} fulfilled successfully. Email sent to ${customerEmail}`);
    
    return {
      success: true,
      message: 'Order fulfilled successfully',
      emailId: emailData?.id
    };
    
  } catch (error) {
    console.error('Order fulfillment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Checks if an order has already been fulfilled
 * @param orderId - The order ID to check
 * @returns Whether the order has been fulfilled
 */
export async function isOrderFulfilled(orderId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();
    
  if (error) {
    console.error('Error checking order status:', error);
    return false;
  }
  
  return data?.status === 'fulfilled';
}