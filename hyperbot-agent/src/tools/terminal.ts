// Terminal execution tool
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function run(command: string, timeout: number = 30000): Promise<any> {
  try {
    // Security: whitelist dangerous commands
    const dangerous = ['rm -rf /', 'mkfs', 'dd if=/dev/zero', ':(){:|:&};:']
    for (const d of dangerous) {
      if (command.includes(d)) {
        return { success: false, error: 'Command blocked for safety' }
      }
    }

    const { stdout, stderr } = await execAsync(command, { 
      timeout,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    })

    return {
      success: true,
      stdout: stdout.slice(-50000), // Limit output
      stderr: stderr.slice(-5000),
      command
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      code: err.code,
      command
    }
  }
}

export async function runBackground(command: string): Promise<any> {
  const { spawn } = await import('child_process')
  const child = spawn(command, [], { 
    shell: true, 
    detached: true,
    stdio: 'ignore' 
  })
  child.unref()
  
  return {
    success: true,
    pid: child.pid,
    message: `Started background process`
  }
}
