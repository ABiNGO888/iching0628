import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

// 短信验证码发送API
export async function POST(req: NextRequest) {
  try {
    const { phone, action } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: "手机号不能为空" }, { status: 400 })
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 })
    }

    // 限制发送频率（每分钟最多1次）
    const rateLimitKey = `sms:${phone}`
    const isAllowed = await rateLimit(rateLimitKey, 1, 60) // 1次/分钟
    
    if (!isAllowed) {
      return NextResponse.json({ error: "发送过于频繁，请稍后再试" }, { status: 429 })
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 设置过期时间（5分钟）
    const expires = new Date(Date.now() + 5 * 60 * 1000)

    // 保存验证码到数据库
    await db.smsVerification.create({
      data: {
        phone,
        code,
        expires,
      },
    })

    // 在开发环境下，直接返回验证码（生产环境应该调用短信服务）
    if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST_MODE === "true") {
      return NextResponse.json({ 
        success: true, 
        message: "验证码发送成功",
        // 开发环境下返回验证码
        code: process.env.NODE_ENV === "development" ? code : undefined
      })
    }

    // 生产环境：调用短信服务发送验证码
    // TODO: 集成阿里云短信服务或其他短信提供商
    // await sendSMS(phone, code)

    return NextResponse.json({ 
      success: true, 
      message: "验证码发送成功" 
    })

  } catch (error) {
    console.error("发送短信验证码失败:", error)
    return NextResponse.json(
      { error: "发送验证码失败，请稍后重试" },
      { status: 500 }
    )
  }
}

// 验证短信验证码API
export async function PUT(req: NextRequest) {
  try {
    const { phone, code } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "手机号和验证码不能为空" }, { status: 400 })
    }

    // 查找验证码记录
    const verification = await db.smsVerification.findFirst({
      where: {
        phone,
        code,
        verified: false,
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verification) {
      return NextResponse.json({ error: "验证码无效或已过期" }, { status: 400 })
    }

    // 标记验证码为已使用
    await db.smsVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    })

    // 查找或创建用户
    let user = await db.user.findUnique({
      where: { phone },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: `用户${phone.slice(-4)}`,
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "验证成功",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      }
    })

  } catch (error) {
    console.error("验证短信验证码失败:", error)
    return NextResponse.json(
      { error: "验证失败，请稍后重试" },
      { status: 500 }
    )
  }
}