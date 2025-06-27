import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { HttpsProxyAgent } from 'https-proxy-agent';

// 根据需要配置代理，如果你的环境可以直接访问阿里百炼API，则不需要代理
const HttpsAgent = process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : undefined;

// 阿里百炼API URL
const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 移除登录检查，允许未登录用户使用

    const body = await request.json();
    const { prompt, apiKey } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // AI解卦功能现在对所有用户免费开放
    let user = null;
    let subscriptionStatus = 'free';
    
    if (session?.user) {
      user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true },
      })

      if (user) {
        subscriptionStatus = user.subscriptionStatus;
      }
    }

    // 使用环境变量中的API Key，如果没有则使用传入的apiKey
    const dashscopeApiKey = process.env.ALI_API_KEY || apiKey;
    if (!dashscopeApiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    // 阿里百炼 通义千问 API (qwen-turbo)
    // 文档: https://help.aliyun.com/document_detail/2587215.html

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dashscopeApiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // 或者其他你需要的模型，如 qwen-plus, qwen-max 等
        input: {
          prompt: prompt,
        },
        parameters: {
          // 根据需要调整参数，例如 temperature, top_p, max_tokens 等
          // result_format: 'message', // 如果需要更详细的输出结构
        },
      }),
      agent: HttpsAgent, // 如果配置了代理则使用
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dashscope API error:', response.status, errorText);
      return NextResponse.json({ error: `Dashscope API Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    if (data.output && data.output.text) {
      // AI解卦功能现在对所有用户免费开放，不再扣除积分
      let finalRemainingCredits = 'unlimited';
      
      if (session?.user && user) {
        subscriptionStatus = user.subscriptionStatus;
      }

      return NextResponse.json({ 
        interpretation: data.output.text,
        remainingCredits: finalRemainingCredits,
        subscriptionStatus: subscriptionStatus,
      });
    } else {
      console.error('Dashscope API response format error:', data);
      return NextResponse.json({ error: 'Failed to get interpretation from Dashscope API due to unexpected response format.', details: data }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in /api/ai/interpret:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}