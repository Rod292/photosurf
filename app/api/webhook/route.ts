import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import { sendOrderConfirmationEmail } from "@/utils/email"
import { AdminNotificationEmail } from "@/utils/email-templates/AdminNotificationEmail"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable")
}

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable")
}

const resend = new Resend(process.env.RESEND_API_KEY)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  console.log("Webhook received")
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature") as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
      console.log("Event constructed successfully:", event.type)
    } catch (err) {
      console.error("Error verifying webhook signature:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event")
      const session = event.data.object as Stripe.Checkout.Session

      console.log("Session metadata:", session.metadata)

      const customerEmail = session.customer_details?.email
      const customerName = session.customer_details?.name || "Client"
      const totalPrice = session.amount_total ? session.amount_total / 100 : 0

      if (!customerEmail) {
        console.error("No customer email found in session")
        return NextResponse.json({ error: "No customer email" }, { status: 400 })
      }

      // Extract order items from metadata
      const metadata = session.metadata || {}
      const orderItems: string[] = []

      // Get the total number of items
      const totalItems = Number.parseInt(metadata.total_items || "0", 10)

      // Extract each item's metadata
      for (let i = 1; i <= totalItems; i++) {
        const itemKey = `item_${i}`
        if (metadata[itemKey]) {
          console.log(`Processing item ${i}:`, metadata[itemKey])
          orderItems.push(metadata[itemKey])
        }
      }

      console.log("Extracted order items:", orderItems)

      // Send admin notification email first
      console.log("Sending admin notification email")
      const adminEmailResult = await resend.emails.send({
        from: "Arode Studio <contact@arodestudio.com>",
        to: "arodestudio@gmail.com",
        subject: "Nouvelle commande Arode Studio",
        react: AdminNotificationEmail({
          customerEmail,
          customerName,
          totalPrice,
          orderItems,
        }),
      })
      console.log("Admin email result:", adminEmailResult)

      // Then send customer confirmation email
      console.log("Sending customer confirmation email")
      const photoIds = orderItems.map((item) => item.split("|")[0])
      const customerEmailResult = await sendOrderConfirmationEmail(customerEmail, customerName, totalPrice, photoIds)
      console.log("Customer email result:", customerEmailResult)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

