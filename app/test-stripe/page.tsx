"use client"

import { useState } from "react"
import { getStripe } from "@/lib/stripe-client"
import { Button } from "@/components/ui/button"

export default function TestStripePage() {
  const [status, setStatus] = useState<string>("Not tested")

  const testStripe = async () => {
    setStatus("Testing...")
    try {
      const stripe = await getStripe()
      if (stripe) {
        setStatus("Stripe loaded successfully")
      } else {
        setStatus("Failed to load Stripe")
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Stripe Loading</h1>
        <Button onClick={testStripe}>Test Stripe</Button>
        <p className="mt-4">Status: {status}</p>
      </div>
    </div>
  )
}

