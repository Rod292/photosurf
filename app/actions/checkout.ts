'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { CartItem as NewCartItem } from '@/contexts/CartContext';
import { CartItem as ZustandCartItem } from '@/context/cart-context';
import { createServiceRoleClient } from '@/lib/storage';
import { calculateDynamicPricing } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function createCheckoutSession(items: ZustandCartItem[] | NewCartItem[], promoCode?: string): Promise<{url?: string, error?: string, isFree?: boolean}> {
  try {
    if (!items || items.length === 0) {
      return { error: 'Panier vide' };
    }

    // Check if order is too large for Stripe
    if (items.length > 100) {
      return { 
        error: `Votre commande contient ${items.length} photos, ce qui dépasse la limite de 100 articles par commande. Veuillez diviser votre commande en plusieurs parties.` 
      };
    }

    const supabase = createServiceRoleClient();
    
    // Create Stripe products and prices for each cart item
    const lineItems = [];
    
    // Process items in batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (item) => {
        try {
          // Detect item type and normalize data
          const isZustandItem = 'photo_id' in item;
          
          let productName: string;
          let productDescription: string;
          let imageUrl: string;
          let photoId: string;
          let productType: string;
          let priceInCents: number;
          let quantity: number;
          let galleryId: string;
          
          if (isZustandItem) {
            // Zustand cart item
            const zustandItem = item as ZustandCartItem;
            productName = `Photo ${zustandItem.product_type === 'digital' ? 'Numérique' : 
                                  zustandItem.product_type === 'session_pack' ? 'Pack Session' :
                                  zustandItem.product_type === 'print_a5' ? 'Tirage A5' :
                                  zustandItem.product_type === 'print_a4' ? 'Tirage A4' :
                                  zustandItem.product_type === 'print_a3' ? 'Tirage A3' :
                                  zustandItem.product_type === 'print_a2' ? 'Tirage A2' : 'Tirage'}`;
            productDescription = `Photo: ${zustandItem.filename}`;
            imageUrl = zustandItem.preview_url;
            photoId = zustandItem.photo_id;
            productType = zustandItem.product_type;
            priceInCents = Math.round((zustandItem.price + (zustandItem.delivery_price || 0)) * 100); // Convert euros to cents and include delivery
            quantity = 1; // Zustand doesn't have quantity
            galleryId = ''; // We'll need to fetch this from the database
          } else {
            // New React Context cart item
            const newItem = item as NewCartItem;
            productName = `Photo ${newItem.productType === 'digital' ? 'Numérique' : 'Tirage'}`;
            productDescription = `Photo: ${newItem.photo.filename}`;
            imageUrl = newItem.photo.preview_s3_url;
            photoId = newItem.photo.id;
            productType = newItem.productType;
            priceInCents = newItem.price; // Already in cents
            quantity = newItem.quantity;
            galleryId = newItem.photo.gallery_id;
          }
          
          // Get original_s3_key from the photo data
          let originalS3Key = '';
          let previewS3Url = '';
          
          if (isZustandItem) {
            // For zustand items, we need to fetch the photo data from database
            const zustandItem = item as ZustandCartItem;
            try {
              const { data: photo } = await supabase
                .from('photos')
                .select('original_s3_key, preview_s3_url')
                .eq('id', zustandItem.photo_id)
                .single();
              
              originalS3Key = photo?.original_s3_key || zustandItem.photo_id + '.jpg';
              previewS3Url = photo?.preview_s3_url || imageUrl;
            } catch (error) {
              console.error('Error fetching photo data:', error);
              originalS3Key = zustandItem.photo_id + '.jpg';
              previewS3Url = imageUrl;
            }
          } else {
            // For new cart items, we have the photo data
            const newItem = item as NewCartItem;
            originalS3Key = newItem.photo.original_s3_key || newItem.photo.id + '.jpg';
            previewS3Url = newItem.photo.preview_s3_url;
          }

          // For session_pack, handle differently since it doesn't represent a single photo
          const isSessionPack = productType === 'session_pack';
          
          const product = await stripe.products.create({
            name: productName,
            description: productDescription,
            images: isSessionPack ? [] : [imageUrl],
            metadata: {
              photo_id: isSessionPack ? 'session_pack' : photoId,
              product_type: productType,
              gallery_id: galleryId,
              delivery_option: isZustandItem ? (item as ZustandCartItem).delivery_option || '' : '',
              delivery_price: isZustandItem ? ((item as ZustandCartItem).delivery_price || 0).toString() : '0',
              original_s3_key: isSessionPack ? 'session_pack' : originalS3Key,
              preview_s3_url: isSessionPack ? 'session_pack' : previewS3Url,
            },
          });

          // Create price for the product
          const price = await stripe.prices.create({
            currency: 'eur',
            unit_amount: priceInCents,
            product: product.id,
          });

          return {
            price: price.id,
            quantity: quantity,
          };
        } catch (error) {
          console.error('Error creating product for item:', item, error);
          throw error;
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      lineItems.push(...batchResults);
    }

    // Validate promo code if provided
    let promoValidation = null;
    if (promoCode) {
      const totalAmount = items.reduce((sum, item) => {
        const isZustandItem = 'photo_id' in item;
        const price = isZustandItem ? (item as ZustandCartItem).price : (item as NewCartItem).price / 100;
        const quantity = isZustandItem ? 1 : (item as NewCartItem).quantity;
        return sum + (price * quantity);
      }, 0);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const promoResponse = await fetch(`${baseUrl}/api/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, totalAmount })
      });

      if (promoResponse.ok) {
        promoValidation = await promoResponse.json();
      }
    }

    // If promo code makes the order free, create a free order directly
    if (promoValidation?.isFree) {
      // Create order in database with "completed" status for free orders
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: 'demo@arodestudio.com',
          stripe_checkout_id: `free_${Date.now()}`,
          status: 'completed',
          total_amount: 0,
          payment_status: 'paid',
          promo_code: promoCode,
          discount_amount: promoValidation.discountAmount
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating free order:', orderError);
        return { error: 'Erreur lors de la création de la commande gratuite' };
      }

      // Create order items
      const orderItems = items.map(item => {
        const isZustandItem = 'photo_id' in item;
        if (isZustandItem) {
          const zustandItem = item as ZustandCartItem;
          return {
            order_id: order.id,
            photo_id: zustandItem.photo_id,
            product_type: zustandItem.product_type,
            price: 0,
            quantity: 1
          };
        } else {
          const newItem = item as NewCartItem;
          return {
            order_id: order.id,
            photo_id: newItem.photo.id,
            product_type: newItem.productType,
            price: 0,
            quantity: newItem.quantity
          };
        }
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating free order items:', itemsError);
        return { error: 'Erreur lors de la création des articles gratuits' };
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return { 
        url: `${baseUrl}/order/success?session_id=free_${order.id}&free_order=true`,
        isFree: true 
      };
    }

    // Create checkout session for paid orders
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Check if any items require shipping
    const requiresShipping = items.some(item => {
      const isZustandItem = 'photo_id' in item;
      if (isZustandItem) {
        const zustandItem = item as ZustandCartItem;
        return zustandItem.product_type !== 'digital' && zustandItem.delivery_option === 'delivery';
      }
      return false;
    });
    
    const sessionData: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/canceled`,
      customer_email: undefined, // Will be collected during checkout
      billing_address_collection: 'required',
      // Enable promotion codes on Stripe checkout page
      allow_promotion_codes: true,
      metadata: {
        cart_item_count: items.length.toString(),
        cart_total: items.reduce((sum, item) => {
          const isZustandItem = 'photo_id' in item;
          const price = isZustandItem ? (item as ZustandCartItem).price : (item as NewCartItem).price / 100;
          const quantity = isZustandItem ? 1 : (item as NewCartItem).quantity;
          return sum + (price * quantity);
        }, 0).toString(),
      },
    };

    // Only collect shipping address if delivery is required
    if (requiresShipping) {
      sessionData.shipping_address_collection = {
        allowed_countries: ['FR', 'BE', 'LU', 'CH', 'ES', 'DE', 'IT', 'NL', 'PT'],
      };
    }

    // Add discount if promo code is valid but not free
    if (promoValidation?.valid && promoValidation.discount > 0 && !promoValidation.isFree) {
      const coupon = await stripe.coupons.create({
        percent_off: promoValidation.discount,
        duration: 'once',
        name: `Réduction ${promoValidation.discount}%`,
      });

      sessionData.discounts = [{
        coupon: coupon.id,
      }];

      sessionData.metadata.promo_code = promoCode;
      sessionData.metadata.discount_amount = promoValidation.discountAmount.toString();
    }

    console.log(`📦 Creating checkout session with ${lineItems.length} line items`);
    
    const session = await stripe.checkout.sessions.create(sessionData);

    console.log(`✅ Checkout session created successfully: ${session.id}`);
    
    return { url: session.url || undefined };
    
  } catch (error) {
    console.error('❌ Checkout session creation error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('line_items')) {
        return { 
          error: `Erreur lors de la création de la session: trop d'articles (${items.length}). Veuillez réduire le nombre d'articles dans votre panier.` 
        };
      }
      if (error.message.includes('metadata')) {
        return { 
          error: 'Erreur lors de la création de la session: données trop volumineuses. Veuillez contacter le support.' 
        };
      }
      return { 
        error: `Erreur lors de la création de la session de paiement: ${error.message}` 
      };
    }
    
    return { 
      error: 'Une erreur inattendue est survenue lors de la création de la session de paiement. Veuillez réessayer.' 
    };
  }
}