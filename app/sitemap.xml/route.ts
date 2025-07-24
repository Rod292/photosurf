import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseAdminClient()
  
  try {
    // Récupérer toutes les galeries pour le sitemap
    const { data: galleries } = await supabase
      .from('galleries')
      .select('id, created_at')
      .order('created_at', { ascending: false })
    
    const baseUrl = 'https://www.arodestudio.com'
    const currentDate = new Date().toISOString()
    
    // Pages statiques principales
    const staticPages = [
      {
        url: baseUrl,
        lastModified: currentDate,
        priority: 1.0,
        changeFreq: 'daily'
      },
      {
        url: `${baseUrl}/gallery`,
        lastModified: currentDate,
        priority: 0.9,
        changeFreq: 'daily'
      },
      {
        url: `${baseUrl}/photos-surf-la-torche`,
        lastModified: currentDate,
        priority: 0.9,
        changeFreq: 'weekly'
      },
      {
        url: `${baseUrl}/a-propos`,
        lastModified: currentDate,
        priority: 0.7,
        changeFreq: 'monthly'
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: currentDate,
        priority: 0.7,
        changeFreq: 'monthly'
      },
      {
        url: `${baseUrl}/boutique`,
        lastModified: currentDate,
        priority: 0.6,
        changeFreq: 'monthly'
      },
      {
        url: `${baseUrl}/mentions-legales`,
        lastModified: currentDate,
        priority: 0.3,
        changeFreq: 'yearly'
      }
    ]
    
    // Pages dynamiques des galeries
    const galleryPages = galleries?.map(gallery => ({
      url: `${baseUrl}/gallery/${gallery.id}`,
      lastModified: gallery.created_at,
      priority: 0.8,
      changeFreq: 'weekly'
    })) || []
    
    const allPages = [...staticPages, ...galleryPages]
    
    // Générer le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changeFreq}</changefreq>
  </url>`).join('\n')}
</urlset>`
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Erreur génération sitemap:', error)
    return new NextResponse('Erreur serveur', { status: 500 })
  }
}