import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  // Only log for admin routes to reduce noise
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('[Middleware] Processing admin request for:', request.nextUrl.pathname);
  }
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Vérifier le cookie de session pour les routes admin et demo
  const adminSession = request.cookies.get('admin-session')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isDemoRoute = request.nextUrl.pathname.startsWith('/demo')
  
  // Protection des routes admin et demo
  if (isAdminRoute || isDemoRoute) {
    console.log('[Middleware] Protected route detected:', request.nextUrl.pathname);
    console.log('[Middleware] Admin session cookie:', adminSession?.value || 'NOT FOUND');
    console.log('[Middleware] All cookies:', request.cookies.getAll().map(c => c.name + '=' + c.value));
    
    // Si pas de session valide, rediriger vers login
    if (!adminSession || adminSession.value !== 'authenticated') {
      console.log('[Middleware] No valid session, redirecting to /login');
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      console.log('[Middleware] Login URL with redirect:', loginUrl.toString());
      return NextResponse.redirect(loginUrl)
    }
    
    console.log('[Middleware] Valid session found, allowing access');
    
    // Add cache prevention headers for admin routes
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // Ensure cookie is preserved in response
    if (adminSession) {
      response.cookies.set('admin-session', adminSession.value, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600
      })
    }
  }

  return response
}