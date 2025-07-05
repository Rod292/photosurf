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
  photoName: string
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
  }>,
  customerEmail?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<Stripe.Checkout.Session> {
  try {
    const stripeLineItems = await Promise.all(
      lineItems.map(async (item) => {
        const product = await createStripeProduct(
          item.photoId,
          item.productType,
          item.photoName
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

    const session = await stripe.checkout.sessions.create({
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
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
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