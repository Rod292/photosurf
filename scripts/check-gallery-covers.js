const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkGalleryCovers() {
  console.log('🔍 Vérification des photos de couverture des galeries...')
  
  try {
    // Récupérer toutes les galeries avec leur première photo
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select(`
        id,
        name,
        date,
        photos (
          id,
          filename,
          preview_s3_url,
          original_s3_key,
          created_at
        )
      `)
      .order('date', { ascending: false })

    if (galleriesError) {
      console.error('❌ Erreur:', galleriesError)
      return
    }

    console.log(`📊 Galeries trouvées: ${galleries.length}`)

    for (const gallery of galleries) {
      console.log(`\n📁 Galerie: ${gallery.name} (${gallery.date})`)
      console.log(`   Photos total: ${gallery.photos.length}`)

      if (gallery.photos.length === 0) {
        console.log('   ⚠️  Aucune photo dans cette galerie')
        continue
      }

      // Trier les photos par created_at pour avoir la première
      const sortedPhotos = gallery.photos.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const coverPhoto = sortedPhotos[0]
      console.log(`   📷 Photo de couverture: ${coverPhoto.filename}`)
      console.log(`   🔗 URL: ${coverPhoto.preview_s3_url}`)

      // Tester si l'URL est accessible
      try {
        const response = await fetch(coverPhoto.preview_s3_url)
        if (response.ok) {
          console.log(`   ✅ URL accessible (${response.status})`)
        } else {
          console.log(`   ❌ URL non accessible (${response.status})`)
          
          // Si c'est la galerie du 8 juillet, proposer une solution
          if (gallery.name.includes('8 juillet') || gallery.name.includes('Matin 8')) {
            console.log(`   🔧 Galerie problématique détectée!`)
            
            // Trouver une photo qui fonctionne
            let workingPhoto = null
            for (let i = 1; i < Math.min(5, sortedPhotos.length); i++) {
              try {
                const testResponse = await fetch(sortedPhotos[i].preview_s3_url)
                if (testResponse.ok) {
                  workingPhoto = sortedPhotos[i]
                  break
                }
              } catch (e) {
                continue
              }
            }

            if (workingPhoto) {
              console.log(`   💡 Photo alternative trouvée: ${workingPhoto.filename}`)
              console.log(`   🔄 Supprimer la photo de couverture défaillante...`)
              
              // Supprimer la photo qui ne fonctionne pas
              const { error: deleteError } = await supabase
                .from('photos')
                .delete()
                .eq('id', coverPhoto.id)

              if (deleteError) {
                console.log(`   ❌ Erreur suppression: ${deleteError.message}`)
              } else {
                console.log(`   ✅ Photo défaillante supprimée!`)
              }
            }
          }
        }
      } catch (fetchError) {
        console.log(`   ❌ Erreur de connexion: ${fetchError.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
checkGalleryCovers().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})