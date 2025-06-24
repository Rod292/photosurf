import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export interface CheckoutItem {
  id: string
  title: string
  price: number
}

export async function createCheckoutSession(items: CheckoutItem[], totalPrice: number) {
  // Ensure we're using the correct domain format
  const baseUrl = "https://arodestudio.com"

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${items.length} photo${items.length > 1 ? "s" : ""} de surf`,
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
    metadata: {
      orderItems: JSON.stringify(items.map((item) => item.id)),
    },
    billing_address_collection: "auto",
    customer_email: undefined,
  })

  return session
}

