// 简单的内存速率限制实现
// 生产环境建议使用Redis或其他持久化存储

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * 速率限制函数
 * @param key 限制的键（如用户ID、IP地址等）
 * @param limit 限制次数
 * @param windowMs 时间窗口（毫秒）
 * @returns 是否允许请求
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // 如果没有记录或已过期，创建新记录
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  // 如果超过限制，拒绝请求
  if (entry.count >= limit) {
    return false
  }

  // 增加计数
  entry.count++
  rateLimitStore.set(key, entry)
  return true
}

/**
 * 清理过期的速率限制记录
 */
export function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// 每5分钟清理一次过期记录
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)