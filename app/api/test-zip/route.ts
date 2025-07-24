import { NextRequest, NextResponse } from 'next/server'
import { simpleFulfillOrder } from '@/lib/simple-fulfillment'

export async function GET(request: NextRequest) {
  console.log('🧪 Testing ZIP download system...')
  
  // Créer des données de test
  const testOrderData = {
    orderId: 'test-order-123',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    totalAmount: 5000, // 50.00€
    photos: [
      {
        id: 'photo-1',
        original_s3_key: 'test/photo1.jpg',
        preview_s3_url: 'https://example.com/preview1.jpg'
      },
      {
        id: 'photo-2', 
        original_s3_key: 'test/photo2.jpg',
        preview_s3_url: 'https://example.com/preview2.jpg'
      }
    ]
  }
  
  try {
    // Tester uniquement la génération du token ZIP (sans envoyer d'email)
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const zipToken = Buffer.from(`${testOrderData.orderId}:${expirationDate.getTime()}`).toString('base64')
    const zipDownloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arodestudio.com'}/api/download-order-zip/${zipToken}`
    
    console.log('✅ ZIP Token generated:', zipToken)
    console.log('✅ ZIP URL generated:', zipDownloadUrl)
    
    return NextResponse.json({
      success: true,
      message: 'ZIP system test completed',
      zipToken,
      zipDownloadUrl,
      expiresAt: expirationDate.toISOString()
    })
    
  } catch (error) {
    console.error('❌ ZIP test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}