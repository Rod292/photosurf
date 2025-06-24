import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Ajouter des en-têtes de cache pour améliorer les performances
  const response = NextResponse.next()

  // Activer la compression
  response.headers.set("Content-Encoding", "br")

  // Définir des politiques de cache pour les ressources statiques
  const url = request.nextUrl.pathname

  if (url.includes("/images/") || url.includes(".jpg") || url.includes(".png") || url.includes(".webp")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else if (url.includes("/_next/static/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable")
  } else if (url.includes("/api/")) {
    response.headers.set("Cache-Control", "no-store")
  } else {
    response.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

