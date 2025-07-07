'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const redirect_to = formData.get('redirect') as string
  
  console.log('[Login Action] Password attempt, redirect_to:', redirect_to)
  
  // Vérifier le mot de passe
  if (password !== 'edorastudio29') {
    return redirect('/login?message=Mot de passe incorrect')
  }

  // Créer une session simple côté serveur
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  // Ajouter un cookie de session avec SameSite=Lax pour permettre les redirections
  cookieStore.set('admin-session', 'authenticated', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 // 7 jours (604800 secondes)
  })
  
  console.log('[Login Action] Login successful, redirecting to:', redirect_to || '/demo')
  
  // Rediriger vers la page demandée ou vers demo par défaut
  return redirect(redirect_to || '/demo')
} 