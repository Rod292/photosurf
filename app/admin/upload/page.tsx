import { Suspense } from 'react'
import { UploadPageContent } from './upload-page-content'
import { Loader2 } from 'lucide-react'
import { fetchSurfSchools, fetchGalleries } from './actions'
import { redirect } from 'next/navigation'

export default async function AdminUploadPage() {
  // Double-check authentication at page level using cookie
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const adminSession = cookieStore.get('admin-session')
  
  if (!adminSession || adminSession.value !== 'authenticated') {
    console.log('[Upload Page] No admin session, redirecting to login')
    redirect('/login?redirect=/admin/upload')
  }
  
  console.log('[Upload Page] Admin authenticated via cookie')
  
  const [surfSchools, galleries] = await Promise.all([
    fetchSurfSchools(),
    fetchGalleries()
  ])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Upload de Photos</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Téléchargez vos photos originales et leurs versions avec watermark dans une galerie existante ou créez-en une nouvelle.
          </p>
          {surfSchools.length === 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ Aucune école de surf trouvée. Veuillez d'abord ajouter des écoles de surf dans la base de données.
              </p>
            </div>
          )}
          {galleries.length === 0 && surfSchools.length > 0 && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
              <p className="text-emerald-800 text-sm font-medium">
                Aucune galerie trouvée. Vous pouvez créer votre première galerie en sélectionnant "Créer une nouvelle galerie" ci-dessous.
              </p>
            </div>
          )}
      </div>
        
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          }
        >
          <UploadPageContent initialSurfSchools={surfSchools} initialGalleries={galleries} />
        </Suspense>
      </div>
    </div>
  )
} 