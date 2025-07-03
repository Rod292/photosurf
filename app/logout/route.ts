import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/', `${protocol}://${host}`))
}