'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const redirect_to = formData.get('redirect') as string
  
  // Vérifier le mot de passe
  if (password !== 'edorastudio29') {
    return redirect('/login?message=Mot de passe incorrect')
  }

  // Créer une session simple côté serveur
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  // Ajouter un cookie de session
  cookieStore.set('admin-session', 'authenticated', {
    path: '/',
    httpOnly: true,
    maxAge: 3600 // 1 heure
  })
  
  // Rediriger vers la page demandée ou vers demo par défaut
  return redirect(redirect_to || '/demo')
} 