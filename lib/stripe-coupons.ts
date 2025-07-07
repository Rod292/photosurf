import { stripe } from './stripe'

// Créer les coupons Stripe pour les codes promo
export async function createStripeCoupons() {
  try {
    // Vérifier si les coupons existent déjà
    const existingCoupons = await stripe.coupons.list({ limit: 100 })
    
    const couponIds = ['ARODE_FREE_2024', 'ARODE_DEMO']
    
    for (const couponId of couponIds) {
      const exists = existingCoupons.data.find(coupon => coupon.id === couponId)
      
      if (!exists) {
        await stripe.coupons.create({
          id: couponId,
          percent_off: 100,
          duration: 'forever',
          name: couponId === 'ARODE_FREE_2024' ? 'Commande gratuite Arode 2024' : 'Mode démonstration gratuit',
          metadata: {
            created_by: 'arode_studio_system',
            description: 'Code promo pour commandes gratuites'
          }
        })
        
        console.log(`Coupon Stripe créé: ${couponId}`)
      } else {
        console.log(`Coupon Stripe existe déjà: ${couponId}`)
      }
    }
    
    return { success: true, message: 'Coupons Stripe initialisés' }
  } catch (error) {
    console.error('Erreur lors de la création des coupons Stripe:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

// Fonction pour lister tous les coupons
export async function listStripeCoupons() {
  try {
    const coupons = await stripe.coupons.list({ limit: 100 })
    return { success: true, coupons: coupons.data }
  } catch (error) {
    console.error('Erreur lors de la récupération des coupons:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}