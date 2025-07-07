import { NextRequest, NextResponse } from 'next/server'
import { createStripeCoupons, listStripeCoupons } from '@/lib/stripe-coupons'

export async function POST(request: NextRequest) {
  try {
    // Créer les coupons Stripe
    const result = await createStripeCoupons()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Coupons Stripe initialisés avec succès'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des coupons:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation des coupons Stripe'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Lister les coupons existants
    const result = await listStripeCoupons()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        coupons: result.coupons
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des coupons:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des coupons Stripe'
    }, { status: 500 })
  }
}