import { resend } from '@/lib/resend';
import { generateBulkDownloadUrls } from '@/lib/storage';
import { createServiceRoleClient } from '@/lib/storage';
import { OrderConfirmationWithDownloadsEmail } from '@/utils/email-templates/OrderConfirmationWithDownloadsEmail';
import { SimpleOrderConfirmationEmail } from '@/utils/email-templates/SimpleOrderConfirmationEmail';
import { generatePlainTextEmail } from '@/lib/email-utils';
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
    console.log('🔄 Starting order fulfillment for:', orderId)
    const supabase = createServiceRoleClient();
    
    // 1. Fetch order items with photo details
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        photo_id,
        product_type,
        price,
        delivery_option,
        delivery_price
      `)
      .eq('order_id', orderId);
      
    if (orderItemsError) {
      throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
    }
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items found');
    }
    
    // 2. Separate digital and print items
    const digitalItems = orderItems.filter(item => item.product_type === 'digital');
    const printItems = orderItems.filter(item => item.product_type !== 'digital');
    
    // Check if we have items to process
    if (digitalItems.length === 0 && printItems.length === 0) {
      console.log('No items to fulfill for order:', orderId);
      return { success: true, message: 'No items to fulfill' };
    }
    
    // Handle print items that require pickup notification
    const pickupItems = printItems.filter(item => item.delivery_option === 'pickup');
    if (pickupItems.length > 0) {
      // Send pickup notification email
      try {
        await resend.emails.send({
          from: 'Arode Studio <contact@arodestudio.com>',
          to: customerEmail,
          subject: '📦 Commande de tirages - Récupération à organiser',
          text: `Bonjour,\n\nVotre commande de tirages photo est confirmée !\n\nNous vous recontacterons prochainement pour organiser un rendez-vous de récupération à La Torche Surf School.\n\nCordialement,\nL'équipe Arode Studio`
        });
        
        // Send internal notification
        await resend.emails.send({
          from: 'Arode Studio <contact@arodestudio.com>',
          to: 'contact@arodestudio.com',
          subject: '🏄‍♂️ Nouveau rendez-vous à organiser',
          text: `Nouveau client à recontacter pour récupération :\n\nEmail: ${customerEmail}\nNom: ${customerName || 'Non renseigné'}\nNombre de tirages: ${pickupItems.length}\nMontant total: ${totalAmount / 100}€`
        });
      } catch (emailError) {
        console.error('Failed to send pickup notification:', emailError);
      }
    }
    
    // If no digital photos, we're done
    if (digitalItems.length === 0) {
      console.log('No digital photos to fulfill for order:', orderId);
      return { success: true, message: 'Print orders processed successfully' };
    }
    
    const digitalPhotoIds = digitalItems.map(item => item.photo_id);
    
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
    
    // 4. Generate download URLs for all digital photos (using public URLs)
    const downloadUrls = photos.map(photo => ({
      photoId: photo.id,
      downloadUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/originals/${photo.original_s3_key}`,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h from now
    }));
    
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
    
    // 6. Send email with download links
    let emailData: any = null;
    try {

      // Generate plain text version
      const plainTextContent = generatePlainTextEmail({
        customerEmail,
        orderItems: digitalItems.map(item => ({
          photo: { filename: `Photo ${item.photo_id}` },
          product_type: item.product_type,
          price: item.price / 100
        })),
        downloadLinks: emailDownloads.map(download => ({
          filename: `Photo ${download.photoId}`,
          downloadUrl: download.downloadUrl
        }))
      });

      const { data, error: emailError } = await resend.emails.send({
        from: 'Arode Studio <contact@arodestudio.com>',
        to: customerEmail,
        subject: '📸 Vos photos Arode Studio sont prêtes !',
        react: OrderConfirmationWithDownloadsEmail({
          customerName: customerName || customerEmail.split('@')[0],
          totalPrice: totalAmount / 100, // Convert cents to euros
          downloads: emailDownloads
        }),
        text: plainTextContent
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
        from: 'Arode Studio <contact@arodestudio.com>',
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
    
    // Handle specific connection errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNRESET') || error.message.includes('TLS connection')) {
        return {
          success: false,
          message: 'Database connection failed - will retry automatically'
        };
      }
      
      if (error.message.includes('fetch failed')) {
        return {
          success: false,
          message: 'Network connection failed - will retry automatically'
        };
      }
    }
    
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