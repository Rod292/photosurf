const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupOrphanPhotos() {
  console.log('🔍 Recherche des photos orphelines...')
  
  try {
    // 1. Récupérer toutes les photos avec leurs galeries
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

    // 2. Identifier les photos avec des URLs vides ou nulles
    const orphanPhotos = photos.filter(photo => 
      !photo.preview_s3_url || 
      photo.preview_s3_url === '' ||
      !photo.original_s3_key || 
      photo.original_s3_key === ''
    )

    console.log(`🗑️  Photos orphelines trouvées: ${orphanPhotos.length}`)

    if (orphanPhotos.length === 0) {
      console.log('✅ Aucune photo orpheline trouvée!')
      return
    }

    // 3. Afficher les détails des photos orphelines
    console.log('\n📋 Détails des photos orphelines:')
    orphanPhotos.forEach((photo, index) => {
      console.log(`${index + 1}. ID: ${photo.id}`)
      console.log(`   Nom: ${photo.filename || 'N/A'}`)
      console.log(`   Galerie: ${photo.galleries?.name || 'N/A'} (${photo.galleries?.date || 'N/A'})`)
      console.log(`   Créée le: ${new Date(photo.created_at).toLocaleDateString('fr-FR')}`)
      console.log(`   Preview URL: ${photo.preview_s3_url || 'VIDE'}`)
      console.log(`   Original key: ${photo.original_s3_key || 'VIDE'}`)
      console.log('   ---')
    })

    // 4. Demander confirmation avant suppression
    console.log(`\n⚠️  ATTENTION: ${orphanPhotos.length} photos orphelines vont être supprimées.`)
    console.log('🗑️  Suppression des photos orphelines...')

    // 5. Supprimer les photos orphelines
    const orphanIds = orphanPhotos.map(photo => photo.id)
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .in('id', orphanIds)

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError)
      return
    }

    console.log(`✅ ${orphanPhotos.length} photos orphelines supprimées avec succès!`)

    // 6. Vérification finale
    const { data: remainingPhotos, error: checkError } = await supabase
      .from('photos')
      .select('id')

    if (!checkError) {
      console.log(`📊 Photos restantes: ${remainingPhotos.length}`)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
cleanupOrphanPhotos().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})