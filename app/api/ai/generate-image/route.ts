import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // 移除登录检查，允许未登录用户使用

    const body = await req.json()
    const { prompt, style, useCustomApi, customApiKey } = body

    // 检查用户AI绘图额度（如果已登录）
    let user = null;
    let remainingCredits = 999; // 未登录用户默认有999次使用机会
    let subscriptionStatus = 'free';
    
    if (session?.user) {
      user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { aiCreditsRemaining: true, subscriptionStatus: true },
      })

      if (user) {
        remainingCredits = user.aiCreditsRemaining;
        subscriptionStatus = user.subscriptionStatus;
        
        // AI图片生成现在对所有用户免费开放，移除积分检查
       }
     }

    // 使用newapi生成图像
    // 优先使用环境变量中的API密钥，其次使用用户提供的自定义密钥，最后使用默认密钥
    const apiKey = process.env.NEWAPI_KEY || (useCustomApi && customApiKey ? customApiKey : "sk-your-newapi-key")

    // 构建newapi请求参数
    let enhancedPrompt = prompt;
    if (!enhancedPrompt.includes("卦") && !enhancedPrompt.includes("爻")) {
      const hexagramMatch = enhancedPrompt.match(/([^：]+)：([^。]+)/);
      const questionMatch = enhancedPrompt.match(/问题：([^。]+)/);
      if (hexagramMatch && hexagramMatch.length > 1) {
        const hexagramName = hexagramMatch[1];
        const hexagramDesc = hexagramMatch[2];
        const userQuestion = questionMatch && questionMatch.length > 1 ? questionMatch[1] : "";
        enhancedPrompt = `根据周易${hexagramName}卦的启示，为问题\"${userQuestion}\"作一幅富有东方神秘感的图像。\n\n卦辞：${hexagramDesc}\n画面应体现${hexagramName}卦的精神内涵，融入传统易经元素与现代审美，画面具有深度与启发性，能够直观展现卦象的精神与能量。`;
      }
    }
    console.log("Enhanced prompt:", enhancedPrompt);
    // 调用newapi
    const response = await fetch("https://api.newapi.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        style: style || "realistic",
        size: "1024x1024",
        n: 1,
      }),
    })
    const data = await response.json()

    // 如果API调用成功
    if (response.ok && data.output && data.output.images) {
      // AI图片生成现在对所有用户免费开放，不再扣除积分
      let finalRemainingCredits = "unlimited";

      return NextResponse.json({
        success: true,
        imageUrl: data.output.images[0].url,
        remainingCredits: finalRemainingCredits,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || "生成图像失败",
        error: data.code || "未知错误",
        details: data,
      })
    }
  } catch (error) {
    console.error("[AI_GENERATE_IMAGE]", error);
    // Return JSON response for internal server errors
    let errorMessage = "内部服务器错误";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { 
        success: false, 
        message: "生成图像时发生内部错误", 
        error: errorMessage 
      }, 
      { status: 500 }
    );
  }
}
