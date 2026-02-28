// Screen capture using system tools
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

export async function capture(): Promise<any> {
  const dir = join(process.env.HOME || '/tmp', '.hyperbot', 'screenshots')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  
  const filename = `screen-${Date.now()}.png`
  const filepath = join(dir, filename)

  try {
    // Try scrot (Linux)
    await execAsync(`scrot "${filepath}"`)
    if (existsSync(filepath)) {
      return { success: true, path: filepath, filename, message: 'Screenshot saved' }
    }
  } catch {}

  try {
    // Try gnome-screenshot
    await execAsync(`gnome-screenshot -f "${filepath}"`)
    if (existsSync(filepath)) {
      return { success: true, path: filepath, filename, message: 'Screenshot saved' }
    }
  } catch {}

  try {
    // Try import (ImageMagick)
    await execAsync(`import -window root "${filepath}"`)
    if (existsSync(filepath)) {
      return { success: true, path: filepath, filename, message: 'Screenshot saved' }
    }
  } catch {}

  return { success: false, error: 'No screenshot tool available. Install scrot, gnome-screenshot, or ImageMagick.' }
}

export async function listScreens(): Promise<any> {
  return { success: true, screens: ['main'], message: 'Screen listing not fully implemented' }
}
