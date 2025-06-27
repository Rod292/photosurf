import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Administration - Arode Studio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que {user.email}
              </span>
              <form action="/api/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
} 