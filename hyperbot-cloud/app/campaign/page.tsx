'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Landing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      // Here you'd send to your backend/email service
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(ellipse at top, #1a1a3e 0%, #0a0a0a 70%)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <svg width="120" height="120" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0066ff;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="180" fill="url(#grad)"/>
            <rect x="120" y="100" width="160" height="140" rx="20" fill="#0a0a0a"/>
            <circle cx="160" cy="160" r="25" fill="#00d4ff"/>
            <circle cx="240" cy="160" r="25" fill="#00d4ff"/>
            <circle cx="168" cy="152" r="8" fill="#fff"/>
            <circle cx="248" cy="152" r="8" fill="#fff"/>
            <rect x="155" y="190" width="90" height="20" rx="10" fill="#00d4ff"/>
            <line x1="200" y1="100" x2="200" y2="60" stroke="#0a0a0a" strokeWidth="8"/>
            <circle cx="200" cy="50" r="15" fill="#00d4ff"/>
            <rect x="80" y="260" width="240" height="100" rx="10" fill="#0a0a0a" stroke="#00d4ff" strokeWidth="4"/>
            <rect x="90" y="270" width="220" height="80" fill="#111"/>
            <line x1="100" y1="290" x2="180" y2="290" stroke="#00d4ff" strokeWidth="3"/>
            <line x1="100" y1="310" x2="220" y2="310" stroke="#00d4ff" strokeWidth="3"/>
            <line x1="100" y1="330" x2="160" y2="330" stroke="#00ff88" strokeWidth="3"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: '800', marginBottom: '20px' }}>
          Hyper<span style={{ color: '#00d4ff' }}>Bot</span>
        </h1>
        
        <p style={{ fontSize: '1.3rem', color: '#888', marginBottom: '30px', maxWidth: '500px' }}>
          Your personal AI that controls any computer. From anywhere.
        </p>

        {/* CTA */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                padding: '16px 20px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                width: '250px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                background: '#00d4ff',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Get Early Access
            </button>
          </form>
        ) : (
          <div style={{ 
            background: '#00ff8833', 
            color: '#000', 
            padding: '16px 32px', 
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            ✓ You're on the list! We'll notify you.
          </div>
        )}

        {/* Features */}
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px' }}>
          {[
            { icon: '🖥️', title: 'Full Control', desc: 'Mouse, keyboard, screen' },
            { icon: '☁️', title: 'Cloud Powered', desc: 'Access from anywhere' },
            { icon: '🤖', title: 'AI Powered', desc: 'Natural conversations' },
            { icon: '🔒', title: 'Secure', desc: 'Your data stays yours' }
          ].map((f, i) => (
            <div key={i} style={{
              padding: '20px',
              background: '#111',
              borderRadius: '16px',
              width: '180px'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Install command */}
        <div style={{ marginTop: '50px', padding: '20px', background: '#111', borderRadius: '12px' }}>
          <p style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem' }}>Install now:</p>
          <code style={{ color: '#00d4ff', fontSize: '1.1rem' }}>curl -sL hyperbot.sh | bash</code>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: '#444', borderTop: '1px solid #111' }}>
        <p>© 2026 HyperBot. Built with 🧠</p>
      </footer>
    </main>
  )
}
