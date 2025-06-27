import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 未登录用户可以调用API，但不保存记录
    if (!session?.user) {
      return NextResponse.json({ 
        success: true, 
        message: '未登录用户，记录未保存',
        saved: false 
      });
    }

    const body = await request.json();
    const { type, hexagram, resultHexagram, changingLines, question, hexagramName, interpretation } = body;

    if (!type || !hexagram) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 检查是否存在相同的卦象记录（最近5分钟内）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecord = await db.divinationHistory.findFirst({
      where: {
        userId: session.user.id,
        type,
        hexagram: JSON.stringify(hexagram),
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let divinationHistory;
    
    if (existingRecord) {
      // 更新现有记录
      divinationHistory = await db.divinationHistory.update({
        where: {
          id: existingRecord.id
        },
        data: {
          resultHexagram: resultHexagram ? JSON.stringify(resultHexagram) : null,
          changingLines: changingLines ? JSON.stringify(changingLines) : null,
          question: question || null,
          hexagramName,
          interpretation
        },
      });
    } else {
      // 创建新记录
      divinationHistory = await db.divinationHistory.create({
        data: {
          userId: session.user.id,
          type,
          hexagram: JSON.stringify(hexagram),
          resultHexagram: resultHexagram ? JSON.stringify(resultHexagram) : null,
          changingLines: changingLines ? JSON.stringify(changingLines) : null,
          question: question || null,
          hexagramName,
          interpretation
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      id: divinationHistory.id,
      message: '卦象已保存到历史记录'
    });

  } catch (error) {
    console.error('Error saving divination history:', error);
    return NextResponse.json({ 
      error: '保存失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}