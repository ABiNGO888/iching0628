import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { mockPayment } from "@/lib/test-helpers"

// 仅在测试模式下可用的API路由
export async function POST(req: Request) {
  // 检查是否为测试模式
  if (process.env.NEXT_PUBLIC_TEST_MODE !== "true") {
    return new NextResponse("仅在测试模式下可用", { status: 403 })
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("未授权", { status: 401 })
    }

    const { type, amount, credits } = await req.json()

    if (!type || !["subscription", "ai_credits"].includes(type)) {
      return new NextResponse("无效的支付类型", { status: 400 })
    }

    // 模拟支付
    const payment = await mockPayment(db, session.user.id, type as "subscription" | "ai_credits", amount, credits)

    return NextResponse.json({
      success: true,
      message: "测试支付成功",
      payment,
    })
  } catch (error) {
    console.error("[TEST_PAYMENT]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
