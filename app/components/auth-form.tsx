"use client"

import { useState, type FormEvent } from "react"
import { supabase } from "@/lib/supabase" // Đảm bảo đường dẫn đúng
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Enum để quản lý trạng thái form
enum AuthMode {
  SignIn = "signIn",
  SignUp = "signUp",
  ForgotPassword = "forgotPassword",
  UpdatePassword = "updatePassword", // Thêm trạng thái này nếu cần form riêng
}

export default function AuthForm() {
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
          // Supabase tự động gửi email xác nhận nếu bạn bật "Confirm email" trong settings
          // Để có luồng OTP tùy chỉnh hơn, bạn có thể cần xem xét options.emailRedirectTo
        })
        if (signUpError) throw signUpError
        setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.")
        // Nếu bạn muốn người dùng nhập OTP ngay trên trang, bạn cần một luồng khác
        // Supabase mặc định sẽ gửi link xác nhận.
      } else if (mode === AuthMode.SignIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        setMessage("Đăng nhập thành công! Đang chuyển hướng...")
        // Chuyển hướng người dùng sau khi đăng nhập thành công, ví dụ:
        window.location.href = "/dashboard" // Hoặc sử dụng Next.js Router
      } else if (mode === AuthMode.ForgotPassword) {
        const { error: forgotPasswordError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`, // Trang để người dùng nhập mật khẩu mới
        })
        if (forgotPasswordError) throw forgotPasswordError
        setMessage("Nếu email tồn tại, bạn sẽ nhận được một email hướng dẫn đặt lại mật khẩu.")
      }
      // Lưu ý: Việc xử lý reset password (sau khi click link trong email) thường diễn ra trên một trang riêng
      // nơi người dùng nhập mật khẩu mới. Supabase client SDK có hàm `updateUser` để làm điều này.
    } catch (err: any) {
      setError(err.error_description || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    setError("")
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setMessage("Đăng xuất thành công.")
      // Chuyển hướng hoặc cập nhật UI
      window.location.href = "/login"
    } catch (err: any) {
      setError(err.error_description || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Hàm này sẽ được gọi trên trang reset-password khi người dùng đã click link từ email
  // và đang ở trên trang /reset-password (hoặc trang bạn đã cấu hình redirectTo)
  // Bạn cần lấy access_token từ URL (Supabase tự động thêm vào khi redirect)
  // và sau đó cho người dùng nhập mật khẩu mới.
  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    // Giả sử bạn đã có access_token từ URL fragment (hash)
    // Ví dụ: useEffect(() => { const hash = window.location.hash; ... parse hash ... })
    // Và người dùng đã nhập mật khẩu mới vào state `password`

    // Trong thực tế, bạn sẽ cần lấy session từ Supabase sau khi người dùng click link
    // supabase.auth.onAuthStateChange((event, session) => {
    //   if (event === 'PASSWORD_RECOVERY' && session) {
    //     // Bây giờ bạn có session, có thể cho người dùng nhập mật khẩu mới
    //   }
    // })

    // Hoặc, nếu bạn đã có access_token và refresh_token từ URL sau khi redirect
    // const hashParams = new URLSearchParams(window.location.hash.substring(1)); // #access_token=...&refresh_token=...
    // const accessToken = hashParams.get('access_token');
    // const refreshToken = hashParams.get('refresh_token');
    // if (accessToken && refreshToken) {
    //   await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    // }

    // Sau khi có session hợp lệ (người dùng đã click link từ email)
    // thì mới gọi updateUser
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password: password })
      if (updateError) throw updateError
      setMessage("Mật khẩu đã được cập nhật thành công! Bạn có thể đăng nhập ngay.")
      setMode(AuthMode.SignIn) // Chuyển về form đăng nhập
    } catch (err: any) {
      setError(err.error_description || err.message)
    } finally {
      setLoading(false)
    }
  }

  // Component này cần được render trên một trang riêng, ví dụ /update-password
  // và chỉ hiển thị khi có dấu hiệu người dùng vừa từ email reset password tới.
  // Ví dụ, bạn có thể kiểm tra URL hash để lấy access_token và refresh_token
  // mà Supabase gửi kèm khi người dùng click vào link reset password.
  // Sau đó dùng supabase.auth.setSession({ access_token, refresh_token })
  // rồi mới cho người dùng nhập mật khẩu mới và gọi supabase.auth.updateUser({ password: newPassword })

  // Trong ví dụ này, để đơn giản, tôi sẽ thêm một nút để chuyển sang chế độ "UpdatePassword"
  // nhưng luồng thực tế sẽ phức tạp hơn.

  if (mode === AuthMode.UpdatePassword) {
    return (
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
    )
  }

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
            {mode !== AuthMode.ForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={mode !== AuthMode.ForgotPassword}
                />
              </div>
            )}
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && "Đang xử lý..."}
              {!loading && mode === AuthMode.SignIn && "Đăng nhập"}
              {!loading && mode === AuthMode.SignUp && "Đăng ký"}
              {!loading && mode === AuthMode.ForgotPassword && "Gửi yêu cầu"}
            </Button>

            {mode === AuthMode.SignIn && (
              <>
                <Button variant="link" onClick={() => setMode(AuthMode.SignUp)}>
                  Chưa có tài khoản? Đăng ký
                </Button>
                <Button variant="link" onClick={() => setMode(AuthMode.ForgotPassword)}>
                  Quên mật khẩu?
                </Button>
              </>
            )}
            {mode === AuthMode.SignUp && (
              <Button variant="link" onClick={() => setMode(AuthMode.SignIn)}>
                Đã có tài khoản? Đăng nhập
              </Button>
            )}
            {mode === AuthMode.ForgotPassword && (
              <Button variant="link" onClick={() => setMode(AuthMode.SignIn)}>
                Quay lại Đăng nhập
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
      {/* Nút đăng xuất ví dụ - bạn sẽ đặt nó ở nơi hợp lý hơn, ví dụ header khi người dùng đã đăng nhập */}
      <div className="mt-4">
        <Button onClick={handleLogout} variant="outline" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng xuất (Test)"}
        </Button>
        {/* Nút này chỉ để demo chuyển sang form update password, luồng thực tế sẽ khác */}
        <Button variant="link" onClick={() => setMode(AuthMode.UpdatePassword)} className="ml-2">
          Demo: Tới trang Update Password
        </Button>
      </div>
    </div>
  )
}
