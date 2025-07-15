'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface TerminalProps {
  serverId: string
  serverName: string
  connectionConfig: {
    host: string
    port: number
    username: string
    password: string
  }
  onClose?: () => void
  className?: string
}

export default function Terminal({
  serverId,
  serverName,
  connectionConfig,
  onClose,
  className = ''
}: TerminalProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isConnected])

  // Demo mode for development
  const startDemoMode = useCallback(() => {
    console.log('🎮 Terminal: Starting demo mode...')

    const demoMessages = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║                    HEXACLOUD SSH TERMINAL                    ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      '🎮 Demo Mode - Simulating SSH connection to HexaCloud Backend',
      '✅ SSH connection established successfully! (Demo)',
      `Welcome to ${serverName} - HexaCloud Production Server`,
      'Last login: ' + new Date().toLocaleString(),
      'Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-74-generic x86_64)',
      '',
      'Available demo commands:',
      '• ls, ls -la        - list directory contents',
      '• pwd               - print working directory',
      '• whoami            - print current user (root)',
      '• clear             - clear screen',
      '• date              - current date and time',
      '• uname -a          - system information',
      '• htop              - system monitor',
      '• ps aux            - list running processes',
      '• df -h             - disk space usage',
      '• free -m           - memory usage',
      '• cat /etc/os-release - OS information',
      '• mkdir [dir]       - create directory',
      '• touch [file]      - create file',
      '• echo [text]       - print text',
      '• history           - command history',
      '• exit              - close terminal',
      '',
      'root@hexacloud-backend:~$ '
    ]

    setOutput(demoMessages)
    setIsConnected(true)
    setIsConnecting(false)
    setConnectionStatus('connected')

    toast.success(`Terminal Connected - ${serverName}`, {
      description: 'HexaCloud Backend Server (Demo Mode)'
    })
  }, [serverName])

  // Initialize terminal
  useEffect(() => {
    console.log('🚀 Terminal: Initializing connection...')

    setConnectionStatus('connecting')
    setIsConnecting(true)

    // Start demo mode after short delay
    const initTimer = setTimeout(() => {
      startDemoMode()
    }, 1000)

    return () => {
      clearTimeout(initTimer)
    }
  }, [startDemoMode])

  // Handle command input
  const handleCommand = useCallback((command: string) => {
    if (!command.trim()) return

    // Add to command history
    const newHistory = [...commandHistory, command]
    setCommandHistory(newHistory)
    setHistoryIndex(-1)

    const newOutput = [...output]
    newOutput.push(`root@hexacloud-backend:~$ ${command}`)

    // Demo mode responses
    const cmd = command.trim().toLowerCase()
    const args = cmd.split(' ')

    switch (args[0]) {
      case 'ls':
        if (args[1] === '-la' || args[1] === '-l') {
          newOutput.push('total 52')
          newOutput.push('drwx------  8 root root 4096 Jun 26 10:30 .')
          newOutput.push('drwxr-xr-x 23 root root 4096 Jun 25 14:20 ..')
          newOutput.push('-rw-r--r--  1 root root  570 Jan 31  2010 .bashrc')
          newOutput.push('-rw-r--r--  1 root root  148 Aug 17  2015 .profile')
          newOutput.push('drwxr-xr-x  2 root root 4096 Jun 26 09:15 hexacloud')
          newOutput.push('drwxr-xr-x  2 root root 4096 Jun 26 10:20 logs')
          newOutput.push('-rwxr-xr-x  1 root root 8192 Jun 26 10:25 server.js')
          newOutput.push('-rw-r--r--  1 root root 1234 Jun 26 09:30 package.json')
        } else {
          newOutput.push('hexacloud    logs         server.js    package.json')
          newOutput.push('Documents    Downloads    Desktop      .bashrc')
          newOutput.push('bin          etc          home         opt')
          newOutput.push('root         tmp          usr          var')
        }
        break

      case 'pwd':
        newOutput.push('/root')
        break

      case 'whoami':
        newOutput.push('root')
        break

      case 'clear':
        setOutput(['root@hexacloud-backend:~$ '])
        setInput('')
        return

      case 'date':
        newOutput.push(new Date().toString())
        break

      case 'uname':
        if (args[1] === '-a') {
          newOutput.push('Linux hexacloud-backend 5.4.0-74-generic #83-Ubuntu SMP Sat May 8 02:35:39 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux')
        } else {
          newOutput.push('Linux')
        }
        break

      case 'htop':
        newOutput.push('  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND')
        newOutput.push('    1 root      20   0  225316   9004   6784 S   0.0   0.4   0:01.23 systemd')
        newOutput.push('  123 root      20   0  234567  18234  12845 S   0.8   1.2   0:05.45 node server.js')
        newOutput.push('  234 mysql     20   0  456789  43210  23456 S   0.5   2.1   0:15.67 mysqld')
        newOutput.push('  345 nginx     20   0   98765   6789   4321 S   0.2   0.3   0:02.12 nginx')
        newOutput.push('  456 root      20   0   78912   5643   4123 S   0.0   0.2   0:00.08 bash')
        break

      case 'ps':
        if (args[1] === 'aux') {
          newOutput.push('USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND')
          newOutput.push('root           1  0.0  0.4 225316  9004 ?        Ss   10:20   0:01 /sbin/init')
          newOutput.push('root         123  0.8  1.2 234567 18234 ?        S    10:21   0:05 node server.js')
          newOutput.push('mysql        234  0.5  2.1 456789 43210 ?        Sl   10:20   0:15 mysqld')
          newOutput.push('nginx        345  0.2  0.3  98765  6789 ?        S    10:20   0:02 nginx: master')
          newOutput.push('root         456  0.0  0.2  78912  5643 pts/0    S    10:25   0:00 bash')
        } else {
          newOutput.push('  PID TTY          TIME CMD')
          newOutput.push('  123 pts/0    00:00:05 node')
          newOutput.push('  456 pts/0    00:00:00 bash')
        }
        break

      case 'df':
        if (args[1] === '-h') {
          newOutput.push('Filesystem      Size  Used Avail Use% Mounted on')
          newOutput.push('/dev/sda1        40G  18G   20G  48% /')
          newOutput.push('/dev/sda2       200G   85G  105G  45% /home')
          newOutput.push('/dev/sda3        50G   15G   33G  32% /var')
          newOutput.push('tmpfs           4.0G     0  4.0G   0% /dev/shm')
        }
        break

      case 'free':
        if (args[1] === '-m') {
          newOutput.push('              total        used        free      shared  buff/cache   available')
          newOutput.push('Mem:           7924        3256        2148         289        2519        4235')
          newOutput.push('Swap:          4047         256        3791')
        }
        break

      case 'cat':
        if (args[1] === '/etc/os-release') {
          newOutput.push('NAME="Ubuntu"')
          newOutput.push('VERSION="20.04.3 LTS (Focal Fossa)"')
          newOutput.push('ID=ubuntu')
          newOutput.push('ID_LIKE=debian')
          newOutput.push('PRETTY_NAME="Ubuntu 20.04.3 LTS"')
          newOutput.push('VERSION_ID="20.04"')
          newOutput.push('VERSION_CODENAME=focal')
          newOutput.push('UBUNTU_CODENAME=focal')
        } else {
          newOutput.push(`cat: ${args[1] || ''}: No such file or directory`)
        }
        break

      case 'mkdir':
        if (args[1]) {
          newOutput.push(`Directory '${args[1]}' created successfully`)
        } else {
          newOutput.push('mkdir: missing operand')
        }
        break

      case 'touch':
        if (args[1]) {
          newOutput.push(`File '${args[1]}' created successfully`)
        } else {
          newOutput.push('touch: missing file operand')
        }
        break

      case 'echo':
        const text = command.substring(5)
        newOutput.push(text || '')
        break

      case 'history':
        commandHistory.forEach((cmd, index) => {
          newOutput.push(`${(index + 1).toString().padStart(4)} ${cmd}`)
        })
        break

      case 'exit':
        newOutput.push('Logout')
        newOutput.push('Connection to hexacloud-backend closed.')
        newOutput.push('')
        setIsConnected(false)
        setConnectionStatus('disconnected')
        if (onClose) {
          setTimeout(onClose, 1500)
        }
        return

      default:
        if (cmd.startsWith('cd ')) {
          const dir = args[1] || '~'
          newOutput.push(`Changed to ${dir === '~' ? '/root' : dir}`)
        } else {
          newOutput.push(`bash: ${args[0]}: command not found`)
        }
        break
    }

    newOutput.push('root@hexacloud-backend:~$ ')
    setOutput(newOutput)
    setInput('')
  }, [output, commandHistory, onClose])

  // Handle key presses
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-3 w-3" />
      case 'connecting': return <Loader2 className="h-3 w-3 animate-spin" />
      case 'error': return <WifiOff className="h-3 w-3" />
      default: return <WifiOff className="h-3 w-3" />
    }
  }

  return (
    <Card className={`${className} ${isMaximized ? 'fixed inset-4 z-50' : ''} bg-gray-900 border-gray-700`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <TerminalIcon className="h-4 w-4 text-green-400" />
              <CardTitle className="text-sm text-white">{serverName}</CardTitle>
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor()} text-white`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </Badge>
            {connectionStatus === 'connected' && (
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                root@hexacloud-backend
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div
          className={`${isMaximized ? 'h-[calc(100vh-8rem)]' : 'h-96'} bg-black rounded p-4 font-mono text-sm overflow-hidden flex flex-col`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Terminal Output */}
          <div
            ref={outputRef}
            className="flex-1 overflow-y-auto text-green-400 space-y-1 mb-2"
            style={{ fontFamily: 'Monaco, "Lucida Console", monospace' }}
          >
            {output.map((line, index) => (
              <div
                key={index}
                className={
                  line.includes('root@hexacloud-backend:~$') ? 'text-blue-400 font-bold' :
                  line.includes('ERROR') || line.includes('❌') || line.includes('bash:') ? 'text-red-400' :
                  line.includes('✅') || line.includes('SUCCESS') || line.includes('created') ? 'text-yellow-400' :
                  line.includes('🎮') || line.includes('Demo') ? 'text-cyan-400' :
                  line.includes('╔') || line.includes('║') || line.includes('╚') ? 'text-cyan-400' :
                  'text-green-400'
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Input Line */}
          {isConnected && (
            <div className="flex items-center">
              <span className="text-blue-400 mr-2 whitespace-nowrap font-bold">
                root@hexacloud-backend:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="bg-transparent text-green-400 border-none outline-none flex-1 font-mono"
                style={{ fontFamily: 'Monaco, "Lucida Console", monospace' }}
                placeholder="Enter command..."
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}

          {/* Connecting State */}
          {isConnecting && !isConnected && (
            <div className="flex items-center justify-center text-yellow-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Connecting to HexaCloud Backend...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}