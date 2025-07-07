'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { CartItem as NewCartItem } from '@/contexts/CartContext';
import { CartItem as ZustandCartItem } from '@/context/cart-context';
import { createServiceRoleClient } from '@/lib/storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function createCheckoutSession(items: ZustandCartItem[] | NewCartItem[], promoCode?: string): Promise<{url?: string, error?: string, isFree?: boolean}> {
  try {
    if (!items || items.length === 0) {
      return { error: 'Panier vide' };
    }

    const supabase = createServiceRoleClient();
    
    // Create Stripe products and prices for each cart item
    const lineItems = [];
    
    for (const item of items) {
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
                              zustandItem.product_type === 'print' ? 'Tirage' : 'Bundle'}`;
        productDescription = `Photo: ${zustandItem.filename}`;
        imageUrl = zustandItem.preview_url;
        photoId = zustandItem.photo_id;
        productType = zustandItem.product_type;
        priceInCents = Math.round(zustandItem.price * 100); // Convert euros to cents
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
      
      const product = await stripe.products.create({
        name: productName,
        description: productDescription,
        images: [imageUrl],
        metadata: {
          photo_id: photoId,
          product_type: productType,
          gallery_id: galleryId,
        },
      });

      // Create price for the product
      const price = await stripe.prices.create({
        currency: 'eur',
        unit_amount: priceInCents,
        product: product.id,
      });

      lineItems.push({
        price: price.id,
        quantity: quantity,
      });
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
    
    const sessionData: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/order/canceled`,
      customer_email: undefined, // Will be collected during checkout
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH', 'ES', 'DE', 'IT', 'NL', 'PT'],
      },
      metadata: {
        cart_items: JSON.stringify(items.map(item => {
          const isZustandItem = 'photo_id' in item;
          if (isZustandItem) {
            const zustandItem = item as ZustandCartItem;
            return {
              photo_id: zustandItem.photo_id,
              product_type: zustandItem.product_type,
              quantity: 1,
              price: Math.round(zustandItem.price * 100),
            };
          } else {
            const newItem = item as NewCartItem;
            return {
              photo_id: newItem.photo.id,
              product_type: newItem.productType,
              quantity: newItem.quantity,
              price: newItem.price,
            };
          }
        })),
      },
    };

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

    const session = await stripe.checkout.sessions.create(sessionData);

    return { url: session.url || undefined };
    
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur lors de la création de la session de paiement' 
    };
  }
}