import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

interface Agent {
  ws: WebSocket
  id: string
  name: string
  capabilities: string[]
  lastSeen: number
}

interface Session {
  id: string
  agentId: string
  messages: { role: string; content: string }[]
}

const agents = new Map<string, Agent>()
const sessions = new Map<string, Session>()

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', agents: agents.size }))
    return
  }

  // Agent registration endpoint
  if (req.url === '/api/agents' && req.method === 'GET') {
    const agentList = Array.from(agents.values()).map(a => ({
      id: a.id,
      name: a.name,
      capabilities: a.capabilities,
      lastSeen: a.lastSeen
    }))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(agentList))
    return
  }

  // Send command to agent
  if (req.url?.startsWith('/api/agents/') && req.method === 'POST') {
    const agentId = req.url.split('/')[3]
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      const agent = agents.get(agentId)
      if (!agent) {
        res.writeHead(404)
        res.end(JSON.stringify({ error: 'Agent not found' }))
        return
      }

      const { tool, args } = JSON.parse(body)
      const commandId = Date.now().toString()

      agent.ws.send(JSON.stringify({
        type: 'command',
        id: commandId,
        tool,
        args
      }))

      // Create session for this command
      sessions.set(commandId, {
        id: commandId,
        agentId,
        messages: []
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ commandId }))
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

const wss = new WebSocketServer({ server, path: '/ws/agent' })

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://localhost')
  const apiKey = req.headers['authorization']?.replace('Bearer ', '')
  const deviceId = req.headers['x-device-id'] as string

  // Simple auth (in production, validate against DB)
  if (!apiKey || apiKey === 'undefined') {
    ws.close(4001, 'Unauthorized - API key required')
    return
  }

  console.log(`📱 Agent connecting: ${deviceId}`)

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      handleMessage(ws, msg, deviceId)
    } catch (err) {
      console.log('Invalid message:', data.toString())
    }
  })

  ws.on('close', () => {
    if (deviceId && agents.has(deviceId)) {
      agents.delete(deviceId)
      console.log(`❌ Agent disconnected: ${deviceId}`)
    }
  })

  ws.on('error', (err) => {
    console.log('WebSocket error:', err.message)
  })
})

function handleMessage(ws: WebSocket, msg: any, deviceId: string) {
  switch (msg.type) {
    case 'register':
      agents.set(deviceId, {
        ws,
        id: msg.deviceId,
        name: msg.deviceName,
        capabilities: msg.capabilities || [],
        lastSeen: Date.now()
      })
      console.log(`✅ Agent registered: ${msg.deviceName} (${msg.deviceId})`)
      ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to HyperBot Cloud' }))
      break

    case 'pong':
      const agent = agents.get(deviceId)
      if (agent) agent.lastSeen = Date.now()
      break

    case 'result':
      console.log(`📬 Result for ${msg.id}:`, msg.status)
      // In production, notify waiting HTTP request
      break
  }
}

// Ping agents every 30s
setInterval(() => {
  agents.forEach((agent) => {
    if (agent.ws.readyState === WebSocket.OPEN) {
      agent.ws.ping()
    }
  })
}, 30000)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 HyperBot Cloud Server running on port ${PORT}`)
  console.log(`   WebSocket: ws://localhost:${PORT}/ws/agent`)
  console.log(`   REST API: http://localhost:${PORT}/api/agents`)
})
