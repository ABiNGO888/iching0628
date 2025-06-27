import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 获取用户的卦象历史记录
    const [histories, total] = await Promise.all([
      db.divinationHistory.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.divinationHistory.count({
        where: {
          userId: session.user.id,
        },
      }),
    ])

    // 解析JSON字符串
    const formattedHistories = histories.map(history => ({
      ...history,
      hexagram: JSON.parse(history.hexagram),
      resultHexagram: history.resultHexagram ? JSON.parse(history.resultHexagram) : null,
      changingLines: history.changingLines ? JSON.parse(history.changingLines) : null,
    }))

    return NextResponse.json({
      histories: formattedHistories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching divination history:', error);
    return NextResponse.json({ 
      error: '获取历史记录失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}