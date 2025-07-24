import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
})

// Product types and their prices (in cents)
export const PRODUCT_PRICES = {
  digital: 1500, // 15€
  print: 2500,   // 25€
  bundle: 3500,  // 35€ (digital + print)
} as const

export type ProductType = keyof typeof PRODUCT_PRICES

// Create or retrieve Stripe products for photos
export async function createStripeProduct(
  photoId: string,
  productType: ProductType,
  photoName: string,
  originalS3Key?: string,
  previewS3Url?: string
): Promise<Stripe.Product> {
  try {
    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: `metadata['photo_id']:'${photoId}' AND metadata['product_type']:'${productType}'`,
    })

    if (existingProducts.data.length > 0) {
      return existingProducts.data[0]
    }

    // Create new product
    const product = await stripe.products.create({
      name: `${getProductTypeName(productType)} - ${photoName}`,
      description: getProductDescription(productType),
      metadata: {
        photo_id: photoId,
        product_type: productType,
        original_s3_key: originalS3Key || '',
        preview_s3_url: previewS3Url || '',
      },
      images: [], // You could add the photo preview URL here
    })

    // Create price for the product
    await stripe.prices.create({
      product: product.id,
      unit_amount: PRODUCT_PRICES[productType],
      currency: 'eur',
      metadata: {
        photo_id: photoId,
        product_type: productType,
        original_s3_key: originalS3Key || '',
        preview_s3_url: previewS3Url || '',
      },
    })

    return product
  } catch (error) {
    console.error('Error creating Stripe product:', error)
    throw error
  }
}

// Get all prices for a product
export async function getProductPrices(productId: string): Promise<Stripe.Price[]> {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    })
    return prices.data
  } catch (error) {
    console.error('Error fetching product prices:', error)
    throw error
  }
}

// Create checkout session
export async function createCheckoutSession(
  lineItems: Array<{
    photoId: string
    productType: ProductType
    photoName: string
    quantity?: number
    originalS3Key?: string
    previewS3Url?: string
  }>,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string,
  promoValidation?: any
): Promise<Stripe.Checkout.Session> {
  try {
    // Check if order is too large
    if (lineItems.length > 100) {
      throw new Error(`Order contains ${lineItems.length} items, which exceeds Stripe's limit of 100 line items per checkout session.`)
    }

    // Process line items in batches to avoid rate limits
    const stripeLineItems: Array<{ price: string; quantity: number }> = []
    const batchSize = 10
    
    for (let i = 0; i < lineItems.length; i += batchSize) {
      const batch = lineItems.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const product = await createStripeProduct(
            item.photoId,
            item.productType,
            item.photoName,
            item.originalS3Key,
            item.previewS3Url
          )
          
          const prices = await getProductPrices(product.id)
          if (prices.length === 0) {
            throw new Error(`No prices found for product ${product.id}`)
          }

          return {
            price: prices[0].id,
            quantity: item.quantity || 1,
          }
        })
      )
      
      stripeLineItems.push(...batchResults)
    }

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/gallery`,
      metadata: {
        source: 'arode_studio_photos',
      },
      // Collect customer information
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'ES', 'IT', 'DE', 'NL'],
      },
      // Enable automatic tax calculation if configured
      automatic_tax: {
        enabled: false, // Set to true if you have tax settings configured in Stripe
      },
      // Enable promotion codes on Stripe checkout page
      allow_promotion_codes: true,
    }

    // Add discount if promo code is valid
    if (promoValidation?.valid && promoValidation.discount > 0) {
      // Create a coupon for the discount
      const coupon = await stripe.coupons.create({
        percent_off: promoValidation.discount,
        duration: 'once',
        name: `Réduction ${promoValidation.discount}%`,
      })

      sessionData.discounts = [{
        coupon: coupon.id,
      }]

      // Add promo code to metadata
      sessionData.metadata!.promo_code = promoValidation.code || 'unknown'
      sessionData.metadata!.discount_amount = promoValidation.discountAmount.toString()
    }

    console.log(`📦 Creating Stripe checkout session with ${stripeLineItems.length} line items`)
    
    const session = await stripe.checkout.sessions.create(sessionData)
    
    console.log(`✅ Stripe checkout session created successfully: ${session.id}`)

    return session
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Add more context to the error
    if (error instanceof Error) {
      if (error.message.includes('line_items')) {
        throw new Error(`Too many items in order (${lineItems.length}). Please reduce the number of items.`)
      }
      if (error.message.includes('metadata')) {
        throw new Error('Order data too large. Please contact support.')
      }
    }
    
    throw error
  }
}

// Helper functions
function getProductTypeName(productType: ProductType): string {
  switch (productType) {
    case 'digital':
      return 'Photo Numérique'
    case 'print':
      return 'Tirage Photo'
    case 'bundle':
      return 'Pack Complet (Numérique + Tirage)'
    default:
      return 'Photo'
  }
}

function getProductDescription(productType: ProductType): string {
  switch (productType) {
    case 'digital':
      return 'Photo haute résolution en téléchargement numérique. Formats disponibles: JPG haute qualité.'
    case 'print':
      return 'Tirage photo professionnel sur papier de qualité premium. Livraison incluse.'
    case 'bundle':
      return 'Pack complet incluant la photo numérique haute résolution et le tirage professionnel avec livraison.'
    default:
      return 'Photo de surf professionnelle prise sur le spot de La Torche.'
  }
}

// Verify webhook signature (used in webhook route)
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, secret)
}