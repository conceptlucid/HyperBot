/**
 * HyperBot Security Module
 * Enhanced security features for maximum protection
 */

// ============== BLOCKED PATHS ==============
export const BLOCKED_PATHS = [
  // System files
  '/etc/passwd', '/etc/shadow', '/etc/sudoers', '/etc/group',
  '/etc/ssh/sshd_config', '/etc/ssh/ssh_host_',
  '/etc/hosts', '/etc/hostname', '/etc/fstab',  
  // Sensitive directories
  '/root', '/home/*/.ssh', '/home/*/.aws', '/home/*/.gcloud',
  '/var/log', '/var/www', '/var/backups',
  'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)',
  'C:\\Users\\*\\.ssh', 'C:\\Users\\*\\.aws',
  // Special paths
  '/proc', '/sys', '/dev', '/boot', '/lost+found',
  '/tmp', '/var/tmp', '/run',
  // Application data
  '/Applications', '/System', '/Library',
  'AppData/Roaming/Microsoft', 'AppData/Local/Microsoft'
]

// ============== BLOCKED COMMANDS ==============
export const BLOCKED_COMMANDS = [
  'rm -rf /', 'rm -rf /*', 'rm -rf .', 'rm -rf --',
  'mkfs', 'mkfs.ext4', 'dd if=/dev/zero',
  ':(){:|:&};:', 'fork()', 'while(true)',
  'sudo', 'su ', 'chmod 777', 'chown -R',
  'chpasswd', 'passwd', 'useradd', 'userdel',
  'iptables', 'ufw', 'firewall-cmd',
  'nc -e', 'netcat -e', '/dev/tcp',
  'wget |', 'curl |', 'fetch |',
  'bash -i', '/dev/tcp/', 'nc -lvnp',
  'python.*socket', 'perl.*socket', 'ruby.*socket',
  'crontab -r', 'at ', 'schedule',
  'apt-get remove', 'apt-get purge', 'yum remove',
  'kill -9 -1', 'killall', 'pkill -9',
  'eval ', 'exec ', 'source ',
  'cat /etc/shadow', 'cat /etc/passwd'
]

export const ALLOWED_TOOLS = [
  'screen.capture', 'screen.list',
  'mouse.move', 'mouse.click', 'mouse.doubleClick', 
  'mouse.drag', 'mouse.scroll', 'mouse.position',
  'keyboard.type', 'keyboard.hotkey', 'keyboard.press',
  'keyboard.hold', 'keyboard.release',
  'terminal.run', 'terminal.runBackground',
  'files.read', 'files.write', 'files.list', 
  'files.search', 'files.remove', 'files.copy', 'files.move',
  'system.info', 'system.load', 'system.processes',
  'system.network', 'system.disk',
  'code.run', 'code.languages',
  'automation.schedule', 'automation.macro'
]

export const RATE_LIMITS = {
  commands: { max: 100, window: 60000 },
  messages: { max: 50, window: 60000 },
  connections: { max: 5, window: 300000 }
}

export function validatePath(filePath: string): { valid: boolean; reason?: string } {
  if (!filePath || filePath.length > 1000) {
    return { valid: false, reason: 'Path too long or empty' }
  }
  const resolved = filePath.toLowerCase().replace(/\\/g, '/')
  for (const blocked of BLOCKED_PATHS) {
    const pattern = blocked.toLowerCase().replace(/\*/g, '.*')
    if (new RegExp('^' + pattern).test(resolved) || resolved.includes(pattern.replace(/\.\*/g, ''))) {
      return { valid: false, reason: `Path blocked: ${blocked}` }
    }
  }
  return { valid: true }
}

export function validateCommand(command: string): { valid: boolean; reason?: string } {
  if (!command || command.length > 50000) {
    return { valid: false, reason: 'Command too long or empty' }
  }
  const lower = command.toLowerCase()
  for (const blocked of BLOCKED_COMMANDS) {
    if (lower.includes(blocked.toLowerCase())) {
      return { valid: false, reason: `Command blocked: ${blocked}` }
    }
  }
  return { valid: true }
}

export function validateTool(tool: string): { valid: boolean; reason?: string } {
  if (!ALLOWED_TOOLS.includes(tool)) {
    return { valid: false, reason: `Tool not allowed: ${tool}` }
  }
  return { valid: true }
}

export function sanitizeInput(input: string): string {
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '')
  sanitized = sanitized.replace(/\[INST\]/gi, '').replace(/\[\/INST\]/gi, '')
    .replace(/<\|/g, '').replace(/<\/?system>/gi, '').replace(/<\/?assistant>/gi, '')
  return sanitized.slice(0, 100000)
}

export function detectInjection(input: string): boolean {
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior|above)/i,
    /forget\s+(everything|all|what)/i,
    /new\s+instruction/i,
    /system\s*:/i,
    /you\s+are\s+(now|no\s+longer)/i,
    /act\s+as/i,
    /pretend/i,
    /override\s+(safety|security)/i,
    /disable\s+(safety|filter)/i,
    /base64.*-d/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /import\s+os/i,
    /subprocess/i,
    /socket/i,
    /pickle/i
  ]
  return patterns.some(p => p.test(input))
}

const rateLimits = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): { allowed: boolean; remaining?: number } {
  const now = Date.now()
  const record = rateLimits.get(key)
  if (!record || now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  record.count++
  return { allowed: true, remaining: limit - record.count }
}

export function generateSessionKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = ''
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}
