/**
 * 简单的内存速率限制器
 * 注意：在生产环境（Vercel）中，建议使用 Upstash Redis 等外部存储
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()

  /**
   * 检查并记录请求
   * @param identifier 唯一标识符（IP地址或用户ID）
   * @param limit 时间窗口内的最大请求数
   * @param windowMs 时间窗口（毫秒）
   * @returns 是否允许请求
   */
  check(identifier: string, limit: number, windowMs: number): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    // 如果没有记录或已过期，创建新记录
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      }
      this.requests.set(identifier, newEntry)

      // 自动清理过期记录
      setTimeout(() => this.requests.delete(identifier), windowMs)

      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // 检查是否超过限制
    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // 增加计数
    entry.count++
    this.requests.set(identifier, entry)

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * 重置指定标识符的计数
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * 清理所有过期记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// 导出单例实例
export const rateLimiter = new RateLimiter()

/**
 * 速率限制配置
 */
export const RATE_LIMIT_CONFIG = {
  // 登录接口：5次/15分钟
  LOGIN: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
  // 文件上传：20次/小时
  UPLOAD: {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  },
  // 通用API：100次/分钟
  GENERAL: {
    limit: 100,
    windowMs: 60 * 1000,
  },
} as const

/**
 * 获取客户端IP地址
 */
export function getClientIP(event: any): string {
  // 尝试从各种头部获取真实IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
  ]

  for (const header of headers) {
    const value = getHeader(event, header)
    if (value) {
      // x-forwarded-for 可能包含多个IP，取第一个
      const ips = value.split(',').map(ip => ip.trim())
      const firstIp = ips[0]
      if (firstIp) {
        return firstIp
      }
    }
  }

  // 回退到连接地址
  return event.node.req.socket?.remoteAddress || 'unknown'
}
