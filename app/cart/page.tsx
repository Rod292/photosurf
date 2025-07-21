"use client"

import { Header } from "@/components/header"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible />
      <main className="container mx-auto px-4 py-2 mt-16">
        <h1 className="text-3xl font-bold mb-8 font-dm-sans-handgloves">Votre panier</h1>
        <CartContent />
      </main>
    </div>
  )
}

