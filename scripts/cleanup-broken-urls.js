const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupBrokenUrls() {
  console.log('🔍 Nettoyage des photos avec URLs défaillantes...')
  
  try {
    // Récupérer toutes les photos de la galerie "Matin 8 juillet"
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id')
      .eq('name', 'Matin 8 juillet')
      .single()

    if (galleryError || !gallery) {
      console.error('❌ Galerie "Matin 8 juillet" non trouvée')
      return
    }

    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, filename, preview_s3_url')
      .eq('gallery_id', gallery.id)
      .order('created_at', { ascending: true })

    if (photosError || !photos) {
      console.error('❌ Erreur récupération photos:', photosError)
      return
    }

    console.log(`📊 Photos à vérifier: ${photos.length}`)

    const brokenPhotos = []
    const workingPhotos = []

    // Tester chaque photo par batch de 10 pour éviter de surcharger
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      console.log(`🔍 Test ${i+1}/${photos.length}: ${photo.filename}`)

      try {
        const response = await fetch(photo.preview_s3_url, { method: 'HEAD' })
        if (response.ok) {
          workingPhotos.push(photo)
          console.log(`   ✅ OK`)
        } else {
          brokenPhotos.push(photo)
          console.log(`   ❌ Erreur ${response.status}`)
        }
      } catch (error) {
        brokenPhotos.push(photo)
        console.log(`   ❌ Erreur réseau`)
      }

      // Pause pour éviter de surcharger
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`\n📊 Résultats:`)
    console.log(`✅ Photos fonctionnelles: ${workingPhotos.length}`)
    console.log(`❌ Photos défaillantes: ${brokenPhotos.length}`)

    if (brokenPhotos.length > 0) {
      console.log(`\n🗑️ Suppression des ${brokenPhotos.length} photos défaillantes...`)
      
      // Supprimer par batch de 50
      const batchSize = 50
      for (let i = 0; i < brokenPhotos.length; i += batchSize) {
        const batch = brokenPhotos.slice(i, i + batchSize)
        const ids = batch.map(photo => photo.id)
        
        const { error: deleteError } = await supabase
          .from('photos')
          .delete()
          .in('id', ids)

        if (deleteError) {
          console.error(`❌ Erreur suppression batch ${i/batchSize + 1}:`, deleteError)
        } else {
          console.log(`✅ Batch ${i/batchSize + 1} supprimé (${batch.length} photos)`)
        }
      }

      console.log(`\n🎉 Nettoyage terminé!`)
      console.log(`📊 Photos restantes dans la galerie: ${workingPhotos.length}`)
      
      if (workingPhotos.length > 0) {
        console.log(`📷 Nouvelle photo de couverture: ${workingPhotos[0].filename}`)
      }
    } else {
      console.log(`\n✅ Toutes les photos sont fonctionnelles!`)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
cleanupBrokenUrls().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})