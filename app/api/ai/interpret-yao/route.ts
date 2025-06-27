import { NextRequest, NextResponse } from "next/server"
import { Groq } from 'groq-sdk';

// 建议将 API 密钥存储在环境变量中
const groqApiKey = process.env.GROK_API_KEY;

if (!groqApiKey) {
  console.error('GROK_API_KEY is not set in environment variables.');
  // 在实际部署中，您可能希望在此处抛出错误或进行更严格的处理
}

const groq = new Groq({
  apiKey: groqApiKey,
  // dangerouslyAllowBrowser: true, // 注意：在客户端使用时需要此选项，但后端API通常不需要。如果仅在后端使用，可以移除。
});

export async function POST(request: NextRequest) {
  if (!groqApiKey) {
    return NextResponse.json({ error: 'GROK API 密钥未配置。请检查服务器环境变量。' }, { status: 500 });
  }

  try {
    const { yaoCi, divinationReason } = await request.json();

    if (!yaoCi || !divinationReason) {
      return NextResponse.json({ error: '缺少爻辞 (yaoCi) 或卜卦事由 (divinationReason)' }, { status: 400 });
    }

    // 构建发送给 GROK API 的提示
    const prompt = `请将以下爻辞和卜卦事由结合起来，进行白话文解读，并给出深入的分析和建议。

爻辞：${yaoCi}

卜卦事由：${divinationReason}

请以友善和启迪的口吻进行解读，帮助用户理解其中的智慧。`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768', // 您可以根据需要选择合适的模型
    });

    const interpretation = chatCompletion.choices[0]?.message?.content || '未能获取释义。';

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error('Error calling GROK API:', error);
    let errorMessage = '调用 AI 服务时发生内部错误。';
    if (error instanceof Error) {
        errorMessage = `调用 AI 服务时发生错误: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}