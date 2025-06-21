"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Copy, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SMTPConfigGuidePage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Mail className="mr-2 h-6 w-6" />
              Hướng dẫn cấu hình SMTP trong Supabase
            </CardTitle>
            <CardDescription>Điền thông tin SMTP vào form bạn đang mở để hoàn tất cấu hình email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Bạn đang ở đúng chỗ!</AlertTitle>
              <AlertDescription>
                Form SMTP Settings đã được mở. Hãy chọn một trong các provider dưới đây và điền thông tin tương ứng.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="gmail">
              <TabsList className="mb-6">
                <TabsTrigger value="gmail">Gmail SMTP</TabsTrigger>
                <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
                <TabsTrigger value="mailgun">Mailgun</TabsTrigger>
              </TabsList>

              <TabsContent value="gmail" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình Gmail SMTP</CardTitle>
                    <CardDescription>Sử dụng Gmail để gửi email (miễn phí, giới hạn 500 emails/ngày)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Cần App Password</AlertTitle>
                      <AlertDescription>
                        Bạn cần tạo App Password cho Gmail trước. Nếu chưa có, hãy làm theo hướng dẫn bên dưới.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 1: Tạo App Password cho Gmail</h4>
                      <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                        <li>Đăng nhập vào Gmail của bạn</li>
                        <li>
                          Vào{" "}
                          <a
                            href="https://myaccount.google.com/security"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Google Account Security
                            <ExternalLink className="inline h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Bật "2-Step Verification" nếu chưa có</li>
                        <li>
                          Vào{" "}
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            App passwords
                            <ExternalLink className="inline h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Chọn "Mail" và tạo password mới</li>
                        <li>Lưu lại password 16 ký tự (dạng: xxxx xxxx xxxx xxxx)</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 2: Điền thông tin vào form Supabase</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender email:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("your-email@gmail.com")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">your-email@gmail.com</code>
                            <p className="text-xs text-gray-500 mt-1">Thay bằng email Gmail của bạn</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender name:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("HexaCloud")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">HexaCloud</code>
                            <p className="text-xs text-gray-500 mt-1">Tên hiển thị trong email</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Host:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("smtp.gmail.com")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">smtp.gmail.com</code>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Port number:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("587")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">587</code>
                            <p className="text-xs text-gray-500 mt-1">Thay đổi từ 465 thành 587</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Username:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("your-email@gmail.com")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">your-email@gmail.com</code>
                            <p className="text-xs text-gray-500 mt-1">Cùng với sender email</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Password:</strong>
                            </div>
                            <code className="text-sm">App Password 16 ký tự</code>
                            <p className="text-xs text-gray-500 mt-1">Không phải password Gmail thường</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sendgrid" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình SendGrid SMTP</CardTitle>
                    <CardDescription>SendGrid cung cấp 100 emails/ngày miễn phí với độ tin cậy cao</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 1: Tạo tài khoản SendGrid</h4>
                      <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                        <li>
                          Đăng ký tại{" "}
                          <a
                            href="https://signup.sendgrid.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            SendGrid
                            <ExternalLink className="inline h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Xác thực email và hoàn tất onboarding</li>
                        <li>Vào Settings → API Keys</li>
                        <li>Tạo API Key mới với quyền "Mail Send"</li>
                        <li>Lưu lại API Key (bắt đầu với SG.)</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 2: Điền thông tin vào form Supabase</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender email:</strong>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard("noreply@yourdomain.com")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">noreply@yourdomain.com</code>
                            <p className="text-xs text-gray-500 mt-1">Email đã verify trong SendGrid</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender name:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("HexaCloud")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">HexaCloud</code>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Host:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("smtp.sendgrid.net")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">smtp.sendgrid.net</code>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Port number:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("587")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">587</code>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Username:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("apikey")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">apikey</code>
                            <p className="text-xs text-gray-500 mt-1">Luôn là "apikey"</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Password:</strong>
                            </div>
                            <code className="text-sm">SendGrid API Key</code>
                            <p className="text-xs text-gray-500 mt-1">API Key từ SendGrid (SG.xxx)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mailgun" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cấu hình Mailgun SMTP</CardTitle>
                    <CardDescription>Mailgun cung cấp 5,000 emails/tháng miễn phí trong 3 tháng đầu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 1: Tạo tài khoản Mailgun</h4>
                      <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                        <li>
                          Đăng ký tại{" "}
                          <a
                            href="https://signup.mailgun.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Mailgun
                            <ExternalLink className="inline h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Xác thực email và phone number</li>
                        <li>Vào Sending → Domain settings</li>
                        <li>Sử dụng sandbox domain hoặc add domain riêng</li>
                        <li>Lấy SMTP credentials từ domain settings</li>
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Bước 2: Điền thông tin vào form Supabase</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender email:</strong>
                            </div>
                            <code className="text-sm">noreply@your-domain.mailgun.org</code>
                            <p className="text-xs text-gray-500 mt-1">Domain từ Mailgun</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Sender name:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("HexaCloud")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">HexaCloud</code>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Host:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("smtp.mailgun.org")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">smtp.mailgun.org</code>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Port number:</strong>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("587")}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <code className="text-sm">587</code>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Username:</strong>
                            </div>
                            <code className="text-sm">postmaster@your-domain.mailgun.org</code>
                            <p className="text-xs text-gray-500 mt-1">Từ Mailgun domain settings</p>
                          </div>

                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <strong className="text-sm">Password:</strong>
                            </div>
                            <code className="text-sm">Mailgun SMTP Password</code>
                            <p className="text-xs text-gray-500 mt-1">Từ domain settings</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sau khi điền xong</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Click "Save changes" trong form Supabase</li>
                  <li>Đợi vài giây để Supabase test connection</li>
                  <li>Nếu thành công, bạn sẽ thấy thông báo xanh</li>
                  <li>Bây giờ có thể test đăng ký với email confirmation</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center space-x-4">
              <Button asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  Quay lại Supabase Dashboard
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
