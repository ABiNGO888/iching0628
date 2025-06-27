import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    // 只在开发环境下允许
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "开发者登录仅在开发环境下可用" },
        { status: 403 }
      )
    }

    const developerEmail = "developer@iching.dev"
    const developerPassword = "developer123"

    // 检查开发者用户是否存在
    let user = await db.user.findUnique({
      where: { email: developerEmail },
    })

    // 如果不存在，创建开发者用户
    if (!user) {
      const hashedPassword = await bcrypt.hash(developerPassword, 12)
      
      user = await db.user.create({
        data: {
          email: developerEmail,
          name: "开发者",
          password: hashedPassword,
          role: "ADMIN",
          isDeveloper: true,
          aiCreditsRemaining: 0, // 开发者默认0次AI解卦
        },
      })
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      message: "开发者用户已准备就绪",
    })
  } catch (error) {
    console.error("创建开发者用户失败:", error)
    return NextResponse.json(
      { error: "创建开发者用户失败" },
      { status: 500 }
    )
  }
}