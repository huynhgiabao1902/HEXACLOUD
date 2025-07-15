
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Server,
  Cloud,
  Link,
  Terminal,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Interface for Connection Result
interface ConnectionResult {
  success: boolean
  error?: string
  message?: string
  details?: any
}

export default function AddVPSPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionMethod, setConnectionMethod] = useState<'manual' | 'gcp-api' | 'csv-import'>('manual')
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null)

  // State for manual connection form
  const [manualData, setManualData] = useState({
    name: '',
    ip_address: '',
    port: '22',
    username: 'root',
    password: '',
    provider: 'gcp',
    region: '',
    notes: ''
  })

  // Validate form before making requests
  const isFormValid = () => {
    return manualData.name && manualData.ip_address && manualData.username && manualData.password
  }

  // Handle Test Connection - Using backend API
  const handleTestConnection = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields: Server Name, IP Address, Username, and Password.')
      return
    }

    setTestingConnection(true)
    setConnectionResult(null)

    try {
      console.log('🔌 Testing connection to:', manualData.ip_address)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 30000) // 30 second timeout

      const response = await fetch('/api/ssh/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: manualData.ip_address,
          port: parseInt(manualData.port),
          username: manualData.username,
          password: manualData.password
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setConnectionResult(result)

      if (result.success) {
        toast.success('Connection successful! Server is reachable. ✅', {
          description: result.message || 'SSH connection established successfully.'
        })
      } else {
        toast.error('Connection failed ❌', {
          description: result.error || 'Unable to establish SSH connection.'
        })
      }
    } catch (error: any) {
      const errorMessage = error.name === 'AbortError'
        ? 'Request timeout - connection took too long.'
        : error.message || 'Network error - unable to reach the server.'

      setConnectionResult({
        success: false,
        error: errorMessage
      })
      toast.error('Test Failed ❌', {
        description: errorMessage
      })
    } finally {
      setTestingConnection(false)
    }
  }

  // Handle Adding VPS - Using backend API
  const handleAddServer = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields: Server Name, IP Address, Username, and Password.')
      return
    }

    setIsConnecting(true)

    try {
      // Get current session for user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.user?.id) {
        toast.error('Authentication required', {
          description: 'Please log in to continue'
        })
        router.push('/login')
        return
      }

      console.log('➕ Adding server:', manualData.name)

      const response = await fetch(`/api/vps/add?user_id=${session.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: manualData.name,
          ip_address: manualData.ip_address,
          port: parseInt(manualData.port),
          username: manualData.username,
          password: manualData.password,
          provider: manualData.provider,
          region: manualData.region,
          notes: manualData.notes
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success('VPS Added Successfully! 🎉', {
          description: `${manualData.name} has been added to your dashboard.`
        })
        router.push('/dashboard?tab=servers')
      } else {
        toast.error('Failed to add VPS ❌', {
          description: result.error || 'Unable to add VPS to the dashboard.'
        })
      }
    } catch (error: any) {
      console.error('Add server error:', error)
      toast.error('Network Error ❌', {
        description: error.message || 'Unable to connect to the backend server. Please ensure the backend is running.'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add VPS Server</h1>
                <p className="text-sm text-gray-500">Connect your existing VPS to the management dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Backend Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={connectionMethod} onValueChange={(v) => setConnectionMethod(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Manual Connection</span>
            </TabsTrigger>
            <TabsTrigger value="gcp-api" className="flex items-center space-x-2" disabled>
              <Cloud className="h-4 w-4" />
              <span>Cloud API (Soon)</span>
            </TabsTrigger>
            <TabsTrigger value="csv-import" className="flex items-center space-x-2" disabled>
              <FileText className="h-4 w-4" />
              <span>CSV Import (Soon)</span>
            </TabsTrigger>
          </TabsList>

          {/* Manual Connection */}
          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="h-5 w-5" />
                      <span>Server Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Server Name *</Label>
                        <Input
                          id="name"
                          value={manualData.name}
                          onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                          placeholder="My Production Server"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">Cloud Provider</Label>
                        <Select value={manualData.provider} onValueChange={(v) => setManualData({ ...manualData, provider: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gcp">🔵 Google Cloud Platform</SelectItem>
                            <SelectItem value="aws">🟠 Amazon Web Services</SelectItem>
                            <SelectItem value="azure">🔷 Microsoft Azure</SelectItem>
                            <SelectItem value="digitalocean">🌊 DigitalOcean</SelectItem>
                            <SelectItem value="vultr">⚡ Vultr</SelectItem>
                            <SelectItem value="other">⚪ Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="ip">IP Address *</Label>
                        <Input
                          id="ip"
                          value={manualData.ip_address}
                          onChange={(e) => setManualData({ ...manualData, ip_address: e.target.value })}
                          placeholder="34.87.146.40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="port">SSH Port</Label>
                        <Input
                          id="port"
                          value={manualData.port}
                          onChange={(e) => setManualData({ ...manualData, port: e.target.value })}
                          placeholder="22"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username *</Label>
                        <Input
                          id="username"
                          value={manualData.username}
                          onChange={(e) => setManualData({ ...manualData, username: e.target.value })}
                          placeholder="root or ubuntu"
                        />
                      </div>
                      <div>
                        <Label htmlFor="region">Region/Zone</Label>
                        <Input
                          id="region"
                          value={manualData.region}
                          onChange={(e) => setManualData({ ...manualData, region: e.target.value })}
                          placeholder="asia-southeast1-a"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Terminal className="h-5 w-5" />
                      <span>SSH Authentication</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={manualData.password}
                        onChange={(e) => setManualData({ ...manualData, password: e.target.value })}
                        placeholder="Enter your SSH password"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        🔒 Password will be encrypted and stored securely in the backend
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={manualData.notes}
                        onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                        placeholder="Additional notes about this server..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Connection Test and Add Section */}
              <div className="space-y-6">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Connection Test</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {connectionResult && (
                      <div
                        className={`p-3 rounded-lg border ${
                          connectionResult.success
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                            : 'bg-red-50 border-red-200 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {connectionResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              connectionResult.success ? 'text-green-800' : 'text-red-800'
                            }`}
                          >
                            {connectionResult.success ? 'Connection Successful' : 'Connection Failed'}
                          </span>
                        </div>
                        {connectionResult.details && connectionResult.success && (
                          <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                            Connected as: {connectionResult.details.connected_user || manualData.username}
                          </div>
                        )}
                        {connectionResult.error && !connectionResult.success && (
                          <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                            {connectionResult.error}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleTestConnection}
                      disabled={testingConnection || !isFormValid()}
                      variant="outline"
                      className="w-full"
                    >
                      {testingConnection ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Terminal className="h-4 w-4 mr-2" />
                          Test SSH Connection
                        </>
                      )}
                    </Button>

                    <div className="border-t pt-4">
                      <Button
                        onClick={handleAddServer}
                        disabled={isConnecting || !isFormValid()}
                        className="w-full"
                        size="lg"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding Server...
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            Add to Dashboard
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                      <div className="font-medium text-gray-700 mb-2">🔐 Security Notes:</div>
                      <p>• SSH connection encrypted (TLS)</p>
                      <p>• Backend handles credential storage</p>
                      <p>• Test connection recommended</p>
                      <p>• All required fields marked *</p>
                      <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700">
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-xs">Backend: {process.env.NEXT_PUBLIC_BACKEND_URL}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Future features placeholders */}
          <TabsContent value="gcp-api" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <Cloud className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Google Cloud API Integration</h3>
                <p className="text-gray-600 mb-4">
                  Automatically discover and import your GCP instances
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv-import" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">CSV Bulk Import</h3>
                <p className="text-gray-600 mb-4">
                  Import multiple servers from a CSV file
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}