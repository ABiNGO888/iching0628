import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      // Return JSON response for unauthorized access
      return NextResponse.json({ success: false, message: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, fileName, folderPath, metadata } = body;

    if (!imageUrl || !fileName) {
      return NextResponse.json({
        success: false,
        message: "缺少必要参数",
      });
    }

    // 确保Aiphoto文件夹存在
    const publicDir = path.join(process.cwd(), 'public');
    const saveDir = path.join(publicDir, folderPath || 'Aiphoto');
    
    try {
      await fsPromises.access(saveDir);
    } catch (error) {
      // 文件夹不存在，创建它
      await fsPromises.mkdir(saveDir, { recursive: true });
    }

    // 从远程URL下载图像
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载图像失败: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const filePath = path.join(saveDir, fileName);
    
    // 保存图像到文件系统
    await fsPromises.writeFile(filePath, Buffer.from(imageBuffer));
    
    // 如果有元数据，保存到同名的JSON文件
    if (metadata) {
      const metadataPath = path.join(saveDir, `${path.parse(fileName).name}.json`);
      await fsPromises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }

    return NextResponse.json({
      success: true,
      message: "图像已保存到Aiphoto文件夹",
      savedPath: `/${folderPath || 'Aiphoto'}/${fileName}`,
    });
  } catch (error) {
    console.error("[SAVE_IMAGE_ERROR]", error);
    return NextResponse.json({
      success: false,
      message: "保存图像失败",
      error: error instanceof Error ? error.message : "未知错误",
    }, { status: 500 });
  }
}