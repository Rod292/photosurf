import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    console.log('🔍 Debugging order:', orderId)

    const supabase = createSupabaseAdminClient()
    
    // Vérifier si l'ordre existe
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    // Récupérer les order_items
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Récupérer les photos si on a des order_items
    let photos = null
    let photosError = null
    
    if (orderItems && orderItems.length > 0) {
      const photoIds = orderItems.map(item => item.photo_id)
      const { data: photosData, error: photosErr } = await supabase
        .from('photos')
        .select('*')
        .in('id', photoIds)
      
      photos = photosData
      photosError = photosErr
    }

    return NextResponse.json({
      success: true,
      debug: {
        orderId,
        order: {
          exists: !!order,
          error: orderError?.message,
          data: order
        },
        orderItems: {
          count: orderItems?.length || 0,
          error: orderItemsError?.message,
          data: orderItems
        },
        photos: {
          count: photos?.length || 0,
          error: photosError?.message,
          photoIds: photos?.map(p => p.id)
        }
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}