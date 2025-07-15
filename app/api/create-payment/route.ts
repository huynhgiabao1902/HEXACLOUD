import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import PayOS from '@payos/node'

// Khởi tạo PayOS
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('💰 Create payment API called')

    const supabaseAdmin = getSupabaseAdmin()
    const { amount, description } = await request.json()

    console.log('📝 Request data:', { amount, description })

    // Lấy authorization header
    const authorization = request.headers.get('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      console.log('❌ No authorization header')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    console.log('🔑 Token received:', token ? 'Yes' : 'No')

    // Verify token với Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.log('❌ Auth error:', authError)
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication'
      }, { status: 401 })
    }

    console.log('✅ Authenticated user:', user.email)

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount'
      }, { status: 400 })
    }

    console.log('💰 Creating payment for user:', user.id, 'Amount:', amount)

    // Generate payment ID
    const orderCode = Date.now()
    const paymentId = `PAY_${orderCode}`

    // Tạo mô tả ngắn cho PayOS (tối đa 25 ký tự)
    const shortDescription = `Nap tien ${amount}VND`; // 25 ký tự trở xuống
    const fullDescription = description || `Nạp tiền vào tài khoản - ${new Date().toLocaleDateString('vi-VN')}`;

    console.log('📝 Short description for PayOS:', shortDescription)
    console.log('📝 Full description for DB:', fullDescription)

    // Tạo transaction trong Supabase trước
    const { data: transaction, error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        payment_id: paymentId,
        amount: amount,
        description: fullDescription, // Lưu mô tả đầy đủ trong DB
        status: 'pending',
        payment_method: 'PayOS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 phút
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create transaction: ' + dbError.message
      }, { status: 500 })
    }

    console.log('✅ Transaction created:', transaction.id)

    // Tạo payment với PayOS thật
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/payment/success?transactionId=${transaction.id}&paymentId=${paymentId}`
    const cancelUrl = `${baseUrl}/payment/cancel?transactionId=${transaction.id}&paymentId=${paymentId}`

    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: shortDescription, // Dùng mô tả ngắn cho PayOS
      returnUrl: successUrl,
      cancelUrl: cancelUrl
    }

    console.log('📤 Creating PayOS payment:', paymentData)

    // Gọi PayOS API
    const paymentResult = await payOS.createPaymentLink(paymentData)

    console.log('✅ PayOS payment created:', paymentResult)

    // Cập nhật transaction với thông tin PayOS
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        payment_url: paymentResult.checkoutUrl,
        qr_code: paymentResult.qrCode,
        updated_at: new Date().toISOString(),
        metadata: {
          payos_order_code: orderCode,
          payos_short_description: shortDescription,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      })
      .eq('id', transaction.id)

    if (updateError) {
      console.error('❌ Update error:', updateError)
    }

    console.log('✅ Payment created successfully:', paymentId)

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.checkoutUrl,
      paymentId: paymentId,
      transactionId: transaction.id,
      qrCode: paymentResult.qrCode,
      orderCode: orderCode,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      message: 'Payment created successfully'
    })

  } catch (error: any) {
    console.error('❌ Create payment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}