'use server';

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { CartItem as NewCartItem } from '@/contexts/CartContext';
import { CartItem as ZustandCartItem } from '@/context/cart-context';
import { createServiceRoleClient } from '@/lib/storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function createCheckoutSession(items: ZustandCartItem[] | NewCartItem[]): Promise<{url?: string, error?: string}> {
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

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
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
    });

    return { url: session.url || undefined };
    
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur lors de la création de la session de paiement' 
    };
  }
}