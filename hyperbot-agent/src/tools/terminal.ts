// Terminal execution with sandboxing
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)

// Language detection and execution
const LANGUAGES: Record<string, { ext: string; cmd: (file: string) => string; timeout: number }> = {
  python: { ext: '.py', cmd: f => `python3 "${f}"`, timeout: 30 },
  python3: { ext: '.py', cmd: f => `python3 "${f}"`, timeout: 30 },
  python2: { ext: '.py', cmd: f => `python2 "${f}"`, timeout: 30 },
  node: { ext: '.js', cmd: f => `node "${f}"`, timeout: 30 },
  nodejs: { ext: '.js', cmd: f => `node "${f}"`, timeout: 30 },
  javascript: { ext: '.js', cmd: f => `node "${f}"`, timeout: 30 },
  bash: { ext: '.sh', cmd: f => `bash "${f}"`, timeout: 30 },
  sh: { ext: '.sh', cmd: f => `sh "${f}"`, timeout: 30 },
  ruby: { ext: '.rb', cmd: f => `ruby "${f}"`, timeout: 30 },
  php: { ext: '.php', cmd: f => `php "${f}"`, timeout: 30 },
  go: { ext: '.go', cmd: f => `go run "${f}"`, timeout: 60 },
  rust: { ext: '.rs', cmd: f => `rustc "${f}" -o /tmp/runner && /tmp/runner`, timeout: 120 },
  java: { ext: '.java', cmd: f => `cd /tmp && javac "${path.basename(f)}" && java "${path.basename(f, '.java')}"`, timeout: 60 },
  c: { ext: '.c', cmd: f => `gcc "${f}" -o /tmp/runner && /tmp/runner`, timeout: 60 },
  cpp: { ext: '.cpp', cmd: f => `g++ "${f}" -o /tmp/runner && /tmp/runner`, timeout: 60 },
  powershell: { ext: '.ps1', cmd: f => `pwsh "${f}"`, timeout: 30 },
  typescript: { ext: '.ts', cmd: f => `npx ts-node "${f}"`, timeout: 60 },
}

// Detect language from code
function detectLanguage(code: string): string | null {
  if (code.includes('import ') || code.includes('from ') && code.includes('def ')) return 'python'
  if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript'
  if (code.includes('fn main()') || code.includes('println!')) return 'rust'
  if (code.includes('func ') && code.includes('package ')) return 'go'
  if (code.includes('public class') || code.includes('private void')) return 'java'
  if (code.includes('#!/bin/bash') || code.startsWith('#!')) return 'bash'
  if (code.includes('<?php')) return 'php'
  if (code.includes('$') && code.includes('function')) return 'powershell'
  return null
}

// Run code with sandbox
export async function runCode(code: string, language?: string, timeout: number = 30000): Promise<any> {
  const lang = language || detectLanguage(code) || 'bash'
  const config = LANGUAGES[lang]
  
  if (!config) {
    return { 
      success: false, 
      error: `Language not supported: ${lang}. Supported: ${Object.keys(LANGUAGES).join(', ')}` 
    }
  }

  // Create temp file
  const tmpDir = os.tmpdir()
  const fileName = `hyperbot_${Date.now()}${config.ext}`
  const filePath = path.join(tmpDir, fileName)
  
  try {
    // Write code to file
    fs.writeFileSync(filePath, code)
    
    // Run with timeout
    const startTime = Date.now()
    const { stdout, stderr } = await execAsync(config.cmd(filePath), { 
      timeout: Math.min(timeout, config.timeout * 1000),
      maxBuffer: 1024 * 1024, // 1MB output max
      cwd: tmpDir,
      env: { 
        ...process.env, 
        // Restrict environment
        HOME: tmpDir,
        TMPDIR: tmpDir
      }
    })
    
    const duration = Date.now() - startTime
    
    // Clean up
    try { fs.unlinkSync(filePath) } catch {}
    try { fs.unlinkSync('/tmp/runner') } catch {}
    
    return {
      success: true,
      language: lang,
      stdout: stdout.slice(0, 50000),
      stderr: stderr.slice(0, 5000),
      duration: `${duration}ms`
    }
    
  } catch (err: any) {
    const duration = Date.now() - Date.now()
    
    // Clean up
    try { fs.unlinkSync(filePath) } catch {}
    
    return {
      success: false,
      language: lang,
      error: err.message,
      stderr: err.stderr?.slice(0, 5000) || '',
      code: err.code,
      duration: `${duration}ms`
    }
  }
}

// Simple command execution (existing)
export async function run(command: string, timeout: number = 30000): Promise<any> {
  // Security: block dangerous commands
  const dangerous = ['rm -rf /', 'mkfs', 'dd if=/dev/zero', ':(){:|:&};:', 'chpasswd', 'passwd']
  for (const d of dangerous) {
    if (command.toLowerCase().includes(d)) {
      return { success: false, error: 'Command blocked for safety' }
    }
  }

  try {
    const { stdout, stderr } = await execAsync(command, { 
      timeout,
      maxBuffer: 10 * 1024 * 1024
    })

    return {
      success: true,
      stdout: stdout.slice(-50000),
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

export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGES)
}
