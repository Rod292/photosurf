/**
 * Système de pricing dynamique avec réductions agressives
 * 1ère photo: 10€
 * 2ème photo: 7€ (-30%)
 * 3ème+ photos: 5€ (-50%)
 * Pack Session illimité: 45€ (quand le total dépasse 45€)
 */

export interface PricingTier {
  unitPrice: number
  discount: number
  savingsAmount: number
}

export interface PricingCalculation {
  subtotal: number
  totalSavings: number
  finalTotal: number
  breakdown: {
    tier1: { count: number; price: number; total: number }
    tier2: { count: number; price: number; total: number }
    tier3: { count: number; price: number; total: number }
  }
}

const BASE_PRICE = 10
const TIER_2_PRICE = 7
const TIER_3_PRICE = 5
const SESSION_PACK_PRICE = 45

/**
 * Calcule le prix total avec le système de réductions par paliers
 * @param photoCount Nombre de photos
 * @param productType Type de produit (digital, print_a5, print_a4, print_a3, print_a2)
 * @param forceSessionPack Force l'application du pack session
 * @returns Calcul détaillé du pricing
 */
export function calculateDynamicPricing(
  photoCount: number,
  productType: 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6' | 'session_pack' = 'digital',
  forceSessionPack: boolean = false
): PricingCalculation {
  if (photoCount <= 0) {
    return {
      subtotal: 0,
      totalSavings: 0,
      finalTotal: 0,
      breakdown: {
        tier1: { count: 0, price: 0, total: 0 },
        tier2: { count: 0, price: 0, total: 0 },
        tier3: { count: 0, price: 0, total: 0 }
      }
    }
  }

  // Prix selon le type de produit
  if (productType === 'session_pack') {
    // Le pack session a un prix fixe de 45€
    const finalTotal = photoCount * SESSION_PACK_PRICE
    
    return {
      subtotal: finalTotal,
      totalSavings: 0,
      finalTotal,
      breakdown: {
        tier1: { count: photoCount, price: SESSION_PACK_PRICE, total: finalTotal },
        tier2: { count: 0, price: 0, total: 0 },
        tier3: { count: 0, price: 0, total: 0 }
      }
    }
  }

  if (productType !== 'digital') {
    // Prix fixes pour les tirages, pas de réductions dégressives
    const printPrices = {
      'print_a5': 20,
      'print_a4': 30,
      'print_a3': 50,
      'print_a2': 80,
      'print_polaroid_3': 15,
      'print_polaroid_6': 20
    }
    
    const unitPrice = printPrices[productType]
    const finalTotal = photoCount * unitPrice
    
    return {
      subtotal: finalTotal,
      totalSavings: 0,
      finalTotal,
      breakdown: {
        tier1: { count: photoCount, price: unitPrice, total: finalTotal },
        tier2: { count: 0, price: 0, total: 0 },
        tier3: { count: 0, price: 0, total: 0 }
      }
    }
  }

  // Système de réductions dégressives pour les photos numériques uniquement
  const tier1Price = BASE_PRICE
  const tier2Price = TIER_2_PRICE
  const tier3Price = TIER_3_PRICE

  // Répartition des photos par palier
  const tier1Count = Math.min(photoCount, 1)
  const tier2Count = Math.min(Math.max(photoCount - 1, 0), 1)
  const tier3Count = Math.max(photoCount - 2, 0)

  // Calcul des totaux par palier
  const tier1Total = tier1Count * tier1Price
  const tier2Total = tier2Count * tier2Price
  const tier3Total = tier3Count * tier3Price

  const calculatedTotal = tier1Total + tier2Total + tier3Total
  
  // Application du pack session si le total dépasse 45€ ou si forcé
  const shouldApplySessionPack = forceSessionPack || calculatedTotal > SESSION_PACK_PRICE
  const finalTotal = shouldApplySessionPack ? SESSION_PACK_PRICE : calculatedTotal

  // Calcul des économies (ce qu'on aurait payé au prix normal)
  const wouldHaveBeenTotal = photoCount * tier1Price
  const totalSavings = wouldHaveBeenTotal - finalTotal

  return {
    subtotal: wouldHaveBeenTotal,
    totalSavings,
    finalTotal,
    breakdown: {
      tier1: { count: tier1Count, price: tier1Price, total: tier1Total },
      tier2: { count: tier2Count, price: tier2Price, total: tier2Total },
      tier3: { count: tier3Count, price: tier3Price, total: tier3Total }
    }
  }
}

/**
 * Calcule le prix pour une photo supplémentaire
 * @param currentPhotoCount Nombre actuel de photos dans le panier
 * @param productType Type de produit
 * @param currentTotal Total actuel du panier
 * @returns Prix de la prochaine photo (0 si pack session déjà atteint)
 */
export function getNextPhotoPrice(
  currentPhotoCount: number,
  productType: 'digital' | 'print_a5' | 'print_a4' | 'print_a3' | 'print_a2' | 'print_polaroid_3' | 'print_polaroid_6' | 'session_pack' = 'digital',
  currentTotal: number = 0
): number {
  if (productType === 'session_pack') {
    // Le pack session coûte 45€, mais ne peut être acheté qu'une fois
    return currentPhotoCount === 0 ? SESSION_PACK_PRICE : 0
  }

  if (productType !== 'digital') {
    // Prix fixes pour les tirages
    const printPrices = {
      'print_a5': 20,
      'print_a4': 30,
      'print_a3': 50,
      'print_a2': 80,
      'print_polaroid_3': 15,
      'print_polaroid_6': 20
    }
    return printPrices[productType]
  }

  // Si le pack session est déjà atteint, photos gratuites
  if (currentTotal >= SESSION_PACK_PRICE) {
    return 0
  }
  
  // Calcul du prix selon le palier
  let nextPhotoPrice
  if (currentPhotoCount === 0) {
    nextPhotoPrice = BASE_PRICE
  } else if (currentPhotoCount === 1) {
    nextPhotoPrice = TIER_2_PRICE
  } else {
    nextPhotoPrice = TIER_3_PRICE
  }
  
  // Si l'ajout de cette photo dépasse 45€, appliquer le pack session
  if (currentTotal + nextPhotoPrice > SESSION_PACK_PRICE) {
    return SESSION_PACK_PRICE - currentTotal
  }
  
  return nextPhotoPrice
}

/**
 * Formate un prix en euros
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

/**
 * Calcule les économies réalisées en pourcentage
 */
export function calculateSavingsPercentage(originalPrice: number, newPrice: number): number {
  if (originalPrice === 0) return 0
  return Math.round(((originalPrice - newPrice) / originalPrice) * 100)
}

/**
 * Calcule les frais de livraison selon le format de tirage
 */
export function calculateDeliveryPrice(productType: string, deliveryOption: 'pickup' | 'delivery'): number {
  if (deliveryOption === 'pickup') {
    return 0 // Récupération gratuite
  }
  
  // Frais de livraison fixe de 7€ pour tous les tirages
  if (productType.startsWith('print_')) {
    return 7
  }
  
  return 0
}

/**
 * Vérifie si le pack session devrait être appliqué
 */
export function shouldApplySessionPack(totalAmount: number): boolean {
  return totalAmount >= SESSION_PACK_PRICE
}

/**
 * Obtient le prix du pack session
 */
export function getSessionPackPrice(): number {
  return SESSION_PACK_PRICE
}