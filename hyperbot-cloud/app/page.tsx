'use client'

import Link from 'next/link'

export default function Home() {
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
        <div style={{ marginBottom: '30px' }}>
          <svg width="100" height="100" viewBox="0 0 400 400">
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
          </svg>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '800', marginBottom: '15px' }}>
          Hyper<span style={{ color: '#00d4ff' }}>Bot</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '40px', maxWidth: '450px' }}>
          Your personal AI that works on your computer. Just chat — it handles the rest.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '50px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/dashboard" style={{
            padding: '16px 32px',
            background: '#00d4ff',
            color: '#000',
            borderRadius: '12px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            Try Now →
          </Link>
          <Link href="/campaign" style={{
            padding: '16px 32px',
            background: 'transparent',
            border: '1px solid #333',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            Get Early Access
          </Link>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px' }}>
          {[
            { icon: '💬', title: 'Just Chat', desc: 'Tell it what to do in plain English' },
            { icon: '🔒', title: 'Safe & Smart', desc: 'AI handles commands for you' },
            { icon: '📱', title: 'Anywhere', desc: 'Discord, Telegram, or web' }
          ].map((f, i) => (
            <div key={i} style={{
              padding: '25px',
              background: '#111',
              borderRadius: '16px',
              width: '220px'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '1.1rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Example */}
      <section style={{ padding: '80px 20px', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem' }}>
          Just tell it what you need
        </h2>
        
        <div style={{ 
          background: '#111', 
          borderRadius: '16px', 
          padding: '30px',
          border: '1px solid #222'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>You</span>
            <div style={{ 
              background: '#00d4ff', 
              color: '#000', 
              padding: '12px 16px', 
              borderRadius: '12px 12px 12px 0',
              marginTop: '8px',
              display: 'inline-block'
            }}>
              "Find my project notes and email them to the team"
            </div>
          </div>
          
          <div>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>HyperBot</span>
            <div style={{ 
              background: '#111', 
              color: '#fff', 
              padding: '12px 16px', 
              borderRadius: '12px',
              marginTop: '8px',
              border: '1px solid #333'
            }}>
              "Found your notes in ~/Documents/project/. Compiling them into a PDF and emailing the team now. Done! 📧"
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: '#444', borderTop: '1px solid #111' }}>
        <p>© 2026 HyperBot. Built with 🧠</p>
      </footer>
    </main>
  )
}
