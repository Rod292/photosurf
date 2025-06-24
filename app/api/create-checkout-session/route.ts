import { NextResponse } from "next/server"
import { createCheckoutSession, type CheckoutItem } from "@/utils/stripe"

export async function POST(req: Request) {
  // Simulation d'un achat réussi
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  return NextResponse.json({ url: `${baseUrl}/success` })
}

