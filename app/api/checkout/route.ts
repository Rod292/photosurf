import { NextResponse } from "next/server"
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    console.log("Received checkout request")
    const { items, totalPrice } = await req.json()
    console.log("Request data:", { items, totalPrice })

    if (!items || !Array.isArray(items) || typeof totalPrice !== "number") {
      console.error("Invalid request data")
      return NextResponse.json(
        { error: "Invalid request data. Please provide items array and total price." },
        { status: 400 },
      )
    }

    // Create metadata for each item in a consistent format
    const itemsMetadata = items.map((item, index) => ({
      [`item_${index + 1}`]: `${item.id}|${item.price}|${item.surfer || ""}`,
    }))

    // Flatten the array of objects into a single metadata object
    const metadata = Object.assign({}, ...itemsMetadata, {
      total_items: items.length.toString(),
      original_total: totalPrice.toString(),
    })

    console.log("Creating Stripe checkout session with metadata:", metadata)

    // Ensure we're using the correct base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://arodestudio.com"

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${items.length} photo${items.length > 1 ? "s" : ""} de surf`,
              metadata: {
                type: "surf_photos",
                photo_count: items.length.toString(),
              },
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: metadata, // Add metadata to the session
      billing_address_collection: "required",
      submit_type: "pay",
      payment_intent_data: {
        metadata: metadata, // Also add metadata to the payment intent
      },
    })

    console.log("Stripe session created:", session.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error("Stripe API Error:", err)
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${err.message}` }, { status: err.statusCode || 500 })
    }
    return NextResponse.json({ error: "An unexpected error occurred while processing your request." }, { status: 500 })
  }
}

