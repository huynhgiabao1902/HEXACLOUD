import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Payment webhook called')

    const supabaseAdmin = getSupabaseAdmin()
    const { type, data } = await request.json()

    console.log('📝 Webhook data:', { type, data })

    if (type === 'payment_success') {
      const { orderCode, transactionId, paymentId, status = 'completed' } = data

      // Tìm transaction bằng payment_id hoặc id
      let query = supabaseAdmin.from('transactions').select('*')

      if (transactionId) {
        query = query.eq('id', transactionId)
      } else if (paymentId) {
        query = query.eq('payment_id', paymentId)
      } else if (orderCode) {
        query = query.eq('payment_id', orderCode)
      } else {
        return NextResponse.json({
          success: false,
          error: 'Missing transaction identifier'
        }, { status: 400 })
      }

      const { data: transaction, error: findError } = await query.single()

      if (findError || !transaction) {
        console.error('❌ Transaction not found:', findError)
        return NextResponse.json({
          success: false,
          error: 'Transaction not found'
        }, { status: 404 })
      }

      // Cập nhật trạng thái transaction
      const { data: updatedTransaction, error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          status: status,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Update error:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Failed to update transaction'
        }, { status: 500 })
      }

      console.log('✅ Transaction updated successfully:', updatedTransaction.id)

      return NextResponse.json({
        success: true,
        transaction: updatedTransaction,
        message: 'Payment confirmed successfully'
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown webhook type'
    }, { status: 400 })

  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}