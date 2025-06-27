import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// 支付请求验证
const paymentSchema = z.object({
  type: z.enum(["subscription", "ai_credits"]),
  amount: z.number().positive(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 })
    }

    const body = await req.json()
    const { type, amount } = paymentSchema.parse(body)

    // 创建支付订单
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount,
        type,
        status: "pending",
        orderId: `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
    })

    // 这里应该集成实际的支付网关（如微信支付、支付宝等）
    // 简化示例，直接返回订单信息
    return NextResponse.json({
      success: true,
      orderId: payment.orderId,
      paymentUrl: `/payment/process?orderId=${payment.orderId}`,
    })
  } catch (error) {
    console.error("[PAYMENT_CREATE]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
