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
        *,
        galleries!gallery_id (
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
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des photos', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`latest-photos: ${photos?.length || 0} photos récupérées`)
    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Erreur dans l\'API latest-photos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
} 