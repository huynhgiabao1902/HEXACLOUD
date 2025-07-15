"use client"

import type React from "react"
import type { Session, AuthChangeEvent } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Cloud,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("Đang kiểm tra link đặt lại mật khẩu...")
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsPageLoading(true)

    // Bước 1: Lấy session nếu có từ hash URL
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setIsValidSession(true)
        setMessage("Bạn có thể đặt mật khẩu mới.")
        setIsPageLoading(false)
      }
    })

    // Bước 2: Theo dõi sự kiện xác thực từ Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setIsValidSession(true)
        setMessage("Bạn có thể đặt mật khẩu mới.")
        setError("")
        setIsPageLoading(false)
      }
    })

    // Bước 3: fallback nếu token chưa được decode
    const hash = window.location.hash
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.slice(1))
      const token = params.get("access_token")
      const refresh = params.get("refresh_token")

      if (token && refresh) {
        supabase.auth.setSession({ access_token: token, refresh_token: refresh }).then(({ error }: { error: any }) => {
          if (!error) {
            setIsValidSession(true)
            setMessage("Bạn có thể đặt lại mật khẩu.")
            setIsPageLoading(false)
          }
        })
      }
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    setIsLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message || "Có lỗi xảy ra khi đặt lại mật khẩu")
    } else {
      setIsSuccess(true)
      setMessage("Mật khẩu đã được đặt lại thành công!")
    }
    setIsLoading(false)
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <CardTitle className="text-2xl font-bold">Đang kiểm tra...</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Mật khẩu đã được đặt lại!</CardTitle>
            <CardDescription>Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={() => router.push("/login")} className="w-full">
              Đăng nhập ngay
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Link không hợp lệ</CardTitle>
            <CardDescription>{message || "Link đã hết hạn hoặc không hợp lệ."}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full">Yêu cầu link mới</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
          <CardDescription>{message || "Tạo mật khẩu mới cho tài khoản của bạn"}</CardDescription>
        </CardHeader>

        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}