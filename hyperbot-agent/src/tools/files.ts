// File system tool
import { 
  readFileSync, 
  writeFileSync, 
  existsSync, 
  readdirSync, 
  statSync, 
  mkdirSync,
  rmSync,
  copyFileSync,
  renameSync
} from 'fs'
import { join, basename, extname } from 'path'
import { glob } from 'glob'

export function read(filePath: string): any {
  try {
    if (!existsSync(filePath)) {
      return { success: false, error: 'File not found' }
    }
    const content = readFileSync(filePath)
    const isBinary = content.slice(0, 4).some((b: number) => b === 0)
    
    if (isBinary) {
      return { success: false, error: 'Cannot read binary file' }
    }
    
    return {
      success: true,
      content: content.toString('utf-8').slice(0, 100000),
      size: content.length,
      path: filePath
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export function write(filePath: string, content: string): any {
  try {
    const dir = join(filePath, '..')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, content)
    return { success: true, path: filePath, size: content.length }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function list(dirPath: string): Promise<any> {
  try {
    if (!existsSync(dirPath)) {
      return { success: false, error: 'Directory not found' }
    }
    
    const items = readdirSync(dirPath).map(name => {
      const fullPath = join(dirPath, name)
      const stats = statSync(fullPath)
      return {
        name,
        path: fullPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime.toISOString()
      }
    })
    
    return { success: true, path: dirPath, items }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export function remove(targetPath: string): any {
  try {
    if (!existsSync(targetPath)) {
      return { success: false, error: 'Path not found' }
    }
    rmSync(targetPath, { recursive: true })
    return { success: true, path: targetPath }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export function copy(src: string, dest: string): any {
  try {
    copyFileSync(src, dest)
    return { success: true, src, dest }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export function move(src: string, dest: string): any {
  try {
    renameSync(src, dest)
    return { success: true, src, dest }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function search(pattern: string, cwd: string = '.'): Promise<any> {
  try {
    const files = await glob(pattern, { cwd })
    return { success: true, pattern, cwd, files: files.slice(0, 100) }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
