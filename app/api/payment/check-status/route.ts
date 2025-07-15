import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { transaction_id } = await request.json()

    if (!transaction_id) {
      return NextResponse.json({
        success: false,
        message: 'Transaction ID is required'
      }, { status: 400 })
    }

    console.log('🔍 Checking status for transaction:', transaction_id)

    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({
        success: false,
        message: 'Transaction not found'
      }, { status: 404 })
    }

    if (transaction.status === 'completed') {
      return NextResponse.json({
        success: true,
        data: transaction,
        message: 'Transaction already completed'
      })
    }

    // Kiểm tra expired
    const now = new Date()
    const expiredAt = new Date(transaction.expired_at)

    if (now > expiredAt && transaction.status === 'pending') {
      const { data: updatedTransaction, error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction_id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        data: updatedTransaction,
        message: 'Transaction expired'
      })
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction status unchanged'
    })

  } catch (error: any) {
    console.error('❌ Check status error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}