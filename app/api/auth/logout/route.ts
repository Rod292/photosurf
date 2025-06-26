import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    
    // Créer l'URL de redirection basée sur l'origine de la requête
    const origin = request.nextUrl.origin
    return NextResponse.redirect(new URL('/', origin))
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la déconnexion' }, { status: 500 })
  }
} 