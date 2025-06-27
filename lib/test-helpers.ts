// 测试辅助函数
import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// 创建测试用户
export async function createTestUser(prisma: PrismaClient) {
  // 检查测试用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  })

  if (existingUser) {
    return existingUser
  }

  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      name: "测试用户",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
      aiCreditsRemaining: 10, // 给予足够的AI绘图额度用于测试
    },
  })

  return user
}

// 创建测试会员用户
export async function createTestPremiumUser(prisma: PrismaClient) {
  // 检查测试会员用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: "premium@example.com" },
  })

  if (existingUser) {
    return existingUser
  }

  // 设置会员过期时间（一个月后）
  const expiryDate = new Date()
  expiryDate.setMonth(expiryDate.getMonth() + 1)

  // 创建测试会员用户
  const user = await prisma.user.create({
    data: {
      name: "测试会员",
      email: "premium@example.com",
      password: await bcrypt.hash("password123", 10),
      subscriptionStatus: "premium",
      subscriptionExpires: expiryDate,
      aiCreditsRemaining: 999, // 会员用户不限制AI绘图次数
    },
  })

  return user
}

// 模拟第三方登录
export async function mockOAuthLogin(prisma: PrismaClient, provider: string) {
  // 检查模拟OAuth用户是否已存在
  const email = `oauth-${provider}@example.com`
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return existingUser
  }

  // 创建模拟OAuth用户
  const user = await prisma.user.create({
    data: {
      name: `${provider}用户`,
      email,
      image: `https://via.placeholder.com/150?text=${provider}`,
      aiCreditsRemaining: 0,
    },
  })

  // 创建关联的账户
  await prisma.account.create({
    data: {
      userId: user.id,
      type: "oauth",
      provider,
      providerAccountId: `mock-${provider}-id`,
      access_token: "mock-access-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
  })

  return user
}

// 模拟支付流程
export async function mockPayment(
  prisma: PrismaClient, 
  userId: string, 
  type: "subscription" | "ai_credits",
  customAmount?: number,
  customCredits?: number
) {
  const amount = customAmount || (type === "subscription" ? 5.9 : 9.9)
  const credits = customCredits || 500

  // 创建支付记录
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      type,
      status: "completed",
      orderId: `TEST_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    },
  })

  // 更新用户权益
  if (type === "subscription") {
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "premium",
        subscriptionExpires: expiryDate,
      },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiCreditsRemaining: { increment: credits },
      },
    })
  }

  return payment
}
