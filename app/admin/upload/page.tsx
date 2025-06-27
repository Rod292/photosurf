// import { Metadata } from 'next'
import { Suspense } from 'react'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { PhotoUploadForm } from './upload-form'
import { Loader2 } from 'lucide-react'
import { SurfSchool, Gallery } from '@/lib/database.types'

// Server Component pour récupérer les écoles de surf
async function fetchSurfSchools(): Promise<SurfSchool[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data: schools, error } = await supabase
      .from('surf_schools')
      .select('id, name, slug')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching surf schools:', error)
      return []
    }
    
    return schools || []
  } catch (error) {
    console.error('Unexpected error in fetchSurfSchools:', error)
    return []
  }
}

// Server Component pour récupérer les galeries
async function fetchGalleries(): Promise<Gallery[]> {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data: galleries, error } = await supabase
      .from('galleries')
      .select('id, name, date, school_id, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching galleries:', error)
      return []
    }
    
    return galleries || []
  } catch (error) {
    console.error('Unexpected error in fetchGalleries:', error)
    return []
  }
}

export default async function AdminUploadPage() {
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Nouveau système d'upload :</strong> Vous pouvez maintenant uploader séparément les photos originales et leurs versions avec watermark. Les fichiers seront automatiquement appariés par ordre alphabétique.
          </p>
        </div>
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
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          }
        >
          <PhotoUploadForm surfSchools={surfSchools} galleries={galleries} />
        </Suspense>
      </div>
    </div>
  )
}

// export const metadata: Metadata = {
//   title: 'Admin - Upload de Photos',
//   description: 'Page pour uploader de nouvelles photos et gérer les galeries.',
//   viewport: 'width=device-width, initial-scale=1',
// } 