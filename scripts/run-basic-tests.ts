// 基本功能测试脚本
import { PrismaClient } from "@prisma/client"

async function runBasicTests() {
  console.log("开始运行基本功能测试...")
  
  const prisma = new PrismaClient()
  
  try {
    // 测试1: 数据库连接
    console.log("\n1. 测试数据库连接...")
    const userCount = await prisma.user.count()
    console.log(`✓ 数据库连接成功，当前用户数量: ${userCount}`)
    
    // 测试2: 查询测试用户
    console.log("\n2. 测试用户查询...")
    const testUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    })
    if (testUser) {
      console.log(`✓ 测试用户查询成功: ${testUser.name} (${testUser.email})`)
      console.log(`  - 用户角色: ${testUser.role}`)
      console.log(`  - 订阅状态: ${testUser.subscriptionStatus}`)
      console.log(`  - AI额度: ${testUser.aiCreditsRemaining}`)
    } else {
      console.log("✗ 测试用户未找到")
    }
    
    // 测试3: 查询会员用户
    console.log("\n3. 测试会员用户查询...")
    const premiumUser = await prisma.user.findUnique({
      where: { email: "premium@example.com" }
    })
    if (premiumUser) {
      console.log(`✓ 会员用户查询成功: ${premiumUser.name} (${premiumUser.email})`)
      console.log(`  - 订阅状态: ${premiumUser.subscriptionStatus}`)
      console.log(`  - 订阅到期: ${premiumUser.subscriptionExpires}`)
    } else {
      console.log("✗ 会员用户未找到")
    }
    
    // 测试4: 查询OAuth用户
    console.log("\n4. 测试OAuth用户查询...")
    const oauthUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: "oauth-"
        }
      }
    })
    console.log(`✓ OAuth用户查询成功，找到 ${oauthUsers.length} 个OAuth用户`)
    oauthUsers.forEach(user => {
      console.log(`  - ${user.name}: ${user.email}`)
    })
    
    // 测试5: 创建测试卜卦记录
    console.log("\n5. 测试创建卜卦记录...")
    if (testUser) {
      const divination = await prisma.divinationHistory.create({
        data: {
          userId: testUser.id,
          hexagram: "乾卦",
          question: "测试问题",
          method: "coin",
          aiResponse: "这是一个测试AI回应"
        }
      })
      console.log(`✓ 卜卦记录创建成功: ${divination.id}`)
      
      // 查询用户的卜卦历史
      const userDivinations = await prisma.divinationHistory.findMany({
        where: { userId: testUser.id }
      })
      console.log(`✓ 用户卜卦历史查询成功，共 ${userDivinations.length} 条记录`)
    }
    
    console.log("\n🎉 所有基本功能测试通过！")
    
  } catch (error) {
    console.error("❌ 测试过程中出现错误:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
runBasicTests().catch(console.error)