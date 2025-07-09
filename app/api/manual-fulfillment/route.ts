import { NextRequest, NextResponse } from 'next/server'
import { fulfillOrder } from '@/lib/order-fulfillment'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    console.log('🔄 Manual fulfillment requested for order:', orderId)
    
    // Get order details from database
    const supabase = createSupabaseAdminClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    if (orderError) {
      console.error('❌ Error fetching order:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Attempt to fulfill the order
    const fulfillmentResult = await fulfillOrder({
      orderId: order.id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      totalAmount: order.total_amount
    })
    
    if (fulfillmentResult.success) {
      console.log('✅ Manual fulfillment successful for order:', orderId)
      return NextResponse.json({
        success: true,
        message: 'Order fulfilled successfully',
        emailId: fulfillmentResult.emailId
      })
    } else {
      console.error('❌ Manual fulfillment failed:', fulfillmentResult.message)
      return NextResponse.json(
        { error: fulfillmentResult.message },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('❌ Manual fulfillment error:', error)
    return NextResponse.json(
      { error: 'Failed to process manual fulfillment' },
      { status: 500 }
    )
  }
}