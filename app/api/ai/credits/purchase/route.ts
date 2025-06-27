import { NextRequest, NextResponse } from "next/server"
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
    const { packageId, amount, credits } = body

    if (!packageId || !amount || !credits) {
      return new NextResponse("缺少必要参数", { status: 400 })
    }

    // 创建支付订单
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount: amount,
        type: "ai_credits",
        status: "pending",
        orderId: `AI_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        metadata: JSON.stringify({ packageId, credits })
      },
    })

    // 返回支付链接
    return NextResponse.json({
      success: true,
      orderId: payment.orderId,
      paymentUrl: `/payment/process?orderId=${payment.orderId}`,
    })
  } catch (error) {
    console.error("[AI_CREDITS_PURCHASE]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
