// Cloud WebSocket server for agents
// This would run on myhyperbot.com

import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

const wss = new WebSocketServer({ port: 8080 })

interface Agent {
  ws: WebSocket
  id: string
  name: string
  capabilities: string[]
  lastSeen: number
}

const agents = new Map<string, Agent>()

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', 'http://localhost')
  const apiKey = req.headers['authorization']?.replace('Bearer ', '')
  const deviceId = req.headers['x-device-id']

  // Validate API key (in production, check against database)
  if (!apiKey) {
    ws.close(4001, 'Unauthorized')
    return
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      handleMessage(ws, msg)
    } catch (err) {
      console.log('Invalid message:', data.toString())
    }
  })

  ws.on('close', () => {
    if (deviceId) {
      agents.delete(deviceId)
      console.log(`Agent disconnected: ${deviceId}`)
    }
  })

  ws.send(JSON.stringify({ type: 'welcome' }))
})

function handleMessage(ws: WebSocket, msg: any) {
  switch (msg.type) {
    case 'register':
      agents.set(msg.deviceId, {
        ws,
        id: msg.deviceId,
        name: msg.deviceName,
        capabilities: msg.capabilities || [],
        lastSeen: Date.now()
      })
      console.log(`Agent registered: ${msg.deviceName}`)
      break

    case 'result':
      // Forward result to main server/process
      console.log(`Result from ${msg.id}:`, msg.status)
      break

    case 'pong':
      const agent = Array.from(agents.values()).find(a => a.ws === ws)
      if (agent) agent.lastSeen = Date.now()
      break
  }
}

// Ping agents every 30s to keep alive
setInterval(() => {
  agents.forEach((agent) => {
    if (agent.ws.readyState === WebSocket.OPEN) {
      agent.ws.ping()
    }
  })
}, 30000)

console.log('🤖 Agent server running on port 8080')
