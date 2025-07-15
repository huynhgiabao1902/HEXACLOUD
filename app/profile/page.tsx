// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  Save,
  Edit,
  X,
  CheckCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  full_name: string | null
  bio: string | null
  phone: string | null
  location: string | null
  website: string | null
  company: string | null
  avatar_url: string | null
  wallet_balance?: number
  current_plan_id?: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    company: ''
  })

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        toast.error('Lỗi khi tải thông tin cá nhân')
      } else if (profileData) {
        setProfile(profileData)
        setFormData({
          fullName: profileData.full_name || '',
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          website: profileData.website || '',
          company: profileData.company || ''
        })
        setWalletBalance(profileData.wallet_balance || 0)
      }

      // Fetch wallet balance from backend
      fetchWalletBalance(session.access_token)
    } catch (error: any) {
      console.error('Auth error:', error)
      toast.error('Lỗi xác thực')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWalletBalance = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setWalletBalance(result.data.balance)
        }
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          company: formData.company,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setIsEditing(false)
        toast.success('Cập nhật thông tin thành công!')
      }
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Đăng xuất thành công')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">Tài khoản của tôi</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {(formData.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="text-xl font-bold">
                      {formData.fullName || 'Chưa có tên'}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>

                  {user?.email_confirmed_at && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã xác thực
                    </Badge>
                  )}

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/wallet')}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Ví của tôi
                      <span className="ml-auto text-sm font-medium">
                        {walletBalance.toLocaleString('vi-VN')}đ
                      </span>
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/pricing')}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gói dịch vụ
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/servers')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Quản lý Server
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>
                      Quản lý thông tin cá nhân của bạn
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false)
                            if (profile) {
                              setFormData({
                                fullName: profile.full_name || '',
                                bio: profile.bio || '',
                                phone: profile.phone || '',
                                location: profile.location || '',
                                website: profile.website || '',
                                company: profile.company || ''
                              })
                            }
                          }}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Lưu
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      <User className="h-4 w-4 inline mr-2" />
                      Họ và tên
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+84 xxx xxx xxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Địa chỉ
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Thành phố, Quốc gia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">
                      <Building className="h-4 w-4 inline mr-2" />
                      Công ty
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tên công ty"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                  />
                </div>

                <Separator />

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tham gia: {new Date(user?.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}