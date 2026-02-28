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
        padding: '120px 20px 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0a 70%)'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '20px' }}>
          Hyper<span style={{ color: '#00d4ff' }}>Bot</span>
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#888', marginBottom: '40px' }}>
          Your personal AI that controls any computer
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/download" style={{
            padding: '16px 32px',
            background: '#00d4ff',
            color: '#000',
            borderRadius: '12px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Download Agent
          </Link>
          <Link href="/dashboard" style={{
            padding: '16px 32px',
            background: 'transparent',
            border: '1px solid #333',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none'
          }}>
            Dashboard →
          </Link>
        </div>

        <p style={{ marginTop: '30px', color: '#555', fontSize: '0.9rem' }}>
          curl -sL hyperbot.sh | bash
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '40px', textAlign: 'center' }}>Why HyperBot?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {[
            { title: 'Full Control', desc: 'Screen, mouse, keyboard, files — complete access' },
            { title: 'Cloud Connected', desc: 'Control your machines from anywhere' },
            { title: 'Easy Install', desc: 'One command: curl -sL hyperbot.sh | bash' },
            { title: 'Works Everywhere', desc: 'macOS, Linux, Windows — any device' }
          ].map((f, i) => (
            <div key={i} style={{
              padding: '30px',
              background: '#111',
              borderRadius: '16px',
              border: '1px solid #222'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#00d4ff' }}>{f.title}</h3>
              <p style={{ color: '#888' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', color: '#444', borderTop: '1px solid #111' }}>
        <p>© 2026 HyperBot. Built with 🦞</p>
      </footer>
    </main>
  )
}
