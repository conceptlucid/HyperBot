import { WebSocket } from 'ws'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Tools
import * as Screen from './tools/screen.js'
import * as Mouse from './tools/mouse.js'
import * as Keyboard from './tools/keyboard.js'
import * as Terminal from './tools/terminal.js'
import * as Files from './tools/files.js'
import * as System from './tools/system.js'

interface Config {
  cloudUrl: string
  deviceName: string
  apiKey: string
}

interface Message {
  type: string
  id?: string
  [key: string]: any
}

class HyperBotAgent {
  private ws: WebSocket | null = null
  private config: Config
  private deviceId: string
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.config = this.loadConfig()
    this.deviceId = this.getDeviceId()
  }

  private loadConfig(): Config {
    const configPath = join(homedir(), '.hyperbot', 'config.json')
    const defaultConfig: Config = {
      cloudUrl: 'https://myhyperbot.com',
      deviceName: '',
      apiKey: ''
    }

    if (existsSync(configPath)) {
      try {
        return { ...defaultConfig, ...JSON.parse(readFileSync(configPath, 'utf-8')) }
      } catch {
        console.log('⚠️  Invalid config, using defaults')
      }
    }
    return defaultConfig
  }

  private getDeviceId(): string {
    const idPath = join(homedir(), '.hyperbot', '.device-id')
    if (existsSync(idPath)) {
      return readFileSync(idPath, 'utf-8').trim()
    }
    const id = uuidv4()
    mkdirSync(join(homedir(), '.hyperbot'), { recursive: true })
    writeFileSync(idPath, id)
    return id
  }

  async start() {
    console.log('🤖 HyperBot Agent starting...')
    console.log(`   Cloud: ${this.config.cloudUrl}`)
    console.log(`   Device: ${this.deviceId}`)
    console.log(`   Name: ${this.config.deviceName || 'Unnamed'}`)
    console.log('')

    this.connect()
  }

  private connect() {
    const wsUrl = this.config.cloudUrl.replace('https://', 'wss://') + '/ws/agent'
    
    try {
      console.log(`Connecting to ${wsUrl}...`)
      
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Device-Id': this.deviceId
        }
      })

      this.ws.on('open', () => {
        console.log('✅ Connected to cloud!')
        this.sendRegister()
        this.startPing()
      })

      this.ws.on('message', (data) => {
        try {
          this.handleMessage(JSON.parse(data.toString()))
        } catch (e) {
          console.log('Invalid message:', data.toString())
        }
      })

      this.ws.on('close', (code, reason) => {
        console.log(`❌ Disconnected (${code}): ${reason}`)
        this.stopPing()
        this.scheduleReconnect()
      })

      this.ws.on('error', (err) => {
        console.log('⚠️  Connection error:', err.message)
      })
    } catch (err: any) {
      console.log('⚠️  Failed to connect:', err.message)
      this.scheduleReconnect()
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' })
    }, 30000)
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    console.log('⏳ Reconnecting in 5 seconds...')
    this.reconnectTimer = setTimeout(() => this.connect(), 5000)
  }

  private sendRegister() {
    this.send({
      type: 'register',
      deviceId: this.deviceId,
      deviceName: this.config.deviceName || `Device-${this.deviceId.slice(0, 8)}`,
      capabilities: ['screen', 'mouse', 'keyboard', 'terminal', 'files', 'system']
    })
  }

  private send(msg: Message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private async handleMessage(msg: Message) {
    const { type, id, ...data } = msg

    switch (type) {
      case 'ping':
        this.send({ type: 'pong' })
        break

      case 'command':
        await this.executeCommand(id!, data)
        break

      default:
        console.log('📩 Unknown message:', type)
    }
  }

  private async executeCommand(id: string, data: any) {
    const { tool, args } = data
    console.log(`🔧 Running: ${tool}`, args || '')

    let result: any

    try {
      switch (tool) {
        case 'screen.capture':
          result = await Screen.capture()
          break
        case 'screen.list':
          result = await Screen.listScreens()
          break
        case 'mouse.move':
          result = await Mouse.move(args?.x || 0, args?.y || 0)
          break
        case 'mouse.click':
          result = await Mouse.click(args?.button || 'left')
          break
        case 'mouse.doubleClick':
          result = await Mouse.doubleClick(args?.button || 'left')
          break
        case 'mouse.drag':
          result = await Mouse.drag(args?.x1 || 0, args?.y1 || 0, args?.x2 || 0, args?.y2 || 0)
          break
        case 'mouse.scroll':
          result = await Mouse.scroll(args?.lines || 1)
          break
        case 'mouse.position':
          result = await Mouse.getPosition()
          break
        case 'keyboard.type':
          result = await Keyboard.type(args?.text || '')
          break
        case 'keyboard.hotkey':
          result = await Keyboard.hotkey(...(args?.keys || []))
          break
        case 'keyboard.press':
          result = await Keyboard.press(args?.key || '')
          break
        case 'terminal.run':
          result = await Terminal.run(args?.command || '', args?.timeout || 30000)
          break
        case 'code.run':
          result = await Terminal.runCode(args?.code || '', args?.language, args?.timeout || 30000)
          break
        case 'code.languages':
          result = { languages: Terminal.getSupportedLanguages() }
          break
        case 'files.read':
          result = Files.read(args?.path || '')
          break
        case 'files.write':
          result = Files.write(args?.path || '', args?.content || '')
          break
        case 'files.list':
          result = await Files.list(args?.path || '.')
          break
        case 'files.search':
          result = await Files.search(args?.pattern || '', args?.cwd || '.')
          break
        case 'files.remove':
          result = Files.remove(args?.path || '')
          break
        case 'system.info':
          result = await System.info()
          break
        case 'system.load':
          result = System.load()
          break
        default:
          result = { success: false, error: `Unknown tool: ${tool}` }
      }

      console.log(`   ✅ Result:`, JSON.stringify(result).slice(0, 100))
      this.send({ type: 'result', id, status: 'success', result })
    } catch (err: any) {
      console.log(`   ❌ Error:`, err.message)
      this.send({ type: 'result', id, status: 'error', error: err.message })
    }
  }
}

// Start agent
const agent = new HyperBotAgent()
agent.start()

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 HyperBot shutting down...')
  process.exit(0)
})
