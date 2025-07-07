import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  // Supprimer le cookie de session
  cookieStore.delete('admin-session')
  
  console.log('[Logout] Admin session cleared')
  
  return NextResponse.redirect(new URL('/login', `${protocol}://${host}`))
}