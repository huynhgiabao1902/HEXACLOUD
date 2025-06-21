"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")
        const type = hashParams.get("type")

        if (type === "signup" && accessToken && refreshToken) {
          // Set the session
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("Error setting session:", sessionError)
            setStatus("error")
            setMessage(`Lỗi khi thiết lập session: ${sessionError.message}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`)
            return
          }

          // Sau khi setSession, lấy thông tin user mới nhất để kiểm tra email_confirmed_at
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()

          if (userError) {
            console.error("Error fetching user after setting session:", userError)
            setStatus("error")
            setMessage(`Lỗi khi lấy thông tin người dùng: ${userError.message}.`)
            return
          }

          if (user && user.email_confirmed_at) {
            setStatus("success")
            setMessage("Email đã được xác thực thành công! Đang chuyển hướng đến dashboard...")
            setTimeout(() => {
              router.push("/dashboard")
            }, 2500)
          } else if (user) {
            // Email chưa được xác thực, có thể là do luồng hoặc cấu hình
            // Hoặc có thể email confirmation bị tắt trong Supabase settings
            console.warn("User session set, but email_confirmed_at is still null/false for user:", user.email)
            setStatus("success") // Vẫn coi là success vì session đã được set
            setMessage(
              "Xác thực thành công, đang đăng nhập... Nếu email confirmation được bật, trạng thái sẽ sớm cập nhật.",
            )
            setTimeout(() => {
              router.push("/dashboard") // Chuyển hướng đến dashboard, onAuthStateChange sẽ xử lý tiếp
            }, 2500)
          } else {
            // Không có user sau khi set session, đây là lỗi
            setStatus("error")
            setMessage("Không thể xác thực người dùng sau khi xử lý callback. Vui lòng thử đăng nhập.")
          }
        } else if (type === "recovery" && accessToken && refreshToken) {
          // Password recovery
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) throw error

          router.push("/reset-password")
        } else {
          // Check if user is already authenticated
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            router.push("/dashboard")
          } else {
            setStatus("error")
            setMessage("Link xác thực không hợp lệ hoặc đã hết hạn.")
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage(error.message || "Có lỗi xảy ra khi xác thực email.")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {status === "loading" && (
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-100 dark:bg-red-900 w-16 h-16 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Đang xác thực..."}
            {status === "success" && "Xác thực thành công!"}
            {status === "error" && "Xác thực thất bại"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        {status === "error" && (
          <CardContent className="text-center">
            <div className="space-y-4">
              <Button onClick={() => router.push("/register")} className="w-full">
                Thử đăng ký lại
              </Button>
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                Đăng nhập
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
