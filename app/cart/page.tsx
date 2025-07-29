"use client"

import { Header } from "@/components/header"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header alwaysVisible />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 mt-12 sm:mt-16">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-dm-sans-handgloves">Votre panier</h1>
        <CartContent />
      </main>
    </div>
  )
}

