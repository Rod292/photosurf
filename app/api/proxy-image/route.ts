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
    
    // Pour les images privées (originals) - générer URL signée
    if (bucket === 'originals') {
      const { data, error } = await supabase.storage
        .from('originals')
        .createSignedUrl(path, 86400) // 24 heures
      
      if (error || !data) {
        return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
      }
      
      // Rediriger vers l'URL signée
      return NextResponse.redirect(data.signedUrl)
    }
    
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  } catch (error) {
    console.error('Proxy image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}