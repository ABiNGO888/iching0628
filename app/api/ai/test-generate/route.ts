import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    const { prompt, style } = await req.json()

    // 检查用户AI绘图额度
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { aiCreditsRemaining: true, subscriptionStatus: true },
    })

    if (!user) {
      return new NextResponse("用户不存在", { status: 404 })
    }

    // 如果用户没有剩余额度且不是会员，返回错误
    if (user.aiCreditsRemaining <= 0 && user.subscriptionStatus !== "premium") {
      return NextResponse.json({
        success: false,
        message: "AI绘图额度已用完",
        needsPayment: true,
      })
    }

    // 如果用户不是会员，减少AI绘图额度
    if (user.subscriptionStatus !== "premium") {
      await db.user.update({
        where: { id: session.user.id },
        data: { aiCreditsRemaining: { decrement: 1 } },
      })
    }

    // 返回模拟的图像URL
    return NextResponse.json({
      success: true,
      imageUrl: `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.substring(0, 20))}`,
      remainingCredits: user.subscriptionStatus === "premium" ? "unlimited" : user.aiCreditsRemaining - 1,
    })
  } catch (error) {
    console.error("[TEST_AI_GENERATE]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
