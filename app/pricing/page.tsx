// app/pricing/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  price: number
  storage_gb: number
  cpu_cores: number
  ram_gb: number
  max_vps: number
  features: any
}

interface WalletData {
  balance: number
  currentPlan: SubscriptionPlan | null
  activeSubscription: any
}

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    fetchPlans()
    fetchWalletData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Vui lòng đăng nhập để xem gói dịch vụ')
      router.push('/login')
      return
    }
    setUser(session.user)
  }

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      console.error('Error fetching plans:', error)
      toast.error('Không thể tải danh sách gói dịch vụ')
    }
  }

  const fetchWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch wallet data')

      const result = await response.json()
      if (result.success) {
        setWalletData(result.data)
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập')
      router.push('/login')
      return
    }

    // Check if user already has this plan
    if (walletData?.activeSubscription?.plan_id === plan.id) {
      toast.info('Bạn đang sử dụng gói này')
      return
    }

    setPurchasing(plan.id)

    try {
      // Check balance
      if (plan.price > 0 && (!walletData || walletData.balance < plan.price)) {
        const shortfall = plan.price - (walletData?.balance || 0)
        toast.error(`Số dư không đủ. Bạn cần nạp thêm ${shortfall.toLocaleString('vi-VN')}đ`)

        // Redirect to deposit page
        router.push(`/wallet/deposit?amount=${shortfall}&redirect=/pricing`)
        return
      }

      // For MVP, redirect to subscription purchase page
      router.push(`/subscription/purchase/${plan.id}`)

    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Có lỗi xảy ra khi mua gói')
    } finally {
      setPurchasing(null)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí'
    return `${price.toLocaleString('vi-VN')}đ/tháng`
  }

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features = [
      `${plan.storage_gb}GB dung lượng`,
      `${plan.cpu_cores} vCPU`,
      `${plan.ram_gb}GB RAM`,
      `Tối đa ${plan.max_vps} VPS`,
    ]

    if (plan.features.backup) {
      features.push('Sao lưu tự động')
    }
    if (plan.features.priority) {
      features.push('Hỗ trợ ưu tiên')
    }
    if (plan.features.custom_domain) {
      features.push('Tên miền tùy chỉnh')
    }

    return features
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Chọn gói dịch vụ phù hợp với bạn</h1>
        <p className="text-xl text-muted-foreground">
          Mỗi gói bao gồm 1 server Google Cloud với cấu hình tương ứng
        </p>
        {walletData && (
          <div className="mt-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Số dư ví: {walletData.balance.toLocaleString('vi-VN')}đ
            </Badge>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = walletData?.activeSubscription?.plan_id === plan.id
          const isPro = plan.name === 'pro'

          return (
            <Card
              key={plan.id}
              className={`relative ${isPro ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'border-green-500' : ''}`}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                  Phổ biến nhất
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4" variant="secondary">
                  Gói hiện tại
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'secondary' : isPro ? 'default' : 'outline'}
                  disabled={isCurrentPlan || purchasing === plan.id}
                  onClick={() => handlePurchase(plan)}
                >
                  {purchasing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrentPlan ? 'Đang sử dụng' : plan.price === 0 ? 'Bắt đầu miễn phí' : 'Mua gói'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="mt-10 text-center text-sm text-muted-foreground">
        <p>* Tất cả các gói đều được host trên Google Cloud Platform</p>
        <p>* Có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào</p>
      </div>
    </div>
  )
}