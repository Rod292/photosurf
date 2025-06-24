import { Resend } from "resend"
import { OrderConfirmationEmail } from "./email-templates/OrderConfirmationEmail"

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable")
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  totalPrice: number,
  photoIds: string[],
) {
  console.log(`Attempting to send confirmation email to customer: ${customerEmail}`)
  try {
    console.log("Preparing email content...")
    const emailContent = OrderConfirmationEmail({ customerName, totalPrice, photoIds })
    console.log("Email content prepared successfully")

    console.log("Sending email via Resend...")
    const result = await resend.emails.send({
      from: "Arode. Studio <contact@arodestudio.com>",
      to: [customerEmail],
      subject: "Confirmation de commande - Arode Studio",
      react: emailContent,
    })
    console.log("Resend API response:", JSON.stringify(result, null, 2))

    if (result.id) {
      console.log(`Confirmation email sent successfully. Email ID: ${result.id}`)
    } else {
      console.error("Unexpected response from Resend API:", result)
    }

    return result
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    }
    throw error
  }
}

