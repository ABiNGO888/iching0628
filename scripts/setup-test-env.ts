import { PrismaClient } from "@prisma/client"
import { createTestUser, createTestPremiumUser, mockOAuthLogin } from "../lib/test-helpers"

async function main() {
  console.log("开始设置测试环境...")

  const prisma = new PrismaClient()

  try {
    // 创建测试用户
    console.log("创建测试用户...")
    const testUser = await createTestUser(prisma)
    console.log(`测试用户创建成功: ${testUser.email}`)

    // 创建测试会员用户
    console.log("创建测试会员用户...")
    const premiumUser = await createTestPremiumUser(prisma)
    console.log(`测试会员用户创建成功: ${premiumUser.email}`)

    // 创建模拟OAuth用户
    console.log("创建模拟OAuth用户...")
    const wechatUser = await mockOAuthLogin(prisma, "wechat")
    console.log(`微信模拟用户创建成功: ${wechatUser.email}`)

    const alipayUser = await mockOAuthLogin(prisma, "alipay")
    console.log(`支付宝模拟用户创建成功: ${alipayUser.email}`)

    const qqUser = await mockOAuthLogin(prisma, "qq")
    console.log(`QQ模拟用户创建成功: ${qqUser.email}`)

    console.log("测试环境设置完成！")
    console.log("\n测试账号信息:")
    console.log("普通用户: test@example.com / password123")
    console.log("会员用户: premium@example.com / password123")
    console.log("第三方登录用户将通过模拟OAuth流程自动登录")
  } catch (error) {
    console.error("设置测试环境时出错:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
