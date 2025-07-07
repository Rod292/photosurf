import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Lister tous les promotion codes
    const promotionCodes = await stripe.promotionCodes.list({ 
      limit: 100,
      active: true 
    })
    
    // Lister tous les coupons
    const coupons = await stripe.coupons.list({ 
      limit: 100 
    })

    // Créer une session de test avec promotion codes activés
    const testSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Test Product'
          },
          unit_amount: 1000, // 10€
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      success: true,
      data: {
        promotionCodes: promotionCodes.data,
        coupons: coupons.data,
        testSessionUrl: testSession.url,
        message: 'Pour voir le champ promo, allez sur testSessionUrl'
      }
    })

  } catch (error) {
    console.error('Erreur test Stripe:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}