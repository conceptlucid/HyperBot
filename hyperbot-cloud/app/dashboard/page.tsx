'use client'

import { useState, useEffect, useRef } from 'react'

interface Agent {
  id: string
  name: string
  capabilities: string[]
  lastSeen: number
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome to HyperBot! Select a machine to get started.' }
  ])
  const [loading, setLoading] = useState(false)
  const [aiReady, setAiReady] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Check AI config
  useEffect(() => {
    fetch('http://localhost:3001/api/config')
      .then(r => r.json())
      .then(config => {
        setAiReady(config.hasOpenRouter || config.hasOpenAI || config.hasAnthropic)
        if (!config.hasOpenRouter && !config.hasOpenAI && !config.hasAnthropic) {
          setMessages(m => [...m, { 
            role: 'system', 
            content: 'AI not configured. Using OpenRouter free model by default.' 
          }])
        }
      })
      .catch(() => {})
  }, [])

  // Connect to WebSocket
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/ws/agent')

    ws.onopen = () => {
      console.log('Connected to cloud')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        handleMessage(msg)
      } catch (e) {
        console.log('Invalid message:', event.data)
      }
    }

    ws.onclose = () => {
      console.log('Disconnected from cloud')
    }

    wsRef.current = ws

    // Fetch agents
    fetchAgents()

    return () => ws.close()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/agents')
      const data = await res.json()
      setAgents(data)
    } catch (e) {
      console.log('Failed to fetch agents')
    }
  }

  const handleMessage = (msg: any) => {
    switch (msg.type) {
      case 'welcome':
        setMessages(m => [...m, { role: 'system', content: msg.message }])
        break
      case 'result':
        if (msg.status === 'success') {
          const resultStr = typeof msg.result === 'object' 
            ? JSON.stringify(msg.result, null, 2) 
            : msg.result
          setMessages(m => [...m, { role: 'assistant', content: `Result: ${resultStr}` }])
        } else {
          setMessages(m => [...m, { role: 'assistant', content: `Error: ${msg.error}` }])
        }
        setLoading(false)
        break
    }
  }

  const sendToAI = async () => {
    if (!prompt.trim()) return

    const userMessage = prompt
    setMessages(m => [...m, { role: 'user', content: userMessage }])
    setLoading(true)
    setPrompt('')

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }],
          agentId: selectedAgent
        })
      })

      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.response }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Failed to connect to AI' }])
    }
    setLoading(false)
  }

  const sendCommand = async () => {
    if (!prompt.trim() || !selectedAgent) return

    setLoading(true)
    setMessages(m => [...m, { role: 'user', content: prompt }])

    // Parse the prompt into a command
    const command = parsePrompt(prompt)

    try {
      const res = await fetch(`http://localhost:3001/api/agents/${selectedAgent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(m => [...m, { role: 'assistant', content: `Error: ${err.error}` }])
        setLoading(false)
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Failed to send command' }])
      setLoading(false)
    }

    setPrompt('')
  }

  const parsePrompt = (text: string): { tool: string; args: any } => {
    const lower = text.toLowerCase()

    // Screen
    if (lower.includes('screenshot') || lower.includes('screen')) {
      return { tool: 'screen.capture', args: {} }
    }

    // System info
    if (lower.includes('system') || lower.includes('info') || lower.includes('specs')) {
      return { tool: 'system.info', args: {} }
    }

    // Terminal/command
    if (lower.startsWith('run ') || lower.startsWith('exec ') || lower.startsWith('!')) {
      const cmd = text.replace(/^(run|exec|!)\s*/, '')
      return { tool: 'terminal.run', args: { command: cmd } }
    }

    // Files
    if (lower.startsWith('ls ') || lower.startsWith('list ')) {
      const path = text.replace(/^(ls|list)\s*/, '')
      return { tool: 'files.list', args: { path: path || '.' } }
    }

    if (lower.startsWith('read ')) {
      const path = text.replace(/^read\s*/, '')
      return { tool: 'files.read', args: { path } }
    }

    // Default - try as terminal
    return { tool: 'terminal.run', args: { command: text } }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid #111',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          Hyper<span style={{ color: '#00d4ff' }}>Bot</span>
        </h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {aiReady && (
            <span style={{ 
              background: '#00ff8833', 
              padding: '4px 12px', 
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              AI Ready
            </span>
          )}
          <span style={{ color: '#888' }}>dashboard</span>
          <div style={{ width: '32px', height: '32px', background: '#222', borderRadius: '50%' }} />
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside style={{ width: '280px', background: '#0f0f0f', padding: '20px', borderRight: '1px solid #111' }}>
          <h3 style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '20px' }}>
            Your Machines
          </h3>
          
          {agents.length === 0 && (
            <p style={{ color: '#555', fontSize: '0.9rem' }}>
              No machines connected. Run the install command on a machine to connect it.
            </p>
          )}

          {agents.map(Agent => (
            <div
              key={Agent.id}
              onClick={() => setSelectedAgent(Agent.id)}
              style={{
                padding: '16px',
                marginBottom: '10px',
                background: selectedAgent === Agent.id ? '#111' : '#0a0a0a',
                borderRadius: '12px',
                border: selectedAgent === Agent.id ? '1px solid #00d4ff' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00ff88'
                }} />
                <span style={{ fontWeight: '500' }}>{Agent.name}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                {Agent.capabilities?.join(', ') || 'Connected'}
              </p>
            </div>
          ))}

          <button
            onClick={fetchAgents}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px dashed #333',
              borderRadius: '8px',
              color: '#666',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            ↻ Refresh
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
          {!selectedAgent ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              Select a machine to start
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflow: 'auto', marginBottom: '20px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div style={{
                      background: msg.role === 'user' ? '#00d4ff' : msg.role === 'system' ? '#222' : '#111',
                      color: msg.role === 'user' ? '#000' : '#fff',
                      padding: '12px 16px',
                      borderRadius: msg.role === 'user' ? '12px 12px 12px 0' : '12px',
                      maxWidth: '80%',
                      whiteSpace: 'pre-wrap',
                      fontFamily: msg.role === 'system' ? 'monospace' : 'inherit'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ color: '#00d4ff' }}>⟳ Processing...</div>
                )}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && (aiReady ? sendToAI() : sendCommand())}
                  placeholder={aiReady ? "Chat with AI or type a command..." : "Type a command..."}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={aiReady ? sendToAI : sendCommand}
                  disabled={loading || !prompt.trim()}
                  style={{
                    padding: '16px 32px',
                    background: '#00d4ff',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? '...' : '→'}
                </button>
              </div>

              {/* Quick commands */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['screenshot', 'system info', 'ls /tmp', '!pwd'].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => setPrompt(cmd)}
                    style={{
                      padding: '8px 16px',
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: '20px',
                      color: '#888',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
