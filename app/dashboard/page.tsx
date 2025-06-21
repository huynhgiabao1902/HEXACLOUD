// ✅ Frontend: Dashboard Page (dashboard/page.tsx)
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Server, Database, LogOut, Terminal, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [serverStats, setServerStats] = useState({ storage: '100 GB', active: 0 })
  const [vpsList, setVpsList] = useState<any[]>([])
  const router = useRouter()
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (!session || sessionError) {
        toast.error('Phiên đăng nhập đã hết hạn')
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      fetchVpsData(session.user.id)
      setIsLoading(false)
    }

    getUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchVpsData = async (uid: string) => {
    const { data, count } = await supabase
      .from('vps')
      .select('*', { count: 'exact' })
      .eq('user_id', uid)

    setServerStats((prev) => ({ ...prev, active: count || 0 }))
    setVpsList(data || [])
  }

  const handleAddVPS = () => {
    router.push('/add-vps')
  }

  const handleDeleteVps = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa VPS này?')) {
      await supabase.from('vps').delete().eq('id', id)
      fetchVpsData(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleToggleTerminal = async () => {
    setShowTerminal(!showTerminal)

    if (!showTerminal && vpsList.length > 0) {
      const vps = vpsList[0]
      const socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`)

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'connect',
          data: {
            host: vps.ip_address,
            username: vps.username,
            password: vps.password,
          },
        }))
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'data') {
            setTerminalLines((prev) => [...prev, ...message.data.split('\n')])
            setTimeout(() => {
              terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' })
            }, 0)
          } else if (message.type === 'error') {
            setTerminalLines(['⚠️ Lỗi: ' + message.data])
          }
        } catch (err) {
          setTerminalLines((prev) => [...prev, '[!] Lỗi nhận dữ liệu'])
        }
      }

      socket.onerror = () => {
        setTerminalLines(['Lỗi kết nối đến SSH backend.'])
      }

      setWs(socket)
    } else {
      ws?.close()
      setWs(null)
      setTerminalLines([])
    }
  }

  const handleCommandSubmit = () => {
    if (ws && currentInput.trim() !== '') {
      ws.send(JSON.stringify({ type: 'input', data: currentInput + '\n' }))
      setTerminalLines((prev) => [...prev, `> ${currentInput}`])
      setCurrentInput('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Cloud className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Input placeholder="Tìm kiếm..." className="pl-10 w-64" />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Chào mừng trở lại, {profile?.full_name || user?.email}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">Quản lý máy chủ và truy cập SSH.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
          <Card className="text-center">
            <CardHeader className="flex flex-col items-center justify-center pb-2">
              <CardTitle className="text-sm font-medium">Tổng Storage</CardTitle>
              <Database className="h-4 w-4 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.storage}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader className="flex flex-col items-center justify-center pb-2">
              <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
              <Server className="h-4 w-4 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serverStats.active}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex gap-4 justify-center">
          <Button variant="default" onClick={handleAddVPS}>
            <Plus className="mr-2 h-4 w-4" /> Thêm VPS
          </Button>
          <Button variant="outline" onClick={handleToggleTerminal}>
            <Terminal className="mr-2 h-4 w-4" /> Kết nối SSH
          </Button>
        </div>

        {vpsList.length > 0 && (
          <div className="mt-10 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách VPS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vpsList.map((vps, index) => (
                  <div key={vps.id || index} className="border rounded p-4 bg-white dark:bg-gray-800 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">VPS #{index + 1}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">IP: {vps.ip_address}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tài khoản: {vps.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mật khẩu: ••••••••</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteVps(vps.id)}>
                      <Trash className="h-4 w-4 mr-1" /> Xóa
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {showTerminal && (
          <div className="mt-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>SSH Terminal</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={terminalRef}
                  className="rounded-lg border bg-black text-white h-96 p-4 overflow-y-scroll whitespace-pre-wrap text-sm"
                  onClick={() => inputRef.current?.focus()}
                >
                  {terminalLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                  <div className="flex">
                    <span>&gt;&nbsp;</span>
                    <input
                      ref={inputRef}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCommandSubmit()
                        }
                      }}
                      className="bg-black text-white outline-none flex-1"
                      autoFocus
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
