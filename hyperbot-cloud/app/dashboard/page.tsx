'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey! I\'m HyperBot. What do you need help with?' }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    if (!prompt.trim() || loading) return

    const userMessage = prompt
    setMessages(m => [...m, { role: 'user', content: userMessage }])
    setLoading(true)
    setPrompt('')

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      })

      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.response }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Oops! Something went wrong. Try again?' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0a', 
      color: '#fff', 
      fontFamily: 'system-ui',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '15px 30px',
        borderBottom: '1px solid #111',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: '700' }}>
          Hyper<span style={{ color: '#00d4ff' }}>Bot</span>
        </h1>
        <a href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Home</a>
      </header>

      {/* Chat */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '20px'
          }}>
            <div style={{
              background: msg.role === 'user' ? '#00d4ff' : msg.role === 'system' ? '#222' : '#111',
              color: msg.role === 'user' ? '#000' : '#fff',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              maxWidth: '75%',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#00d4ff', marginBottom: '20px' }}>Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        padding: '20px 30px 30px', 
        maxWidth: '800px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Tell me what to do..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: '#111',
              border: '1px solid #222',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !prompt.trim()}
            style={{
              padding: '16px 28px',
              background: '#00d4ff',
              border: 'none',
              borderRadius: '14px',
              color: '#000',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '...' : '→'}
          </button>
        </div>
        
        <p style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', marginTop: '15px' }}>
          Try: "Find my files from last week" or "Take a screenshot"
        </p>
      </div>
    </div>
  )
}
