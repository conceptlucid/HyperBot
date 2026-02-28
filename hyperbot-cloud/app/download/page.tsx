export default function Download() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui', padding: '40px' }}>
      <a href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back</a>
      
      <h1 style={{ fontSize: '3rem', marginTop: '40px', marginBottom: '20px' }}>
        Install HyperBot
      </h1>
      <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '40px' }}>
        One command to connect your machine to the cloud
      </p>

      {/* Install */}
      <div style={{ background: '#111', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>macOS / Linux</h3>
        <div style={{
          background: '#000',
          padding: '20px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>curl -sL hyperbot.sh | bash</span>
          <button style={{
            padding: '8px 16px',
            background: '#222',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer'
          }}>
            Copy
          </button>
        </div>
      </div>

      <div style={{ background: '#111', borderRadius: '16px', padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Windows (PowerShell)</h3>
        <div style={{
          background: '#000',
          padding: '20px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '1.1rem'
        }}>
          iwr hyperbot.ps1 | iex
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ marginBottom: '30px' }}>After install:</h2>
        <ol style={{ color: '#888', lineHeight: '2', fontSize: '1.1rem' }}>
          <li>Get your API key from <a href="/dashboard" style={{ color: '#00d4ff' }}>dashboard</a></li>
          <li>Edit ~/.hyperbot/config.json</li>
          <li>Run ~/.hyperbot/start.sh</li>
          <li>Your machine will appear in the dashboard!</li>
        </ol>
      </div>
    </div>
  )
}
