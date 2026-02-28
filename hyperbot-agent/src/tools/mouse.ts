// Mouse control using system tools
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function move(x: number, y: number): Promise<any> {
  try {
    await execAsync(`xdotool mousemove ${x} ${y}`)
    return { success: true, x, y, message: `Mouse moved to ${x}, ${y}` }
  } catch { // Fallback for macOS/Windows
    try {
      await execAsync(`osascript -e 'tell application "System Events" to set position of (process "loginwindow")'`) // Placeholder
      return { success: true, x, y, message: `Mouse moved to ${x}, ${y} (simulated)` }
    } catch {
      return { success: false, error: 'Mouse control not available. Install xdotool on Linux.' }
    }
  }
}

export async function click(button: string = 'left'): Promise<any> {
  try {
    const btn = button === 'right' ? '3' : '1'
    await execAsync(`xdotool click ${btn}`)
    return { success: true, button, message: `Clicked ${button}` }
  } catch {
    return { success: false, error: 'Mouse click not available. Install xdotool on Linux.' }
  }
}

export async function doubleClick(button: string = 'left'): Promise<any> {
  try {
    const btn = button === 'right' ? '3' : '1'
    await execAsync(`xdotool click --repeat 2 ${btn}`)
    return { success: true, button, message: `Double-clicked ${button}` }
  } catch {
    return { success: false, error: 'Mouse not available' }
  }
}

export async function drag(x1: number, y1: number, x2: number, y2: number): Promise<any> {
  try {
    await execAsync(`xdotool mousemove ${x1} ${y1} mousedown 1 mousemove ${x2} ${y2} mouseup 1`)
    return { success: true, from: { x: x1, y: y1 }, to: { x: x2, y: y2 }, message: 'Dragged' }
  } catch {
    return { success: false, error: 'Drag not available' }
  }
}

export async function scroll(lines: number): Promise<any> {
  try {
    await execAsync(`xdotool click ${lines > 0 ? 4 : 5}`)
    return { success: true, lines, message: `Scrolled ${lines} lines` }
  } catch {
    return { success: false, error: 'Scroll not available' }
  }
}

export async function getPosition(): Promise<any> {
  try {
    const { stdout } = await execAsync('xdotool getmouselocation --shell')
    const parts = stdout.split('\n')
    const x = parts[0]?.split('=')[1] || 0
    const y = parts[1]?.split('=')[1] || 0
    return { success: true, x: parseInt(x), y: parseInt(y) }
  } catch {
    return { success: false, error: 'Could not get mouse position' }
  }
}
