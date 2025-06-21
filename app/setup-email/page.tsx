import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SetupEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Mail className="mr-2 h-6 w-6" />
              Cấu hình Email cho Supabase
            </CardTitle>
            <CardDescription>Hướng dẫn khắc phục vấn đề email xác thực không được gửi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Vấn đề hiện tại</AlertTitle>
              <AlertDescription>
                Supabase email service mặc định có rate limits nghiêm ngặt và không phù hợp cho production. Đây là lý do
                email xác thực không được gửi.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="quick-fix">
              <TabsList className="mb-6">
                <TabsTrigger value="quick-fix">Giải pháp nhanh</TabsTrigger>
                <TabsTrigger value="smtp-setup">Cấu hình SMTP</TabsTrigger>
                <TabsTrigger value="production">Production Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="quick-fix" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tắt Email Confirmation (Development)</CardTitle>
                    <CardDescription>
                      Giải pháp nhanh nhất để test authentication trong quá trình development
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Khuyến nghị cho Development</AlertTitle>
                      <AlertDescription>
                        Tạm thời tắt email confirmation để test nhanh, sau đó cấu hình SMTP cho production.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <h4 className="font-medium">Các bước thực hiện:</h4>
                      <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                        <li>
                          Trong Supabase Dashboard, vào <strong>Authentication → Settings</strong>
                        </li>
                        <li>
                          Tìm phần <strong>"User Signups"</strong>
                        </li>
                        <li>
                          Tắt <strong>"Enable email confirmations"</strong>
                        </li>
                        <li>
                          Click <strong>"Save"</strong>
                        </li>
                        <li>Bây giờ user sẽ được tự động xác thực sau khi đăng ký</li>
                      </ol>
                    </div>

                    <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Lưu ý bảo mật</AlertTitle>
                      <AlertDescription>
                        Chỉ tắt email confirmation trong development. Production luôn phải bật để bảo mật.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="smtp-setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình SMTP với Gmail</CardTitle>
                    <CardDescription>
                      Sử dụng Gmail SMTP để gửi email xác thực (miễn phí và dễ cấu hình)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Bước 1: Tạo App Password cho Gmail</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                        <li>Đăng nhập vào Gmail của bạn</li>
                        <li>
                          Vào <strong>Google Account Settings</strong>
                        </li>
                        <li>
                          Chọn <strong>Security → 2-Step Verification</strong>
                        </li>
                        <li>Bật 2-Step Verification nếu chưa có</li>
                        <li>
                          Vào <strong>App passwords</strong>
                        </li>
                        <li>Tạo password mới cho "Mail"</li>
                        <li>Lưu lại password này (16 ký tự)</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Bước 2: Cấu hình SMTP trong Supabase</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                        <li>
                          Vào <strong>Settings → Auth</strong> trong Supabase Dashboard
                        </li>
                        <li>
                          Scroll xuống phần <strong>"SMTP Settings"</strong>
                        </li>
                        <li>
                          Bật <strong>"Enable custom SMTP"</strong>
                        </li>
                        <li>Điền thông tin sau:</li>
                      </ol>

                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                        <div>
                          <strong>Host:</strong> smtp.gmail.com
                        </div>
                        <div>
                          <strong>Port:</strong> 587
                        </div>
                        <div>
                          <strong>Username:</strong> your-email@gmail.com
                        </div>
                        <div>
                          <strong>Password:</strong> [App Password 16 ký tự]
                        </div>
                        <div>
                          <strong>Sender name:</strong> HexaCloud
                        </div>
                        <div>
                          <strong>Sender email:</strong> your-email@gmail.com
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình SMTP với SendGrid</CardTitle>
                    <CardDescription>SendGrid cung cấp 100 emails/ngày miễn phí</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Bước 1: Tạo tài khoản SendGrid</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                        <li>
                          Đăng ký tại{" "}
                          <a href="https://sendgrid.com" className="text-blue-600 hover:underline">
                            sendgrid.com
                          </a>
                        </li>
                        <li>Xác thực email và hoàn tất setup</li>
                        <li>
                          Vào <strong>Settings → API Keys</strong>
                        </li>
                        <li>Tạo API Key mới với quyền "Mail Send"</li>
                        <li>Lưu lại API Key</li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Bước 2: Cấu hình trong Supabase</h4>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                        <div>
                          <strong>Host:</strong> smtp.sendgrid.net
                        </div>
                        <div>
                          <strong>Port:</strong> 587
                        </div>
                        <div>
                          <strong>Username:</strong> apikey
                        </div>
                        <div>
                          <strong>Password:</strong> [SendGrid API Key]
                        </div>
                        <div>
                          <strong>Sender name:</strong> HexaCloud
                        </div>
                        <div>
                          <strong>Sender email:</strong> your-verified-email@domain.com
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="production" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình Production</CardTitle>
                    <CardDescription>Checklist đầy đủ cho production environment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Production Checklist</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>✅ Cấu hình SMTP custom (không dùng Supabase default)</li>
                            <li>✅ Bật email confirmations</li>
                            <li>✅ Cấu hình domain và DNS records</li>
                            <li>✅ Setup email templates phù hợp</li>
                            <li>✅ Test email delivery</li>
                            <li>✅ Monitor email metrics</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <h4 className="font-medium">URL Configuration</h4>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                          <div>
                            <strong>Site URL:</strong> https://yourdomain.com
                          </div>
                          <div>
                            <strong>Redirect URLs:</strong>
                          </div>
                          <ul className="list-disc list-inside ml-4">
                            <li>https://yourdomain.com/auth/callback</li>
                            <li>https://yourdomain.com/reset-password</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Email Templates</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Customize email templates trong Authentication → Email Templates:
                        </p>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          <li>Confirm signup</li>
                          <li>Reset password</li>
                          <li>Magic link</li>
                          <li>Change email address</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button>Test đăng ký</Button>
              </Link>
              <Button asChild variant="outline">
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Mở Supabase Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
