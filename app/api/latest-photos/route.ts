import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Variables d\'environnement Supabase manquantes')
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    const supabase = createSupabaseAdminClient()
    
    // Récupérer les 8 dernières photos avec leurs galeries
    const { data: photos, error } = await supabase
      .from('photos')
      .select(`
        id,
        gallery_id,
        preview_s3_url,
        filename,
        created_at,
        galleries (
          id,
          name,
          date,
          school_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(8)
    
    if (error) {
      console.error('Erreur Supabase dans latest-photos:', error)
      // Return empty array instead of 500 error to prevent total failure
      return NextResponse.json({ photos: [], error: error.message })
    }
    
    console.log(`latest-photos: ${photos?.length || 0} photos récupérées`)
    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Erreur dans l\'API latest-photos:', error)
    // Return empty array to prevent total failure
    return NextResponse.json({ 
      photos: [], 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    })
  }
} 