import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 })
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return new NextResponse("订单ID必须提供", { status: 400 })
    }

    // 查找支付订单
    const payment = await db.payment.findFirst({
      where: {
        orderId,
        userId: session.user.id,
      },
    })

    if (!payment) {
      return new NextResponse("订单不存在", { status: 404 })
    }

    // 模拟支付验证成功
    // 实际应用中，这里应该调用支付网关的API验证支付状态
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "completed" },
    })

    // 根据支付类型更新用户权益
    if (payment.type === "subscription") {
      // 更新订阅状态
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1) // 一个月订阅

      await db.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionStatus: "premium",
          subscriptionExpires: expiryDate,
        },
      })
    } else if (payment.type === "ai_credits") {
      // 增加AI绘图额度
      let creditsToAdd = 500; // 默认值
      
      // 如果有metadata，使用其中的credits值
      if (payment.metadata) {
        try {
          const metadata = JSON.parse(payment.metadata)
          if (metadata.credits) {
            creditsToAdd = metadata.credits
          }
        } catch (error) {
          console.error('解析payment metadata失败:', error)
        }
      }
      
      await db.user.update({
        where: { id: session.user.id },
        data: {
          aiCreditsRemaining: { increment: creditsToAdd },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "支付验证成功",
    })
  } catch (error) {
    console.error("[PAYMENT_VERIFY]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
