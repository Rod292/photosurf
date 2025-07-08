const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMissingFiles() {
  console.log('🔍 Vérification des fichiers manquants...')
  
  try {
    // 1. Récupérer toutes les photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select(`
        id,
        filename,
        original_s3_key,
        preview_s3_url,
        created_at,
        galleries(name, date)
      `)
      .order('created_at', { ascending: false })

    if (photosError) {
      console.error('❌ Erreur lors de la récupération des photos:', photosError)
      return
    }

    console.log(`📊 Total photos trouvées: ${photos.length}`)

    const missingFiles = []

    // 2. Vérifier chaque fichier dans les buckets
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      console.log(`🔍 Vérification ${i+1}/${photos.length}: ${photo.filename}`)

      let hasErrors = false

      // Vérifier le fichier original
      if (photo.original_s3_key) {
        const { data: originalData, error: originalError } = await supabase.storage
          .from('originals')
          .list('', { search: photo.original_s3_key })

        if (originalError || !originalData || originalData.length === 0) {
          console.log(`❌ Fichier original manquant: ${photo.original_s3_key}`)
          hasErrors = true
        }
      }

      // Vérifier le fichier preview en extrayant le chemin de l'URL
      if (photo.preview_s3_url) {
        try {
          const url = new URL(photo.preview_s3_url)
          const pathParts = url.pathname.split('/')
          const fileName = pathParts[pathParts.length - 1]
          const folderPath = pathParts.slice(-2, -1)[0] // Récupère le dossier parent
          
          const { data: previewData, error: previewError } = await supabase.storage
            .from('web-previews')
            .list(folderPath, { search: fileName })

          if (previewError || !previewData || previewData.length === 0) {
            console.log(`❌ Fichier preview manquant: ${fileName} dans ${folderPath}`)
            hasErrors = true
          }
        } catch (urlError) {
          console.log(`❌ URL preview invalide: ${photo.preview_s3_url}`)
          hasErrors = true
        }
      }

      if (hasErrors) {
        missingFiles.push({
          ...photo,
          gallery_name: photo.galleries?.name,
          gallery_date: photo.galleries?.date
        })
      }
    }

    console.log(`\n📋 Résultats:`)
    console.log(`✅ Photos valides: ${photos.length - missingFiles.length}`)
    console.log(`❌ Photos avec fichiers manquants: ${missingFiles.length}`)

    if (missingFiles.length > 0) {
      console.log('\n🗑️ Photos à supprimer:')
      missingFiles.forEach((photo, index) => {
        console.log(`${index + 1}. ID: ${photo.id} - ${photo.filename}`)
        console.log(`   Galerie: ${photo.gallery_name} (${photo.gallery_date})`)
      })

      console.log(`\n⚠️ Suppression de ${missingFiles.length} photos avec fichiers manquants...`)
      
      const idsToDelete = missingFiles.map(photo => photo.id)
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError)
        return
      }

      console.log(`✅ ${missingFiles.length} photos supprimées avec succès!`)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
checkMissingFiles().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})