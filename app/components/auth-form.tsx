"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

// Enum để quản lý trạng thái form
enum AuthMode {
  SignIn = "signIn",
  SignUp = "signUp",
  ForgotPassword = "forgotPassword",
  UpdatePassword = "updatePassword",
}

export default function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(AuthMode.SignIn)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuthAction = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      if (mode === AuthMode.SignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (signUpError) throw signUpError

        setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.")
        toast.success("Đăng ký thành công!", {
          description: "Vui lòng kiểm tra email để xác nhận tài khoản."
        })

      } else if (mode === AuthMode.SignIn) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        setMessage("Đăng nhập thành công! Đang chuyển hướng...")
        toast.success("Đăng nhập thành công!")

        // Chuyển hướng sau khi đăng nhập thành công
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)

      } else if (mode === AuthMode.ForgotPassword) {
        const { error: forgotPasswordError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (forgotPasswordError) throw forgotPasswordError

        setMessage("Nếu email tồn tại, bạn sẽ nhận được một email hướng dẫn đặt lại mật khẩu.")
        toast.success("Email đặt lại mật khẩu đã được gửi!")
      }

    } catch (err: any) {
      const errorMessage = err.error_description || err.message || "Có lỗi xảy ra"
      setError(errorMessage)
      toast.error("Lỗi", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setMessage("Mật khẩu đã được cập nhật thành công! Bạn có thể đăng nhập ngay.")
      toast.success("Mật khẩu đã được cập nhật thành công!")
      setMode(AuthMode.SignIn)

    } catch (err: any) {
      const errorMessage = err.error_description || err.message || "Có lỗi xảy ra"
      setError(errorMessage)
      toast.error("Lỗi", {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  // Form cập nhật mật khẩu
  if (mode === AuthMode.UpdatePassword) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu mới của bạn.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  // Form chính (Sign In, Sign Up, Forgot Password)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === AuthMode.SignIn && "Đăng nhập"}
            {mode === AuthMode.SignUp && "Đăng ký"}
            {mode === AuthMode.ForgotPassword && "Quên mật khẩu"}
          </CardTitle>
          <CardDescription>
            {mode === AuthMode.SignIn && "Nhập email và mật khẩu để đăng nhập."}
            {mode === AuthMode.SignUp && "Tạo tài khoản mới."}
            {mode === AuthMode.ForgotPassword && "Nhập email để nhận hướng dẫn đặt lại mật khẩu."}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAuthAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Chỉ hiện trường mật khẩu khi KHÔNG phải ForgotPassword */}
            {mode !== AuthMode.ForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : (
                mode === AuthMode.SignIn ? "Đăng nhập" :
                mode === AuthMode.SignUp ? "Đăng ký" :
                "Gửi yêu cầu"
              )}
            </Button>

            {/* Navigation buttons */}
            <div className="flex flex-col space-y-2 w-full">
              {mode === AuthMode.SignIn && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode(AuthMode.SignUp)}
                    className="text-sm"
                  >
                    Chưa có tài khoản? Đăng ký
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode(AuthMode.ForgotPassword)}
                    className="text-sm"
                  >
                    Quên mật khẩu?
                  </Button>
                </>
              )}

              {mode === AuthMode.SignUp && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode(AuthMode.SignIn)}
                  className="text-sm"
                >
                  Đã có tài khoản? Đăng nhập
                </Button>
              )}

              {mode === AuthMode.ForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode(AuthMode.SignIn)}
                  className="text-sm"
                >
                  Quay lại Đăng nhập
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}