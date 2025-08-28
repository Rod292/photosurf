/**
 * Système de pricing dynamique avec packs
 * 1ère photo: 10€
 * 2ème photo: 7€ (-30%)
 * 3ème+ photos: 5€ (-50%)
 * Pack 15 photos: 40€ (appliqué automatiquement quand le total dépasse 40€)
 * Photos 16+: 5€ chacune (jusqu'à 69€)
 * Pack illimité: 69€ (appliqué automatiquement quand le total atteint 69€)
 * 
 * IMPORTANT: Une fois qu'un pack est appliqué, toutes les photos supplémentaires
 * affichent 0€ jusqu'à ce que le seuil du pack suivant soit atteint.
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
const PACK_15_PRICE = 40
const PACK_15_COUNT = 15
const UNLIMITED_PACK_PRICE = 69
const EXTRA_PHOTO_PRICE = 5

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
    // Le pack 15 photos a un prix fixe de 40€
    const finalTotal = photoCount * PACK_15_PRICE
    
    return {
      subtotal: finalTotal,
      totalSavings: 0,
      finalTotal,
      breakdown: {
        tier1: { count: photoCount, price: PACK_15_PRICE, total: finalTotal },
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

  let finalTotal = 0
  let tier1Count = 0
  let tier2Count = 0
  let tier3Count = 0

  if (photoCount <= PACK_15_COUNT) {
    // Calcul pour 1-15 photos
    tier1Count = Math.min(photoCount, 1)
    tier2Count = Math.min(Math.max(photoCount - 1, 0), 1)
    tier3Count = Math.max(photoCount - 2, 0)

    const tier1Total = tier1Count * tier1Price
    const tier2Total = tier2Count * tier2Price
    const tier3Total = tier3Count * tier3Price

    const calculatedTotal = tier1Total + tier2Total + tier3Total
    
    // Si le total dépasse 40€, appliquer le pack 15 photos
    if (calculatedTotal > PACK_15_PRICE || forceSessionPack) {
      finalTotal = PACK_15_PRICE
    } else {
      finalTotal = calculatedTotal
    }
  } else {
    // Plus de 15 photos
    finalTotal = PACK_15_PRICE // Base price for 15 photos
    const extraPhotos = photoCount - PACK_15_COUNT
    const extraCost = extraPhotos * EXTRA_PHOTO_PRICE
    
    // Si le total atteint 69€, appliquer le pack illimité
    if (finalTotal + extraCost >= UNLIMITED_PACK_PRICE) {
      finalTotal = UNLIMITED_PACK_PRICE
    } else {
      finalTotal = finalTotal + extraCost
    }
    
    // Pour le breakdown, on simule les 15 premières photos
    tier1Count = 1
    tier2Count = 1
    tier3Count = 13
  }

  // Calcul des économies (ce qu'on aurait payé au prix normal)
  const wouldHaveBeenTotal = photoCount * tier1Price
  const totalSavings = wouldHaveBeenTotal - finalTotal

  return {
    subtotal: wouldHaveBeenTotal,
    totalSavings,
    finalTotal,
    breakdown: {
      tier1: { count: tier1Count, price: tier1Price, total: tier1Count * tier1Price },
      tier2: { count: tier2Count, price: tier2Price, total: tier2Count * tier2Price },
      tier3: { count: tier3Count, price: tier3Price, total: tier3Count * tier3Price }
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
    // Le pack 15 photos coûte 40€, mais ne peut être acheté qu'une fois
    return currentPhotoCount === 0 ? PACK_15_PRICE : 0
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

  // Si le pack illimité est déjà atteint, photos gratuites
  if (currentTotal >= UNLIMITED_PACK_PRICE) {
    return 0
  }
  
  let nextPhotoPrice
  
  if (currentPhotoCount < PACK_15_COUNT) {
    // Calcul du prix selon le palier pour les 15 premières photos
    if (currentPhotoCount === 0) {
      nextPhotoPrice = BASE_PRICE
    } else if (currentPhotoCount === 1) {
      nextPhotoPrice = TIER_2_PRICE
    } else {
      nextPhotoPrice = TIER_3_PRICE
    }
    
    // Si l'ajout de cette photo dépasse 40€, appliquer le pack 15 photos
    if (currentTotal + nextPhotoPrice > PACK_15_PRICE) {
      const difference = PACK_15_PRICE - currentTotal
      return Math.max(0, difference) // S'assurer que le prix n'est jamais négatif
    }
  } else {
    // Photos 16+ coûtent 5€ chacune
    nextPhotoPrice = EXTRA_PHOTO_PRICE
    
    // Si l'ajout de cette photo atteint 69€, appliquer le pack illimité
    if (currentTotal + nextPhotoPrice >= UNLIMITED_PACK_PRICE) {
      const difference = UNLIMITED_PACK_PRICE - currentTotal
      return Math.max(0, difference) // S'assurer que le prix n'est jamais négatif
    }
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
 * Vérifie si le pack 15 photos devrait être appliqué
 */
export function shouldApplyPack15(totalAmount: number): boolean {
  return totalAmount >= PACK_15_PRICE
}

/**
 * Vérifie si le pack illimité devrait être appliqué
 */
export function shouldApplyUnlimitedPack(totalAmount: number): boolean {
  return totalAmount >= UNLIMITED_PACK_PRICE
}

/**
 * Obtient le prix du pack 15 photos
 */
export function getPack15Price(): number {
  return PACK_15_PRICE
}

/**
 * Obtient le prix du pack illimité
 */
export function getUnlimitedPackPrice(): number {
  return UNLIMITED_PACK_PRICE
}

/**
 * Obtient le nombre de photos dans le pack 15
 */
export function getPack15Count(): number {
  return PACK_15_COUNT
}

/**
 * Détermine le type de pack à appliquer selon le nombre de photos
 * @param photoCount Nombre de photos
 * @returns 'pack_15' | 'pack_unlimited' | 'none'
 */
export function getPackType(photoCount: number): 'pack_15' | 'pack_unlimited' | 'none' {
  if (photoCount === 0) return 'none'
  
  const pricing = calculateDynamicPricing(photoCount, 'digital')
  
  if (pricing.finalTotal === UNLIMITED_PACK_PRICE) {
    return 'pack_unlimited'
  } else if (pricing.finalTotal === PACK_15_PRICE) {
    return 'pack_15'
  }
  
  return 'none'
}

/**
 * Obtient le nom du pack selon son prix
 */
export function getPackName(packPrice: number): string {
  if (packPrice === PACK_15_PRICE) {
    return 'Pack 15 photos'
  } else if (packPrice === UNLIMITED_PACK_PRICE) {
    return 'Pack Illimité'
  }
  return 'Pack Session'
}