'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirect_to = formData.get('redirect') as string
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    return redirect('/login?message=Could not authenticate user')
  }

  // Rediriger vers la page demandée ou vers admin par défaut
  const redirectPath = redirect_to || '/admin/upload'
  return redirect(redirectPath)
} 