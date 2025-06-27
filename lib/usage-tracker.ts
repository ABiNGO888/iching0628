import { db } from "@/lib/db"
import { headers } from "next/headers"

/**
 * 获取客户端IP地址
 */
function getClientIP(): string {
  const headersList = headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * 检查用户今日使用次数
 * @param userId 用户ID（可选，未登录用户为null）
 * @param sessionId 会话ID（未登录用户使用）
 * @returns 今日使用次数
 */
export async function getTodayUsage(
  userId?: string | null,
  sessionId?: string
): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    if (userId) {
      // 已登录用户
      const usage = await db.dailyUsage.findFirst({
        where: {
          userId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      })
      return usage?.usageCount || 0
    } else if (sessionId) {
      // 未登录用户（通过会话ID）
      const usage = await db.dailyUsage.findFirst({
        where: {
          sessionId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      })
      return usage?.usageCount || 0
    } else {
      // 通过IP地址限制（最后的备选方案）
      const ipAddress = getClientIP()
      const usage = await db.dailyUsage.findFirst({
        where: {
          ipAddress,
          userId: null,
          sessionId: null,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      })
      return usage?.usageCount || 0
    }
  } catch (error) {
    console.error('获取今日使用次数失败:', error)
    return 0
  }
}

/**
 * 增加使用次数
 * @param userId 用户ID（可选）
 * @param sessionId 会话ID（未登录用户使用）
 * @returns 是否成功
 */
export async function incrementUsage(
  userId?: string | null,
  sessionId?: string
): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const ipAddress = getClientIP()

  try {
    if (userId) {
      // 已登录用户
      await db.dailyUsage.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          usageCount: {
            increment: 1,
          },
          ipAddress,
        },
        create: {
          userId,
          date: today,
          usageCount: 1,
          ipAddress,
        },
      })
    } else if (sessionId) {
      // 未登录用户（通过会话ID）
      await db.dailyUsage.upsert({
        where: {
          sessionId_date: {
            sessionId,
            date: today,
          },
        },
        update: {
          usageCount: {
            increment: 1,
          },
          ipAddress,
        },
        create: {
          sessionId,
          date: today,
          usageCount: 1,
          ipAddress,
        },
      })
    } else {
      // 通过IP地址记录（最后的备选方案）
      const existingUsage = await db.dailyUsage.findFirst({
        where: {
          ipAddress,
          userId: null,
          sessionId: null,
          date: today,
        },
      })

      if (existingUsage) {
        await db.dailyUsage.update({
          where: { id: existingUsage.id },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        })
      } else {
        await db.dailyUsage.create({
          data: {
            date: today,
            usageCount: 1,
            ipAddress,
          },
        })
      }
    }
    return true
  } catch (error) {
    console.error('增加使用次数失败:', error)
    return false
  }
}

/**
 * 检查用户是否可以使用AI解卦功能
 * @param userId 用户ID（可选）
 * @param sessionId 会话ID（未登录用户使用）
 * @param subscriptionStatus 订阅状态
 * @returns 是否可以使用
 */
export async function canUseAIDivination(
  userId?: string | null,
  sessionId?: string,
  subscriptionStatus: string = 'free'
): Promise<{ canUse: boolean; reason?: string; remainingUses?: number }> {
  // 付费用户无限制
  if (subscriptionStatus === 'premium') {
    return { canUse: true }
  }

  // 免费用户每天1次
  const todayUsage = await getTodayUsage(userId, sessionId)
  const dailyLimit = 1
  
  if (todayUsage >= dailyLimit) {
    return {
      canUse: false,
      reason: '今日免费使用次数已用完，请明天再试或升级为会员',
      remainingUses: 0,
    }
  }

  return {
    canUse: true,
    remainingUses: dailyLimit - todayUsage,
  }
}

/**
 * 清理过期的使用记录（保留30天）
 */
export async function cleanupOldUsageRecords(): Promise<void> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    await db.dailyUsage.deleteMany({
      where: {
        date: {
          lt: thirtyDaysAgo,
        },
      },
    })
  } catch (error) {
    console.error('清理过期使用记录失败:', error)
  }
}