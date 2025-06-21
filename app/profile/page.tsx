"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, Key, LogOut, Loader2, Upload, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react" // Corrected CheckCircleIcon to CheckCircle
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  // const [profile, setProfile] = useState<Profile | null>(null); // Not strictly needed if only using fullName and avatarUrl states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const getUser = async () => {
    console.log("Attempting to get user and profile...")
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.log("No session found, redirecting to login.")
      router.push("/login")
      return
    }
    setUser(session.user)
    console.log("User data:", session.user)

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116: 'single' row not found
      console.error("Error fetching profile:", profileError)
      setError("Lỗi khi tải thông tin cá nhân: " + profileError.message)
    } else if (profileData) {
      console.log("Fetched profile data:", profileData)
      // setProfile(profileData);
      setFullName(profileData.full_name || "")
      setAvatarUrl(profileData.avatar_url || "")
    } else {
      console.log("No profile data found for user, full_name will be empty.")
      setFullName("") // Ensure fullName is empty if no profile
      setAvatarUrl("")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getUser()
  }, [router])

  const saveProfile = async () => {
    if (!user) {
      setError("Người dùng không tồn tại. Vui lòng đăng nhập lại.")
      return
    }
    setIsSaving(true)
    setMessage("")
    setError("")
    console.log(
      `Attempting to save profile for user ${user.id} with fullName: "${fullName}", avatarUrl: "${avatarUrl}"`,
    )

    try {
      const {
        data: upsertData,
        error: upsertError,
        count,
      } = await supabase
        .from("profiles")
        .upsert({
          id: user.id, // Primary key, must be included for upsert
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select() // Ask Supabase to return the upserted row(s)

      console.log("Supabase upsert response:", { upsertData, upsertError, count })

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError)
        throw upsertError
      }

      if (upsertData && upsertData.length > 0) {
        console.log("Profile successfully upserted/updated in DB. New data:", upsertData[0])
        // Update local state directly from the response to ensure UI consistency
        setFullName(upsertData[0].full_name || "")
        setAvatarUrl(upsertData[0].avatar_url || "")
        setMessage("Thông tin cá nhân đã được cập nhật thành công!")
      } else {
        // This case should ideally not happen with .select() if upsert was successful
        console.warn("Upsert operation did not return data, but no error reported. Re-fetching.")
        await getUser() // Fallback to re-fetch if data isn't returned
        setMessage("Thông tin cá nhân đã được cập nhật thành công! (re-fetched)")
      }
    } catch (err: any) {
      console.error("Error in saveProfile:", err)
      setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp!")
      return
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!")
      return
    }
    setIsSaving(true)
    setMessage("")
    setError("")
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMessage("Mật khẩu đã được cập nhật thành công!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật mật khẩu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    setIsSaving(true)
    setMessage("")
    setError("")
    console.log(`Uploading avatar to: ${filePath}`)

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })
    if (uploadError) {
      console.error("Avatar upload error:", uploadError)
      setError("Lỗi khi tải ảnh lên: " + uploadError.message)
      setIsSaving(false)
      return
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    console.log("Avatar public URL:", urlData.publicUrl)
    setAvatarUrl(urlData.publicUrl) // Update state for immediate display

    // Automatically save profile with new avatar URL
    try {
      console.log(`Updating profile with new avatar URL: ${urlData.publicUrl}`)
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
          full_name: fullName, // also send current full_name to avoid it being overwritten if it's not part of the upsert payload schema
        })
        .eq("id", user.id) // .eq is not needed for upsert if id is in the payload

      if (updateError) {
        console.error("Error updating profile with new avatar:", updateError)
        throw updateError
      }
      setMessage("Ảnh đại diện đã được cập nhật!")
    } catch (err: any) {
      console.error("Error saving avatar URL to profile:", err)
      setError("Lỗi cập nhật ảnh đại diện trong profile: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Quản lý tài khoản</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân và bảo mật</CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  Thông tin cá nhân
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Key className="mr-2 h-4 w-4" />
                  Bảo mật
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </TabsTrigger>
              </TabsList>

              {message && (
                <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700">
                  <CheckCircle className="h-4 w-4" /> {/* Corrected Icon */}
                  <AlertTitle>Thành công</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  {" "}
                  {/* Use destructive variant for errors */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="profile" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4 md:w-1/3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName || user?.email} />
                      <AvatarFallback>{(fullName || user?.email)?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span>{isSaving && avatarUrl ? "Đang tải..." : "Thay đổi ảnh"}</span>
                        </div>
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isSaving}
                        />
                      </Label>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="fullName">Họ và tên đầy đủ</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên của bạn"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email} disabled />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email không thể thay đổi.</p>
                    </div>
                    <div>
                      <Label>Ngày tạo tài khoản</Label>
                      <Input
                        type="text"
                        value={
                          user?.created_at
                            ? new Date(user.created_at).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"
                        }
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Trạng thái xác thực email</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        {user?.email_confirmed_at ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">
                            <CheckCircle className="mr-1.5 h-4 w-4" /> {/* Corrected Icon */}
                            Đã xác thực
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100">
                            <AlertCircle className="mr-1.5 h-4 w-4" />
                            Chưa xác thực
                          </span>
                        )}
                      </div>
                    </div>
                    <Button onClick={saveProfile} disabled={isSaving} className="w-full md:w-auto">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Để trống nếu không đổi mật khẩu OAuth"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <Button onClick={updatePassword} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật mật khẩu"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Thông báo qua email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý tùy chọn nhận email thông báo.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Bật</span>
                  </label>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Tính năng sắp ra mắt</AlertTitle>
                  <AlertDescription>
                    Phần cài đặt chi tiết hơn sẽ được bổ sung trong các bản cập nhật tới.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
