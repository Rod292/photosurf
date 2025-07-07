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

  // Authentifier avec Supabase en utilisant un compte admin fixe
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin@arodestudio.com',
    password: 'edorastudio29',
  })

  if (error) {
    console.error('Login error:', error.message)
    return redirect('/login?message=Erreur d\'authentification')
  }

  // Rediriger vers la page demandée ou vers admin par défaut
  const redirectPath = redirect_to || '/admin/upload'
  return redirect(redirectPath)
} 