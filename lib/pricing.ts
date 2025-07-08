/**
 * Système de pricing dynamique avec réductions agressives
 * 1ère photo: 15€
 * 2ème photo: 10€ (-33%)
 * 3ème+ photos: 5€ (-67%)
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

const BASE_PRICE = 15
const TIER_2_PRICE = 10
const TIER_3_PRICE = 5

/**
 * Calcule le prix total avec le système de réductions par paliers
 * @param photoCount Nombre de photos
 * @param productType Type de produit (digital, print, bundle)
 * @returns Calcul détaillé du pricing
 */
export function calculateDynamicPricing(
  photoCount: number,
  productType: 'digital' | 'print' | 'bundle' = 'digital'
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

  // Multiplicateurs selon le type de produit
  const multipliers = {
    digital: 1,
    print: 25 / 15, // 25€ au lieu de 15€
    bundle: 35 / 15 // 35€ au lieu de 15€
  }

  const multiplier = multipliers[productType]
  
  // Calcul des prix par palier
  const tier1Price = BASE_PRICE * multiplier
  const tier2Price = TIER_2_PRICE * multiplier
  const tier3Price = TIER_3_PRICE * multiplier

  // Répartition des photos par palier
  const tier1Count = Math.min(photoCount, 1)
  const tier2Count = Math.min(Math.max(photoCount - 1, 0), 1)
  const tier3Count = Math.max(photoCount - 2, 0)

  // Calcul des totaux par palier
  const tier1Total = tier1Count * tier1Price
  const tier2Total = tier2Count * tier2Price
  const tier3Total = tier3Count * tier3Price

  const finalTotal = tier1Total + tier2Total + tier3Total

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
 * @returns Prix de la prochaine photo
 */
export function getNextPhotoPrice(
  currentPhotoCount: number,
  productType: 'digital' | 'print' | 'bundle' = 'digital'
): number {
  const multipliers = {
    digital: 1,
    print: 25 / 15,
    bundle: 35 / 15
  }

  const multiplier = multipliers[productType]

  if (currentPhotoCount === 0) {
    return BASE_PRICE * multiplier
  } else if (currentPhotoCount === 1) {
    return TIER_2_PRICE * multiplier
  } else {
    return TIER_3_PRICE * multiplier
  }
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