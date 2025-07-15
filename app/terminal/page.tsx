
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SSHConnection } from '@/components/ssh-connection'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Terminal as TerminalIcon,
  Grid3X3,
  Maximize2
} from 'lucide-react'

interface VPSConnection {
  id: string
  name: string
  host: string
  port: number
  username: string
  password: string
}

export default function TerminalPage() {
  const router = useRouter()
  const [connectedServers, setConnectedServers] = useState<VPSConnection[]>([])
  const [layout, setLayout] = useState<'single' | 'grid'>('single')

  const handleConnectionSuccess = (connectionInfo: any) => {
    const newConnection: VPSConnection = {
      id: `server_${Date.now()}`,
      name: `${connectionInfo.username}@${connectionInfo.host}`,
      host: connectionInfo.host,
      port: parseInt(connectionInfo.port),
      username: connectionInfo.username,
      password: connectionInfo.password
    }

    setConnectedServers(prev => [...prev, newConnection])
  }

  const removeConnection = (serverId: string) => {
    setConnectedServers(prev => prev.filter(server => server.id !== serverId))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <TerminalIcon className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  SSH Terminal
                </h1>
              </div>
              {connectedServers.length > 0 && (
                <Badge variant="secondary">
                  {connectedServers.length} connection{connectedServers.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {connectedServers.length > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLayout(layout === 'single' ? 'grid' : 'single')}
                >
                  {layout === 'single' ? <Grid3X3 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {connectedServers.length === 0 ? (
          // Show SSH Connection Form
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <TerminalIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect to SSH Server
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your server credentials to establish an SSH connection
              </p>
            </div>
            <SSHConnection onConnectionSuccess={handleConnectionSuccess} />
          </div>
        ) : (
          // Show Connected Servers
          <div className={`grid gap-4 ${
            layout === 'grid' && connectedServers.length > 1 
              ? 'grid-cols-1 lg:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {connectedServers.map((server) => (
              <Card key={server.id} className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <TerminalIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {server.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {server.host}:{server.port}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeConnection(server.id)}
                    >
                      Disconnect
                    </Button>
                  </div>

                  <div className="bg-black rounded-lg p-4 text-green-400 font-mono text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-400">{server.username}@{server.host}:</span>
                      <span className="text-yellow-400">~$</span>
                      <span className="animate-pulse">_</span>
                    </div>
                    <div className="mt-2 text-gray-400">
                      Connected successfully to {server.host}
                    </div>
                    <div className="mt-1 text-gray-400">
                      Terminal session ready...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Connection Button */}
        {connectedServers.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to show connection form
                // You could also open a modal here
              }}
            >
              <TerminalIcon className="h-4 w-4 mr-2" />
              Add New Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}