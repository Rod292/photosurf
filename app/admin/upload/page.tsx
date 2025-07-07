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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload de Photos</h1>
        <p className="text-gray-600">
          Téléchargez vos photos originales et leurs versions avec watermark dans une galerie existante ou créez-en une nouvelle.
        </p>
        {surfSchools.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Aucune école de surf trouvée. Veuillez d'abord ajouter des écoles de surf dans la base de données.
            </p>
          </div>
        )}
        {galleries.length === 0 && surfSchools.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              Aucune galerie trouvée. Vous pouvez créer votre première galerie en sélectionnant "Créer une nouvelle galerie" ci-dessous.
            </p>
          </div>
        )}
      </div>
      
      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <UploadPageContent initialSurfSchools={surfSchools} initialGalleries={galleries} />
      </Suspense>
    </div>
  )
} 