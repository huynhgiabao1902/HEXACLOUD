
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Profile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// Removed Badge and Separator imports if they don't exist
import {
  Cloud,
  Server,
  Database,
  LogOut,
  Terminal,
  Plus,
  Trash2,
  Search,
  Activity,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'

// Types
interface VPS {
  id: string
  ip_address: string
  username: string
  password: string
  name?: string
  status?: 'online' | 'offline'
  created_at: string
}

interface ServerStats {
  storage: string
  active: number
  totalVps: number
  onlineVps: number
}

// Custom hooks
const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!session || error) {
          toast.error('Phiên đăng nhập đã hết hạn')
          router.push('/login')
          return
        }

        setUser(session.user)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          toast.error('Không thể tải thông tin người dùng')
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Auth error:', error)
        toast.error('Lỗi xác thực')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return { user, profile, isLoading }
}

const useVPS = (userId: string | null) => {
  const [vpsList, setVpsList] = useState<VPS[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchVpsData = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('vps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVpsList(data || [])
    } catch (error) {
      console.error('Error fetching VPS:', error)
      toast.error('Không thể tải danh sách VPS')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchVpsData()
  }, [fetchVpsData])

  const deleteVps = async (id: string) => {
    try {
      const { error } = await supabase.from('vps').delete().eq('id', id)
      if (error) throw error

      toast.success('Xóa VPS thành công')
      fetchVpsData()
    } catch (error) {
      console.error('Error deleting VPS:', error)
      toast.error('Không thể xóa VPS')
    }
  }

  const serverStats: ServerStats = useMemo(() => ({
    storage: '100 GB',
    active: vpsList.filter(vps => vps.status === 'online').length,
    totalVps: vpsList.length,
    onlineVps: vpsList.filter(vps => vps.status === 'online').length
  }), [vpsList])

  return {
    vpsList,
    serverStats,
    isLoading,
    fetchVpsData,
    deleteVps
  }
}

const useSSHTerminal = () => {
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      terminalRef.current?.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }, [])

  const addTerminalLine = useCallback((line: string) => {
    setTerminalLines(prev => [...prev, line])
    scrollToBottom()
  }, [scrollToBottom])

  const connectSSH = useCallback(async (vps: VPS) => {
    if (!process.env.NEXT_PUBLIC_WS_URL) {
      toast.error('Chưa cấu hình WebSocket URL')
      return
    }

    try {
      const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)

      socket.onopen = () => {
        setIsConnected(true)
        addTerminalLine(`🔗 Đang kết nối đến ${vps.ip_address}...`)

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
            const lines = message.data.split('\n').filter((line: string) => line.trim())
            lines.forEach((line: string) => addTerminalLine(line))
          } else if (message.type === 'error') {
            addTerminalLine(`❌ Lỗi: ${message.data}`)
          } else if (message.type === 'connected') {
            addTerminalLine(`✅ Kết nối thành công đến ${vps.ip_address}`)
          }
        } catch (err) {
          addTerminalLine('⚠️ Lỗi phân tích dữ liệu từ server')
        }
      }

      socket.onerror = () => {
        setIsConnected(false)
        addTerminalLine('❌ Lỗi kết nối đến SSH backend')
      }

      socket.onclose = () => {
        setIsConnected(false)
        addTerminalLine('🔌 Kết nối đã đóng')
      }

      setWs(socket)
    } catch (error) {
      toast.error('Không thể tạo kết nối SSH')
    }
  }, [addTerminalLine])

  const disconnect = useCallback(() => {
    if (ws) {
      ws.close()
      setWs(null)
    }
    setIsConnected(false)
    setTerminalLines([])
    setCurrentInput('')
  }, [ws])

  const toggleTerminal = useCallback((vps?: VPS) => {
    if (showTerminal) {
      disconnect()
      setShowTerminal(false)
    } else {
      setShowTerminal(true)
      if (vps) {
        connectSSH(vps)
      }
    }
  }, [showTerminal, disconnect, connectSSH])

  const sendCommand = useCallback(() => {
    if (ws && currentInput.trim() && isConnected) {
      ws.send(JSON.stringify({ type: 'input', data: currentInput + '\n' }))
      addTerminalLine(`$ ${currentInput}`)
      setCurrentInput('')
    }
  }, [ws, currentInput, isConnected, addTerminalLine])

  return {
    showTerminal,
    terminalLines,
    currentInput,
    setCurrentInput,
    isConnected,
    terminalRef,
    inputRef,
    toggleTerminal,
    sendCommand,
    disconnect
  }
}

// Components
const StatCard = ({ title, value, icon: Icon, trend }: {
  title: string
  value: string | number
  icon: any
  trend?: 'up' | 'down' | 'stable'
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Activity className="h-3 w-3 mr-1" />
          <span>Hoạt động bình thường</span>
        </div>
      )}
    </CardContent>
  </Card>
)

const VPSCard = ({ vps, index, onDelete, onConnect }: {
  vps: VPS
  index: number
  onDelete: (id: string) => void
  onConnect: (vps: VPS) => void
}) => {
  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa VPS "${vps.name || `#${index + 1}`}"?`)) {
      onDelete(vps.id)
    }
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Monitor className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {vps.name || `VPS #${index + 1}`}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {vps.status === 'online' ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  vps.status === 'online' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {vps.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center justify-between">
            <span>IP Address:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              {vps.ip_address}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Username:</span>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              {vps.username}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(vps.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnect(vps)}
              className="flex items-center space-x-2"
            >
              <Terminal className="h-4 w-4" />
              <span>SSH Connect</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Component
export default function DashboardPage() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const { vpsList, serverStats, isLoading: vpsLoading, fetchVpsData, deleteVps } = useVPS(user?.id)
  const {
    showTerminal,
    terminalLines,
    currentInput,
    setCurrentInput,
    isConnected,
    terminalRef,
    inputRef,
    toggleTerminal,
    sendCommand
  } = useSSHTerminal()

  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Filter VPS based on search
  const filteredVpsList = useMemo(() => {
    if (!searchTerm) return vpsList
    return vpsList.filter(vps =>
      vps.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vps.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vps.name && vps.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [vpsList, searchTerm])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Đăng xuất thành công')
    router.push('/login')
  }

  const handleAddVPS = () => {
    router.push('/add-vps')
  }

  const handleRefresh = () => {
    fetchVpsData()
    toast.success('Đã làm mới dữ liệu')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Cloud className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HEXACLOUD</h1>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                Dashboard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm VPS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Chào mừng trở lại, {profile?.full_name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và giám sát hệ thống cloud của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Storage"
            value={serverStats.storage}
            icon={HardDrive}
            trend="stable"
          />
          <StatCard
            title="Active Servers"
            value={serverStats.active}
            icon={Server}
            trend="up"
          />
          <StatCard
            title="Total VPS"
            value={serverStats.totalVps}
            icon={Database}
          />
          <StatCard
            title="Online VPS"
            value={serverStats.onlineVps}
            icon={Activity}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={handleAddVPS} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Thêm VPS mới
          </Button>

          <Button
            variant="outline"
            onClick={() => toggleTerminal()}
            size="lg"
            disabled={vpsList.length === 0}
          >
            <Terminal className="mr-2 h-5 w-5" />
            SSH Terminal
          </Button>
        </div>

        {/* VPS List */}
        {vpsLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách VPS...</p>
          </div>
        ) : filteredVpsList.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Danh sách VPS ({filteredVpsList.length})
              </h3>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  size="sm"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVpsList.map((vps, index) => (
                <VPSCard
                  key={vps.id}
                  vps={vps}
                  index={index}
                  onDelete={deleteVps}
                  onConnect={(vps) => toggleTerminal(vps)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Cloud className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {searchTerm ? 'Không tìm thấy VPS' : 'Chưa có VPS nào'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm
                  ? `Không có VPS nào khớp với "${searchTerm}"`
                  : 'Hãy thêm VPS đầu tiên của bạn để bắt đầu'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleAddVPS}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm VPS đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* SSH Terminal */}
        {showTerminal && (
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>SSH Terminal</span>
                {isConnected && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full ml-2">
                    <Activity className="h-3 w-3 mr-1 inline" />
                    Connected
                  </span>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleTerminal()}
              >
                Đóng
              </Button>
            </CardHeader>
            <CardContent>
              <div
                ref={terminalRef}
                className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {terminalLines.length === 0 && (
                  <div className="text-gray-500">
                    Chọn một VPS để kết nối SSH...
                  </div>
                )}
                {terminalLines.map((line, idx) => (
                  <div key={idx} className="mb-1">{line}</div>
                ))}

                {isConnected && (
                  <div className="flex items-center">
                    <span className="text-blue-400">$ </span>
                    <input
                      ref={inputRef}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          sendCommand()
                        }
                      }}
                      className="bg-transparent text-green-400 outline-none flex-1 ml-2"
                      placeholder={isConnected ? "Nhập lệnh..." : "Chưa kết nối"}
                      disabled={!isConnected}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {!isConnected && terminalLines.length === 0 && (
                <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
                  <p>Click vào nút "SSH Connect" trên một VPS để bắt đầu</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}