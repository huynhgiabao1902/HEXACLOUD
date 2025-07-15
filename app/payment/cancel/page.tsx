// app/payment/cancel/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function PaymentCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const paymentId = searchParams.get('paymentId')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Update transaction status to cancelled
    if (transactionId) {
      updateTransactionStatus()
    }

    // Show cancel message
    toast.info('Thanh toán đã bị hủy')

    // Check if there was a redirect URL stored
    const redirectUrl = localStorage.getItem('deposit_redirect')
    if (redirectUrl) {
      localStorage.removeItem('deposit_redirect')
    }
  }, [transactionId])

  const updateTransactionStatus = async () => {
    if (!transactionId) return

    setIsUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Call backend to update transaction status
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/cancel-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          transactionId: transactionId,
          status: 'cancelled'
        })
      })

      if (response.ok) {
        console.log('Transaction cancelled successfully')
      }
    } catch (error) {
      console.error('Error updating transaction status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Thanh toán đã bị hủy</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isUpdating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Đang cập nhật trạng thái...</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Bạn đã hủy quá trình thanh toán. Không có khoản tiền nào bị trừ.
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/wallet')}
                className="flex-1"
              >
                Về ví
              </Button>
              <Button
                onClick={() => router.push('/wallet/deposit')}
                className="flex-1"
              >
                Thử lại
              </Button>
            </div>

            {transactionId && (
              <p className="text-xs text-muted-foreground">
                Mã giao dịch: {transactionId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}