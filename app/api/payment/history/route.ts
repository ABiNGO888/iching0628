import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
    }

    // 获取用户的充值记录
    const payments = await db.payment.findMany({
      where: {
        userEmail: session.user.email,
        status: "completed",
        type: "ai_credits"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20 // 最多返回20条记录
    })

    // 格式化充值记录
    const formattedPayments = payments.map(payment => {
      let packageName = "AI积分充值"
      let credits = 500 // 默认值
      
      // 尝试解析metadata获取具体信息
      if (payment.metadata) {
        try {
          const metadata = JSON.parse(payment.metadata)
          credits = metadata.credits || 500
          
          // 根据积分数量确定套餐名称
          if (credits === 100) {
            packageName = "基础套餐"
          } else if (credits === 500) {
            packageName = "标准套餐"
          } else if (credits === 1200) {
            packageName = "超值套餐"
          } else {
            packageName = `${credits}积分充值`
          }
        } catch (e) {
          // 如果解析失败，使用默认值
        }
      }
      
      return {
        id: payment.id,
        orderId: payment.orderId,
        packageName,
        amount: payment.amount,
        credits,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      payments: formattedPayments
    })
  } catch (error) {
    console.error("获取充值记录失败:", error)
    return NextResponse.json(
      { error: "获取充值记录失败" },
      { status: 500 }
    )
  }
}