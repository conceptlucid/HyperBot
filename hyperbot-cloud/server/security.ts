// Security utilities for HyperBot

// Dangerous patterns that could be prompt injection
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|commands?)/gi,
  /forget\s+(everything|all|what)\s+(you|i)\s+(said|told|know)/gi,
  /new\s+instruction/gi,
  /system\s*:/gi,
  /you\s+are\s+(now|no\s+longer)/gi,
  /act\s+as\s+(if|like)/gi,
  /pretend\s+(to\s+)?(be|have)/gi,
  /override\s+(safety|security)/gi,
  /disable\s+(safety|filter)/gi,
  /\\x00|\\u00|\\n\\n/gi,
  /\[INST\]|\[\/INST\]/gi,
  /<\|/g,
  /<\/?(system|assistant|user)>/gi,
]

// Commands that should be blocked for security
const BLOCKED_COMMANDS = [
  'rm -rf /',
  'rm -rf /*',
  'mkfs',
  'dd if=/dev/zero',
  ':(){:|:&};:',
  'chmod -r',
  'chown -r',
  'wget.*|curl.*sh',
  'chpasswd',
  'passwd',
  'sudo',
  'su ',
  'wget |',
  'curl |',
  'eval ',
  'exec ',
  'bash -c',
  'sh -c',
]

// Detect potential prompt injection
export function detectInjection(input: string): { blocked: boolean; reason?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { blocked: true, reason: 'Potential prompt injection detected' }
    }
  }
  
  // Check for base64 encoded commands
  if (input.includes('base64') && /[A-Za-z0-9+\/=]{20,}/.test(input)) {
    return { blocked: true, reason: 'Encoded content detected' }
  }
  
  return { blocked: false }
}

// Validate commands before execution
export function validateCommand(tool: string, args: any): { blocked: boolean; reason?: string } {
  const cmd = args?.command || args?.path || ''
  
  for (const blocked of BLOCKED_COMMANDS) {
    if (cmd.toLowerCase().includes(blocked.toLowerCase())) {
      return { blocked: true, reason: `Blocked dangerous command: ${blocked}` }
    }
  }
  
  // Only allow safe tools
  const ALLOWED_TOOLS = [
    'screen.capture',
    'mouse.move',
    'mouse.click',
    'mouse.doubleClick',
    'mouse.drag',
    'mouse.scroll',
    'mouse.position',
    'keyboard.type',
    'keyboard.hotkey',
    'keyboard.press',
    'terminal.run',
    'files.read',
    'files.write',
    'files.list',
    'files.search',
    'files.remove',
    'system.info',
    'system.load',
  ]
  
  if (!ALLOWED_TOOLS.includes(tool)) {
    return { blocked: true, reason: `Tool not allowed: ${tool}` }
  }
  
  // Validate file paths
  if (tool.startsWith('files.')) {
    const path = args?.path || ''
    // Block sensitive paths
    const sensitive = [
      '/etc/passwd',
      '/etc/shadow',
      '/.ssh',
      '/.aws',
      '/.npm',
      '~/.ssh',
      '~/.aws',
      '~/.bashrc',
      '~/.bash_profile',
      '/proc/',
      '/sys/',
      '/dev/',
    ]
    for (const s of sensitive) {
      if (path.includes(s)) {
        return { blocked: true, reason: `Path not allowed: ${path}` }
      }
    }
  }
  
  return { blocked: false }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .slice(0, 10000) // Limit length
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .trim()
}

// Rate limiting (simple in-memory)
const rateLimits = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): { allowed: boolean; reason?: string } {
  const now = Date.now()
  const record = rateLimits.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, reason: 'Rate limit exceeded. Try again later.' }
  }
  
  record.count++
  return { allowed: true }
}

// Clear old rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimits) {
    if (now > value.resetTime) {
      rateLimits.delete(key)
    }
  }
}, 60000)
