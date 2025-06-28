// Web应用功能测试脚本
import { spawn } from "child_process"
import fetch from "node-fetch"

// 等待函数
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 测试服务器是否启动
async function testServerHealth(url: string, maxRetries = 10): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return true
      }
    } catch (error) {
      // 服务器还未启动，继续等待
    }
    await wait(2000) // 等待2秒
  }
  return false
}

// 测试API端点
async function testApiEndpoints() {
  const baseUrl = "http://localhost:3000"
  
  console.log("\n📡 测试API端点...")
  
  try {
    // 测试主页
    console.log("1. 测试主页...")
    const homeResponse = await fetch(`${baseUrl}/zh-CN`)
    if (homeResponse.ok) {
      console.log("✓ 主页访问成功")
    } else {
      console.log(`✗ 主页访问失败: ${homeResponse.status}`)
    }
    
    // 测试抛硬币页面
    console.log("2. 测试抛硬币页面...")
    const coinResponse = await fetch(`${baseUrl}/zh-CN/divination/coin`)
    if (coinResponse.ok) {
      console.log("✓ 抛硬币页面访问成功")
    } else {
      console.log(`✗ 抛硬币页面访问失败: ${coinResponse.status}`)
    }
    
    // 测试数字卜卦页面
    console.log("3. 测试数字卜卦页面...")
    const numberResponse = await fetch(`${baseUrl}/zh-CN/divination/number`)
    if (numberResponse.ok) {
      console.log("✓ 数字卜卦页面访问成功")
    } else {
      console.log(`✗ 数字卜卦页面访问失败: ${numberResponse.status}`)
    }
    
    // 测试API健康检查（如果存在）
    console.log("4. 测试API健康检查...")
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`)
      if (healthResponse.ok) {
        console.log("✓ API健康检查成功")
      } else {
        console.log(`✗ API健康检查失败: ${healthResponse.status}`)
      }
    } catch (error) {
      console.log("ℹ️ API健康检查端点不存在（这是正常的）")
    }
    
  } catch (error) {
    console.error("❌ API测试过程中出现错误:", error)
  }
}

async function runWebTests() {
  console.log("🚀 开始Web应用功能测试...")
  
  // 启动开发服务器
  console.log("\n🔧 启动开发服务器...")
  const isWindows = process.platform === "win32"
  const server = spawn(isWindows ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "test" },
    stdio: "pipe",
    shell: isWindows
  })
  
  let serverOutput = ""
  server.stdout?.on("data", (data) => {
    serverOutput += data.toString()
  })
  
  server.stderr?.on("data", (data) => {
    serverOutput += data.toString()
  })
  
  // 等待服务器启动
  console.log("⏳ 等待服务器启动...")
  const serverReady = await testServerHealth("http://localhost:3000")
  
  if (!serverReady) {
    console.log("❌ 服务器启动失败或超时")
    console.log("服务器输出:", serverOutput)
    server.kill()
    return
  }
  
  console.log("✅ 服务器启动成功")
  
  try {
    // 运行API测试
    await testApiEndpoints()
    
    console.log("\n🎉 Web应用功能测试完成！")
    
  } catch (error) {
    console.error("❌ Web测试过程中出现错误:", error)
  } finally {
    // 关闭服务器
    console.log("\n🔄 关闭开发服务器...")
    server.kill()
    await wait(2000) // 等待服务器完全关闭
    console.log("✅ 服务器已关闭")
  }
}

// 运行测试
runWebTests().catch(console.error)