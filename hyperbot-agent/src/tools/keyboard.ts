// Keyboard control using system tools
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function type(text: string): Promise<any> {
  try {
    // Escape special characters
    const escaped = text.replace(/"/g, '\\"').replace(/'/g, "\\'")
    await execAsync(`xdotool type --delay 50 "${escaped}"`)
    return { success: true, text, message: `Typed: ${text}` }
  } catch {
    return { success: false, error: 'Keyboard not available. Install xdotool on Linux.' }
  }
}

export async function hotkey(...keys: string[]): Promise<any> {
  try {
    await execAsync(`xdotool key ${keys.join('+')}`)
    return { success: true, keys, message: `Pressed: ${keys.join('+')}` }
  } catch {
    return { success: false, error: 'Hotkey not available' }
  }
}

export async function press(key: string): Promise<any> {
  try {
    await execAsync(`xdotool key ${key}`)
    return { success: true, key, message: `Pressed: ${key}` }
  } catch {
    return { success: false, error: 'Key press not available' }
  }
}

export async function hold(key: string): Promise<any> {
  try {
    await execAsync(`xdotool keydown ${key}`)
    return { success: true, key, message: `Holding: ${key}` }
  } catch {
    return { success: false, error: 'Keyboard not available' }
  }
}

export async function release(key: string): Promise<any> {
  try {
    await execAsync(`xdotool keyup ${key}`)
    return { success: true, key, message: `Released: ${key}` }
  } catch {
    return { success: false, error: 'Keyboard not available' }
  }
}
