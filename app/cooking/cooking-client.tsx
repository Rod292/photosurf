"use client"

import dynamic from "next/dynamic"
import { FilterProvider } from "@/context/filter-context"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

// Utilisation de l'importation dynamique dans un composant client
const DynamicCookingContent = dynamic(() => import("@/components/cooking-content"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})

export default function CookingClient() {
  return (
    <FilterProvider>
      <div className="flex flex-col min-h-screen">
        <Header alwaysVisible />
        <DynamicCookingContent />
        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>
    </FilterProvider>
  )
}

