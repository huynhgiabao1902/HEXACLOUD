"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertTriangle, Settings, Mail, Database } from "lucide-react"

export default function DebugAuthPage() {
  const [authConfig, setAuthConfig] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkAuthConfig()
  }, [])

  const checkAuthConfig = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      setAuthConfig({
        supabaseUrl: supabaseUrl || "Not configured",
        supabaseKey: supabaseKey ? "Configured" : "Not configured",
        isConfigured: !!(supabaseUrl && supabaseKey),
      })
    } catch (error) {
      console.error("Error checking auth config:", error)
    }
  }

  const testSignUp = async () => {
    setIsLoading(true)
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = "test123456"

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      setTestResults({
        ...testResults,
        signUp: {
          success: !error,
          error: error?.message,
          data: data,
          user: data?.user,
          session: data?.session,
          needsConfirmation: data?.user && !data?.user?.email_confirmed_at,
        },
      })
    } catch (err: any) {
      setTestResults({
        ...testResults,
        signUp: {
          success: false,
          error: err.message,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      setTestResults({
        ...testResults,
        connection: {
          success: !error,
          error: error?.message,
          data: data,
        },
      })
    } catch (err: any) {
      setTestResults({
        ...testResults,
        connection: {
          success: false,
          error: err.message,
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const StatusIcon = ({ success }: { success: boolean | undefined }) => {
    if (success === undefined) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-6 w-6" />
              Debug Authentication
            </CardTitle>
            <CardDescription>Kiểm tra cấu hình và test các chức năng authentication</CardDescription>
          </CardHeader>
        </Card>

        {/* Configuration Check */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Cấu hình Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <StatusIcon success={!!authConfig?.supabaseUrl && authConfig.supabaseUrl !== "Not configured"} />
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {authConfig?.supabaseUrl || "Loading..."}
                </code>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon success={authConfig?.supabaseKey === "Configured"} />
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {authConfig?.supabaseKey || "Loading..."}
                </code>
              </div>
            </div>

            {!authConfig?.isConfigured && (
              <Alert className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Cấu hình thiếu</AlertTitle>
                <AlertDescription>
                  Vui lòng kiểm tra file .env.local và đảm bảo đã cấu hình đúng NEXT_PUBLIC_SUPABASE_URL và
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Test kết nối Database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={isLoading}>
              <Database className="mr-2 h-4 w-4" />
              Test Connection
            </Button>

            {testResults.connection && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <StatusIcon success={testResults.connection.success} />
                  <span className="font-medium">
                    {testResults.connection.success ? "Kết nối thành công" : "Kết nối thất bại"}
                  </span>
                </div>
                {testResults.connection.error && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{testResults.connection.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign Up Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Test đăng ký User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testSignUp} disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              Test Sign Up
            </Button>

            {testResults.signUp && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <StatusIcon success={testResults.signUp.success} />
                  <span className="font-medium">
                    {testResults.signUp.success ? "Đăng ký thành công" : "Đăng ký thất bại"}
                  </span>
                </div>

                {testResults.signUp.error && (
                  <Alert className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi đăng ký</AlertTitle>
                    <AlertDescription>{testResults.signUp.error}</AlertDescription>
                  </Alert>
                )}

                {testResults.signUp.success && (
                  <div className="space-y-2">
                    <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Thông tin đăng ký</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-1 text-sm">
                          <p>User ID: {testResults.signUp.user?.id}</p>
                          <p>Email: {testResults.signUp.user?.email}</p>
                          <p>
                            Email confirmed: {testResults.signUp.user?.email_confirmed_at ? "Yes" : "No (cần xác thực)"}
                          </p>
                          <p>Session: {testResults.signUp.session ? "Created" : "Not created"}</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {testResults.signUp.needsConfirmation && (
                      <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Cần xác thực email</AlertTitle>
                        <AlertDescription>
                          User đã được tạo nhưng cần xác thực email. Kiểm tra cấu hình email trong Supabase Dashboard.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Khuyến nghị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertTitle>Cấu hình Supabase Dashboard</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Vào Authentication → Settings trong Supabase Dashboard</li>
                    <li>Kiểm tra "Enable email confirmations" (có thể tắt tạm thời cho development)</li>
                    <li>Cấu hình "Site URL" thành http://localhost:3000</li>
                    <li>Thêm http://localhost:3000/** vào "Additional Redirect URLs"</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>Cấu hình Email</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Vào Authentication → Email Templates</li>
                    <li>Kiểm tra template "Confirm signup"</li>
                    <li>Cân nhắc cấu hình SMTP custom trong Settings → Auth</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
