"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Eye, EyeOff, Mail, CheckCircle, AlertCircle } from "lucide-react" // Removed Info icon as it was only for debug
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: form, 2: email confirmation
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  // const [debugInfo, setDebugInfo] = useState<any>(null) // We will still set it, just not display it
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    // setDebugInfo(null) // Reset debug info if needed internally

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp!")
      return
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(), // Thêm .trim() ở đây
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      // Set debug info for internal logging if needed, but it won't be displayed
      // setDebugInfo({
      //   user: data.user,
      //   session: data.session,
      //   error: signUpError,
      //   emailConfirmed: data.user?.email_confirmed_at,
      // })
      console.log("Using emailRedirectTo:", `${window.location.origin}/auth/callback`)

      if (signUpError) throw signUpError

      if (data.user) {
        if (data.session) {
          setMessage(
            "Đăng ký thành công! Email của bạn đã được xác thực (hoặc không yêu cầu xác thực). Đang chuyển hướng...",
          )
          setTimeout(() => router.push("/dashboard"), 2000)
        } else if (data.user && !data.user.email_confirmed_at) {
          setMessage(
            "Đăng ký gần hoàn tất! Chúng tôi ĐÃ GỬI một email xác thực đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư (cả SPAM) và nhấp vào liên kết để kích hoạt tài khoản.",
          )
          setStep(2)
        } else if (data.user && data.user.email_confirmed_at) {
          setMessage("Tài khoản của bạn đã được xác thực. Đang chuyển hướng...")
          setTimeout(() => router.push("/dashboard"), 2000)
        } else {
          setError("Đăng ký thành công nhưng có lỗi xảy ra trong quá trình xác thực. Vui lòng liên hệ hỗ trợ.")
          // setDebugInfo((prev: any) => ({ ...prev, unexpectedCase: true, user: data.user }))
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      if (err.message.includes("User already registered")) {
        setError("Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.")
      } else if (err.message.includes("Invalid email")) {
        setError("Email không hợp lệ. Vui lòng kiểm tra lại địa chỉ email.")
      } else if (err.message.includes("Password should be at least")) {
        setError("Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.")
      } else {
        setError(err.message || "Có lỗi xảy ra khi đăng ký")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmation = async () => {
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (resendError) throw resendError

      setMessage("Đã gửi lại email xác thực!")
    } catch (err: any) {
      console.error("Resend error:", err)
      setError(err.message || "Không thể gửi lại email xác thực")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Kiểm tra email của bạn</CardTitle>
            <CardDescription>
              Chúng tôi đã gửi email xác thực đến: <br />
              <span className="font-medium">{formData.email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để tìm email xác thực từ chúng tôi.
              </p>
            </div>

            {/* Debug Info section has been removed from UI */}

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Sau khi click vào link trong email, bạn sẽ có thể đăng nhập vào tài khoản.</p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Không thấy email?</AlertTitle>
              <AlertDescription className="text-sm space-y-2">
                <p>• Kiểm tra thư mục spam/junk</p>
                <p>• Đợi vài phút (có thể bị delay)</p>
                <p>• Kiểm tra email có đúng không</p>
                <p>• Thử gửi lại email xác thực</p>
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={resendConfirmation} disabled={isLoading} className="w-full">
              {isLoading ? "Đang gửi..." : "Gửi lại email xác thực"}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Đã xác thực email?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Tạo tài khoản HexaCloud</CardTitle>
          <CardDescription>Điền thông tin để tạo tài khoản mới</CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {message && <p className="text-sm text-green-600 text-center">{message}</p>}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" className="rounded" required />
              <Label htmlFor="terms" className="text-sm">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Chính sách bảo mật
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
