import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 只在开发环境允许清零操作
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: '此功能仅在开发环境可用' },
        { status: 403 }
      )
    }

    // 更新用户的AI积分为0
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        aiCreditsRemaining: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'AI积分已清零',
      aiCreditsRemaining: updatedUser.aiCreditsRemaining
    })
  } catch (error) {
    console.error('清零AI积分失败:', error)
    return NextResponse.json(
      { error: '清零失败' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}