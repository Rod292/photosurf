import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')
    const path = searchParams.get('path')
    
    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    
    // Pour les images publiques (web-previews)
    if (bucket === 'web-previews') {
      const { data: { publicUrl } } = supabase.storage
        .from('web-previews')
        .getPublicUrl(path)
      
      // Rediriger vers l'URL publique
      return NextResponse.redirect(publicUrl)
    }
    
    // Pour les images originales (maintenant publiques)
    if (bucket === 'originals') {
      const { data: { publicUrl } } = supabase.storage
        .from('originals')
        .getPublicUrl(path)
      
      // Rediriger vers l'URL publique
      return NextResponse.redirect(publicUrl)
    }
    
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  } catch (error) {
    console.error('Proxy image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}