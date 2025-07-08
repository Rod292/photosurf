const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addSessionPeriodColumn() {
  console.log('🔧 Test de la colonne session_period dans la table galleries...')
  
  try {
    // Récupérer une galerie existante pour récupérer son school_id
    const { data: existingGalleries, error: fetchError } = await supabase
      .from('galleries')
      .select('school_id')
      .limit(1)

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des galeries:', fetchError)
      return
    }

    const schoolId = existingGalleries?.[0]?.school_id || 1

    // Tester si on peut insérer une galerie avec session_period
    const { data: testData, error: testError } = await supabase
      .from('galleries')
      .insert({
        name: 'Test Session Period',
        date: new Date().toISOString().split('T')[0],
        session_period: 'matin',
        school_id: schoolId
      })
      .select()

    if (testError) {
      console.error('❌ La colonne session_period n\'existe pas encore.')
      console.log('💡 Veuillez ajouter manuellement la colonne dans Supabase:')
      console.log('')
      console.log('1. Allez dans Supabase Dashboard')
      console.log('2. Ouvrez l\'éditeur SQL')
      console.log('3. Exécutez cette requête:')
      console.log('')
      console.log('ALTER TABLE galleries ADD COLUMN session_period TEXT CHECK (session_period IN (\'matin\', \'apres-midi\', \'journee\'));')
      console.log('')
      return
    } else {
      console.log('✅ La colonne session_period fonctionne!')
      
      // Supprimer la galerie de test
      const { error: deleteError } = await supabase
        .from('galleries')
        .delete()
        .eq('name', 'Test Session Period')

      if (deleteError) {
        console.log('⚠️  Erreur lors de la suppression de la galerie de test:', deleteError)
      } else {
        console.log('🧹 Galerie de test supprimée')
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    console.log('💡 Veuillez ajouter manuellement la colonne dans Supabase:')
    console.log('')
    console.log('ALTER TABLE galleries ADD COLUMN session_period TEXT CHECK (session_period IN (\'matin\', \'apres-midi\', \'journee\'));')
  }
}

// Exécuter le script
addSessionPeriodColumn().then(() => {
  console.log('🏁 Script terminé')
  process.exit(0)
}).catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})