// app/payment/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const paymentId = searchParams.get('paymentId')
  const [processing, setProcessing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Review states
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    if (transactionId) {
      processPaymentSuccess()
    }
  }, [transactionId])

  const processPaymentSuccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Vui lòng đăng nhập lại')
        router.push('/login')
        return
      }

      console.log('Processing payment for transaction:', transactionId)

      // Call backend to process deposit
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/deposit/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          transactionId: transactionId,
          userId: session.user.id
        })
      })

      const result = await response.json()
      console.log('Process result:', result)

      if (result.success) {
        setSuccess(true)
        toast.success('Nạp tiền thành công!')

        // Show review modal after 1 second
        setTimeout(() => {
          setShowReview(true)
        }, 1000)
      } else {
        throw new Error(result.error || 'Failed to process payment')
      }

    } catch (error: any) {
      console.error('Payment processing error:', error)
      toast.error('Có lỗi xảy ra khi xử lý thanh toán')
      setSuccess(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!transactionId || rating === 0) return

    setIsSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Vui lòng đăng nhập lại')
        return
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: session.user.id,
          transaction_id: transactionId,
          rating: rating,
          comment: comment.trim(),
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Cảm ơn bạn đã đánh giá!')
      handleReviewComplete()
    } catch (error: any) {
      console.error('Review error:', error)
      toast.error('Không thể gửi đánh giá')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewComplete = () => {
    setShowReview(false)
    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('deposit_redirect')
    if (redirectUrl) {
      localStorage.removeItem('deposit_redirect')
      router.push(redirectUrl)
    } else {
      router.push('/wallet')
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            {processing ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <CardTitle>Đang xử lý thanh toán...</CardTitle>
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Thanh toán thành công!</CardTitle>
              </>
            ) : (
              <CardTitle>Có lỗi xảy ra</CardTitle>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {processing && (
              <p className="text-muted-foreground">
                Vui lòng đợi trong giây lát...
              </p>
            )}

            {!processing && success && (
              <>
                <p className="text-muted-foreground">
                  Số tiền đã được cộng vào ví của bạn
                </p>
                {!showReview && (
                  <p className="text-sm text-muted-foreground">
                    Đang chuyển hướng...
                  </p>
                )}
              </>
            )}

            {!processing && !success && (
              <>
                <p className="text-muted-foreground">
                  Vui lòng liên hệ support nếu bạn đã thanh toán
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/wallet')}
                    className="flex-1"
                  >
                    Về ví
                  </Button>
                  <Button
                    onClick={() => router.push('/support')}
                    className="flex-1"
                  >
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </>
            )}

            {transactionId && (
              <p className="text-xs text-muted-foreground">
                Mã giao dịch: {transactionId}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đánh giá dịch vụ</DialogTitle>
            <DialogDescription>
              Hãy cho chúng tôi biết trải nghiệm của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all duration-200 transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {rating === 0 && 'Chọn số sao'}
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Xuất sắc'}
            </div>

            {/* Comment */}
            <Textarea
              placeholder="Chia sẻ thêm về trải nghiệm của bạn (tùy chọn)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleReviewComplete}
              disabled={isSubmitting}
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi đánh giá
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}