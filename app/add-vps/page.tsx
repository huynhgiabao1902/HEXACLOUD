'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AddVPSPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    ipAddress: '',
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorField, setErrorField] = useState('')
  const [vpsInfo, setVpsInfo] = useState<any>(null)

  const isValidIPv4 = (ip: string): boolean => {
    const regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
    return regex.test(ip)
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrorMessage('')
    setErrorField('')
  }

  const handleAddVPS = async () => {
    const { ipAddress, username, password } = form

    if (!ipAddress || !username || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin VPS')
      if (!ipAddress) setErrorField('ipAddress')
      else if (!username) setErrorField('username')
      else if (!password) setErrorField('password')
      return
    }

    if (!isValidIPv4(ipAddress)) {
      setErrorMessage('Địa chỉ IP không hợp lệ')
      setErrorField('ipAddress')
      return
    }

    setLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      toast.error('Không xác thực được người dùng')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-vps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: ipAddress,
          username,
          password,
          user_id: user.id,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('✅ Thêm VPS thành công!')
        setVpsInfo(data.vps_info)
        // router.push('/dashboard')
      } else {
        toast.error(data.error || 'Lỗi khi thêm VPS')
      }
    } catch (err) {
      toast.error('Không thể kết nối tới server backend')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Thêm VPS mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Địa chỉ IP"
            value={form.ipAddress}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
            className={errorField === 'ipAddress' ? 'border-red-500' : ''}
          />
          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={errorField === 'username' ? 'border-red-500' : ''}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={errorField === 'password' ? 'border-red-500' : ''}
          />

          {errorMessage && (
            <p className="text-sm text-red-500 -mt-2">{errorMessage}</p>
          )}

          <Button onClick={handleAddVPS} disabled={loading} className="w-full">
            {loading ? 'Đang thêm...' : 'Thêm VPS'}
          </Button>

          {vpsInfo && (
            <div className="mt-6 border rounded p-4 bg-gray-50 dark:bg-gray-800 text-sm space-y-1">
              <p><strong>Hệ điều hành:</strong> {vpsInfo.os}</p>
              <p><strong>CPU:</strong> {vpsInfo.cpu}</p>
              <p><strong>RAM:</strong> {vpsInfo.ram}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
