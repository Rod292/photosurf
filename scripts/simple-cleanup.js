const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simpleCleanup() {
  console.log('🔍 Recherche des photos récentes problématiques...')
  
  try {
    // Récupérer les photos des derniers jours
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select(`
        id,
        filename,
        original_s3_key,
        preview_s3_url,
        created_at,
        galleries(id, name, date)
      `)
      .gte('created_at', '2025-01-08') // Photos depuis le 8 janvier
      .order('created_at', { ascending: false })

    if (photosError) {
      console.error('❌ Erreur:', photosError)
      return
    }

    console.log(`📊 Photos récentes trouvées: ${photos.length}`)

    // Grouper par galerie
    const photosByGallery = {}
    photos.forEach(photo => {
      const galleryId = photo.galleries?.id
      if (!photosByGallery[galleryId]) {
        photosByGallery[galleryId] = {
          gallery: photo.galleries,
          photos: []
        }
      }
      photosByGallery[galleryId].photos.push(photo)
    })

    console.log('\n📋 Photos par galerie:')
    for (const [galleryId, group] of Object.entries(photosByGallery)) {
      console.log(`\n📁 Galerie: ${group.gallery?.name} (${group.gallery?.date})`)
      console.log(`   Photos: ${group.photos.length}`)
      
      // Montrer les 3 premières photos pour inspection
      group.photos.slice(0, 3).forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo.filename} (ID: ${photo.id})`)
        
        // Vérifier si les URLs semblent valides
        const hasValidPreview = photo.preview_s3_url && photo.preview_s3_url.includes('supabase.co')
        const hasValidOriginal = photo.original_s3_key && photo.original_s3_key.length > 10
        
        if (!hasValidPreview || !hasValidOriginal) {
          console.log(`      ⚠️  Problème détecté!`)
          console.log(`      Preview: ${hasValidPreview ? '✅' : '❌'} ${photo.preview_s3_url}`)
          console.log(`      Original: ${hasValidOriginal ? '✅' : '❌'} ${photo.original_s3_key}`)
        }
      })
      
      if (group.photos.length > 3) {
        console.log(`   ... et ${group.photos.length - 3} autres`)
      }
    }

    // Chercher spécifiquement les galeries du 8 juillet qui posent problème
    const july8Photos = photos.filter(photo => 
      photo.galleries?.date === '2025-01-08' || 
      photo.galleries?.name?.includes('8') ||
      photo.galleries?.name?.includes('juillet')
    )

    if (july8Photos.length > 0) {
      console.log(`\n🔍 Photos du 8 juillet trouvées: ${july8Photos.length}`)
      july8Photos.forEach((photo, index) => {
        console.log(`${index + 1}. ${photo.filename} (ID: ${photo.id})`)
        console.log(`   Galerie: ${photo.galleries?.name}`)
        console.log(`   Preview: ${photo.preview_s3_url ? '✅' : '❌'}`)
        console.log(`   Original: ${photo.original_s3_key ? '✅' : '❌'}`)
      })

      // Option de suppression
      console.log(`\n❓ Voulez-vous supprimer ces ${july8Photos.length} photos? (ajoutez 'DELETE' au script)`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Exécuter le script
simpleCleanup().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})