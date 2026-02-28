// System info tool
import * as os from 'os'
import * as si from 'systeminformation'

export async function info(): Promise<any> {
  try {
    const [cpu, mem, disk, network, osInfo, processes, users] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkInterfaces(),
      si.osInfo(),
      si.processes(),
      si.users()
    ])

    return {
      success: true,
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: os.uptime(),
        type: osInfo.distro,
        kernel: osInfo.kernel,
        version: osInfo.release
      },
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usedPercent: (mem.used / mem.total) * 100
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        usePercent: d.use
      })),
      network: network.map(n => ({
        iface: n.iface,
        ip4: n.ip4,
        ip6: n.ip6,
        mac: n.mac,
        type: n.type
      })),
      processes: {
        all: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping
      },
      users: users.map(u => ({
        user: u.user,
        tty: u.tty,
        host: u.host,
        started: u.started
      }))
    }
  } catch (err: any) {
    // Fallback to basic info
    return {
      success: true,
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        uptime: os.uptime(),
        type: os.type()
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      error: 'Basic info only, some metrics unavailable'
    }
  }
}

export function load(): any {
  return {
    success: true,
    load: os.loadavg(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem(),
    uptime: os.uptime()
  }
}

export function hostname(): any {
  return {
    success: true,
    hostname: os.hostname()
  }
}
