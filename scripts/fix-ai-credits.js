const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAICredits() {
  try {
    console.log('开始修复AI积分...')
    
    // 将所有用户的AI积分重置为0
    const result = await prisma.user.updateMany({
      data: {
        aiCreditsRemaining: 0
      }
    })
    
    console.log(`已修复 ${result.count} 个用户的AI积分`)
    
    // 显示修复后的用户数据
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        aiCreditsRemaining: true,
        subscriptionStatus: true
      }
    })
    
    console.log('修复后的用户AI积分状态:')
    users.forEach(user => {
      console.log(`用户: ${user.name || user.email || user.phone}, AI积分: ${user.aiCreditsRemaining}, 会员状态: ${user.subscriptionStatus}`)
    })
    
  } catch (error) {
    console.error('修复AI积分时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAICredits()