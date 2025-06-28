import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    
    // Récupérer les 8 dernières photos avec leurs galeries
    const { data: photos, error } = await supabase
      .from('photos')
      .select(`
        *,
        gallery:gallery_id (
          id,
          name,
          date,
          school_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(8)
    
    if (error) {
      console.error('Erreur lors de la récupération des dernières photos:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des photos' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ photos: photos || [] })
  } catch (error) {
    console.error('Erreur dans l\'API latest-photos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
} 