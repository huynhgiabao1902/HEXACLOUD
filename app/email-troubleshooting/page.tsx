import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, AlertTriangle, CheckCircle, Settings, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function EmailTroubleshootingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Mail className="mr-2 h-6 w-6" />
              Khắc phục sự cố Email xác thực
            </CardTitle>
            <CardDescription>
              Hướng dẫn giải quyết các vấn đề liên quan đến email xác thực không được gửi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Vấn đề phổ biến</AlertTitle>
              <AlertDescription>
                Email xác thực có thể không được gửi do cấu hình Supabase chưa đúng hoặc các vấn đề về email provider.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Kiểm tra cấu hình Supabase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Bước 1: Kiểm tra Authentication Settings</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>Đăng nhập vào Supabase Dashboard</li>
                      <li>
                        Vào <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Authentication → Settings</code>
                      </li>
                      <li>
                        Kiểm tra <strong>"Enable email confirmations"</strong> đã được bật
                      </li>
                      <li>
                        Kiểm tra <strong>"Site URL"</strong> đã được cấu hình đúng (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">http://localhost:3000</code> cho
                        development)
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Bước 2: Cấu hình Email Templates</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>
                        Vào{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                          Authentication → Email Templates
                        </code>
                      </li>
                      <li>Kiểm tra template "Confirm signup" đã được cấu hình</li>
                      <li>
                        Đảm bảo có{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{{ .ConfirmationURL }}"}</code>{" "}
                        trong template
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">2. Cấu hình SMTP (Khuyến nghị)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertTitle>Tại sao cần SMTP?</AlertTitle>
                    <AlertDescription>
                      Supabase mặc định sử dụng email service có giới hạn. Để đảm bảo email được gửi ổn định, nên cấu
                      hình SMTP riêng.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Các SMTP provider phổ biến:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                      <li>
                        <strong>Gmail SMTP:</strong> Miễn phí, dễ cấu hình
                      </li>
                      <li>
                        <strong>SendGrid:</strong> 100 emails/ngày miễn phí
                      </li>
                      <li>
                        <strong>Mailgun:</strong> 5,000 emails/tháng miễn phí
                      </li>
                      <li>
                        <strong>Amazon SES:</strong> Giá rẻ, độ tin cậy cao
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Cấu hình SMTP trong Supabase:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>
                        Vào <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Settings → Auth</code>
                      </li>
                      <li>Scroll xuống phần "SMTP Settings"</li>
                      <li>Bật "Enable custom SMTP"</li>
                      <li>Điền thông tin SMTP của provider bạn chọn</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">3. Kiểm tra Rate Limiting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">Supabase có giới hạn số lượng email có thể gửi trong một khoảng thời gian:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Tối đa 3 emails/phút cho mỗi user</li>
                    <li>Tối đa 30 emails/giờ cho toàn bộ project</li>
                  </ul>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nếu vượt quá giới hạn, email sẽ không được gửi. Hãy đợi và thử lại sau.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">4. Kiểm tra Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Xem logs trong Supabase:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>
                        Vào <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Logs → Auth</code>
                      </li>
                      <li>Tìm kiếm các log liên quan đến email</li>
                      <li>Kiểm tra có error nào không</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">5. Giải pháp tạm thời</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Tắt email confirmation tạm thời</AlertTitle>
                    <AlertDescription>
                      Trong quá trình development, bạn có thể tắt email confirmation để test nhanh.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Cách tắt email confirmation:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                      <li>
                        Vào <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Authentication → Settings</code>
                      </li>
                      <li>Tắt "Enable email confirmations"</li>
                      <li>User sẽ được tự động xác thực sau khi đăng ký</li>
                    </ol>
                  </div>

                  <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Lưu ý:</strong> Chỉ nên tắt trong development. Production luôn nên bật email confirmation.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button>Thử đăng ký lại</Button>
              </Link>
              <Button asChild variant="outline">
                <a href="https://supabase.com/docs/guides/auth/auth-email" target="_blank" rel="noopener noreferrer">
                  Xem tài liệu Supabase
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
