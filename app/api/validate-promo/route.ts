import { NextRequest, NextResponse } from 'next/server'

// Code promo secret - en production, ceci devrait être dans une base de données ou variable d'environnement
const PROMO_CODES = {
  'ARODE_FREE_2024': {
    discount: 100, // 100% de réduction
    description: 'Commande gratuite'
  },
  'ARODE_DEMO': {
    discount: 100, // 100% de réduction
    description: 'Mode démonstration'
  }
} as const

interface ValidatePromoRequest {
  code: string
  totalAmount: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidatePromoRequest = await request.json()
    const { code, totalAmount } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return NextResponse.json(
        { error: 'Montant total requis' },
        { status: 400 }
      )
    }

    // Vérifier si le code promo existe
    const promoCode = PROMO_CODES[code.toUpperCase() as keyof typeof PROMO_CODES]
    
    if (!promoCode) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Code promo invalide' 
        },
        { status: 400 }
      )
    }

    // Calculer la réduction
    const discountAmount = (totalAmount * promoCode.discount) / 100
    const finalAmount = Math.max(0, totalAmount - discountAmount)

    return NextResponse.json({
      valid: true,
      discount: promoCode.discount,
      discountAmount,
      finalAmount,
      description: promoCode.description,
      isFree: finalAmount === 0
    })

  } catch (error) {
    console.error('Error validating promo code:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation du code promo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}