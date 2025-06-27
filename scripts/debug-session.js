const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugSession() {
  try {
    console.log('=== 调试用户Session数据 ===')
    
    // 查询所有用户数据
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        aiCreditsRemaining: true,
        subscriptionStatus: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log('数据库中的用户数据:')
    users.forEach((user, index) => {
      console.log(`\n用户 ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  姓名: ${user.name}`)
      console.log(`  邮箱: ${user.email}`)
      console.log(`  手机: ${user.phone}`)
      console.log(`  AI积分: ${user.aiCreditsRemaining}`)
      console.log(`  会员状态: ${user.subscriptionStatus}`)
      console.log(`  角色: ${user.role}`)
      console.log(`  创建时间: ${user.createdAt}`)
      console.log(`  更新时间: ${user.updatedAt}`)
    })
    
    // 检查Session表（如果存在）
    try {
      const sessions = await prisma.session.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              aiCreditsRemaining: true,
              subscriptionStatus: true
            }
          }
        }
      })
      
      console.log('\n=== Session数据 ===')
      sessions.forEach((session, index) => {
        console.log(`\nSession ${index + 1}:`)
        console.log(`  Session ID: ${session.id}`)
        console.log(`  User ID: ${session.userId}`)
        console.log(`  过期时间: ${session.expires}`)
        console.log(`  关联用户: ${session.user?.name}`)
        console.log(`  用户AI积分: ${session.user?.aiCreditsRemaining}`)
        console.log(`  用户会员状态: ${session.user?.subscriptionStatus}`)
      })
    } catch (error) {
      console.log('\n注意: Session表不存在或无法访问')
    }
    
    // 检查Account表
    try {
      const accounts = await prisma.account.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              aiCreditsRemaining: true
            }
          }
        }
      })
      
      console.log('\n=== Account数据 ===')
      accounts.forEach((account, index) => {
        console.log(`\nAccount ${index + 1}:`)
        console.log(`  Provider: ${account.provider}`)
        console.log(`  Type: ${account.type}`)
        console.log(`  User ID: ${account.userId}`)
        console.log(`  关联用户: ${account.user?.name}`)
        console.log(`  用户AI积分: ${account.user?.aiCreditsRemaining}`)
      })
    } catch (error) {
      console.log('\n注意: Account表不存在或无法访问')
    }
    
  } catch (error) {
    console.error('调试过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSession()