import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { mockOAuthLogin } from "@/lib/test-helpers"
import { cookies } from "next/headers"
import { encode } from "next-auth/jwt"

// 仅在测试模式下可用的API路由
export async function POST(req: Request) {
  // 检查是否为测试模式
  if (process.env.NEXT_PUBLIC_TEST_MODE !== "true") {
    return new NextResponse("仅在测试模式下可用", { status: 403 })
  }

  try {
    const { provider } = await req.json()

    if (!provider) {
      return new NextResponse("缺少provider参数", { status: 400 })
    }

    // 模拟OAuth登录
    const user = await mockOAuthLogin(db, provider)

    // 创建会话
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        aiCreditsRemaining: user.aiCreditsRemaining,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    // 创建JWT令牌
    const token = await encode({
      token: session,
      secret: process.env.NEXTAUTH_SECRET || "test-secret",
    })

    // 设置会话cookie
    cookies().set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[TEST_OAUTH]", error)
    return new NextResponse("内部错误", { status: 500 })
  }
}
