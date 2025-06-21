import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Github, Facebook, AlertTriangle } from "lucide-react"

export default function SocialLoginSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cấu hình Social Login</CardTitle>
            <CardDescription>Hướng dẫn thiết lập đăng nhập qua mạng xã hội với Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lưu ý quan trọng</AlertTitle>
              <AlertDescription>
                Bạn cần có tài khoản nhà phát triển trên các nền tảng mạng xã hội để lấy Client ID và Client Secret.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="github">
              <TabsList className="mb-6">
                <TabsTrigger value="github">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </TabsTrigger>
                <TabsTrigger value="facebook">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </TabsTrigger>
              </TabsList>

              <TabsContent value="github" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bước 1: Tạo OAuth App trên GitHub</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Đăng nhập vào tài khoản GitHub của bạn</li>
                    <li>
                      Truy cập <code>Settings &gt; Developer settings &gt; OAuth Apps</code>
                    </li>
                    <li>Click vào "New OAuth App"</li>
                    <li>Điền thông tin ứng dụng:</li>
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>
                        <strong>Application name:</strong> HexaCloud
                      </li>
                      <li>
                        <strong>Homepage URL:</strong> https://your-website.com
                      </li>
                      <li>
                        <strong>Authorization callback URL:</strong>{" "}
                        <code>https://fwiyuseawydewhyuqjma.supabase.co/auth/v1/callback</code>
                      </li>
                    </ul>
                    <li>Click "Register application"</li>
                    <li>Sau khi tạo, bạn sẽ nhận được Client ID</li>
                    <li>Click "Generate a new client secret" để tạo Client Secret</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bước 2: Cấu hình GitHub Auth trên Supabase</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Đăng nhập vào Supabase Dashboard</li>
                    <li>Chọn project của bạn</li>
                    <li>
                      Vào <code>Authentication &gt; Providers</code>
                    </li>
                    <li>Tìm và bật "GitHub"</li>
                    <li>Nhập Client ID và Client Secret từ GitHub OAuth App</li>
                    <li>Lưu cấu hình</li>
                  </ol>
                </div>
              </TabsContent>

              <TabsContent value="facebook" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bước 1: Tạo ứng dụng trên Facebook Developers</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      Đăng nhập vào{" "}
                      <a href="https://developers.facebook.com" className="text-blue-600 hover:underline">
                        Facebook Developers
                      </a>
                    </li>
                    <li>Click "My Apps" &gt; "Create App"</li>
                    <li>Chọn loại ứng dụng (Consumer hoặc Business)</li>
                    <li>Điền thông tin ứng dụng và tạo</li>
                    <li>Trong dashboard của ứng dụng, thêm sản phẩm "Facebook Login"</li>
                    <li>
                      Trong phần "Settings" &gt; "Basic", bạn sẽ thấy App ID và App Secret (đây chính là Client ID và
                      Client Secret)
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bước 2: Cấu hình Facebook Login</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>
                      Trong phần "Facebook Login" &gt; "Settings", thêm URL redirect:
                      <code className="block mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        https://fwiyuseawydewhyuqjma.supabase.co/auth/v1/callback
                      </code>
                    </li>
                    <li>Lưu thay đổi</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bước 3: Cấu hình Facebook Auth trên Supabase</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Đăng nhập vào Supabase Dashboard</li>
                    <li>Chọn project của bạn</li>
                    <li>
                      Vào <code>Authentication &gt; Providers</code>
                    </li>
                    <li>Tìm và bật "Facebook"</li>
                    <li>Nhập App ID và App Secret từ Facebook Developers</li>
                    <li>Lưu cấu hình</li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Kiểm tra Social Login</h3>
              <p className="mb-4">
                Sau khi hoàn tất cấu hình, bạn có thể kiểm tra tính năng đăng nhập qua mạng xã hội bằng cách:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Truy cập trang đăng nhập hoặc đăng ký của ứng dụng</li>
                <li>Click vào nút đăng nhập qua GitHub hoặc Facebook</li>
                <li>Xác nhận đăng nhập trên nền tảng tương ứng</li>
                <li>Bạn sẽ được chuyển hướng trở lại ứng dụng sau khi đăng nhập thành công</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
