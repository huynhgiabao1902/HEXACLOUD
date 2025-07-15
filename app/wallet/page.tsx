// app/wallet/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Transaction {
  id: string
  amount: number
  description: string
  status: string
  payment_method: string
  created_at: string
  completed_at: string | null
}

interface WalletData {
  balance: number
  totalSpent: number
  currentPlan: any
  activeSubscription: any
}

export default function WalletPage() {
  const router = useRouter()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Vui lòng đăng nhập')
      router.push('/login')
      return
    }

    fetchWalletData(session.access_token)
    fetchTransactions(session.access_token)
  }

  const fetchWalletData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch wallet data')

      const result = await response.json()
      if (result.success) {
        setWalletData(result.data)
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
      toast.error('Không thể tải thông tin ví')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (token: string, page = 1) => {
    try {
      setLoadingTx(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/history?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch transactions')

      const result = await response.json()
      if (result.success) {
        setTransactions(result.data.transactions)
        setTotalPages(result.data.pagination.totalPages)
        setCurrentPage(result.data.pagination.page)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Không thể tải lịch sử giao dịch')
    } finally {
      setLoadingTx(false)
    }
  }

  const handleDeposit = () => {
    router.push('/wallet/deposit')
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Đang xử lý' },
      completed: { variant: 'success', label: 'Thành công' },
      failed: { variant: 'destructive', label: 'Thất bại' },
      cancelled: { variant: 'outline', label: 'Đã hủy' },
      expired: { variant: 'outline', label: 'Hết hạn' }
    }

    const config = statusMap[status] || { variant: 'outline', label: status }

    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const getTransactionIcon = (description: string) => {
    if (description.toLowerCase().includes('nạp tiền')) {
      return <ArrowDownRight className="h-4 w-4 text-green-500" />
    }
    if (description.toLowerCase().includes('mua gói')) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />
    }
    return <Clock className="h-4 w-4 text-gray-500" />
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ví của tôi</h1>

        {/* Wallet Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số dư hiện tại</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData?.balance.toLocaleString('vi-VN')}đ
              </div>
              <Button
                className="mt-4 w-full"
                onClick={handleDeposit}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nạp tiền
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData?.totalSpent.toLocaleString('vi-VN')}đ
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Từ khi đăng ký
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gói hiện tại</CardTitle>
              <Badge variant="secondary">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData?.activeSubscription?.subscription_plans?.display_name || 'Chưa có'}
              </div>
              <Button
                className="mt-4 w-full"
                variant="outline"
                size="sm"
                onClick={() => router.push('/pricing')}
              >
                Nâng cấp gói
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              Tất cả giao dịch nạp tiền và thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="completed">Thành công</TabsTrigger>
                <TabsTrigger value="pending">Đang xử lý</TabsTrigger>
                <TabsTrigger value="failed">Thất bại</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {loadingTx ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có giao dịch nào
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Phương thức</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.description)}
                              <span>{tx.description}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.amount.toLocaleString('vi-VN')}đ
                          </TableCell>
                          <TableCell>{tx.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(tx.status)}
                              {tx.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    const { data: { session } } = await supabase.auth.getSession()
                                    if (session) {
                                      // Check transaction status
                                      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/cancel-transaction`, {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${session.access_token}`
                                        },
                                        body: JSON.stringify({
                                          transactionId: tx.id,
                                          status: 'cancelled'
                                        })
                                      })

                                      if (response.ok) {
                                        toast.success('Đã hủy giao dịch')
                                        fetchTransactions(session.access_token)
                                      }
                                    }
                                  }}
                                  title="Hủy giao dịch"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={async () => {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session) {
                          fetchTransactions(session.access_token, currentPage - 1)
                        }
                      }}
                    >
                      Trang trước
                    </Button>
                    <span className="flex items-center px-3">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={async () => {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session) {
                          fetchTransactions(session.access_token, currentPage + 1)
                        }
                      }}
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Other tabs can be implemented similarly */}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}