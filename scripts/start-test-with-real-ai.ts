// 这个脚本用于启动测试模式，但使用真实的AI API
import { exec } from "child_process"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

// 加载测试环境变量
dotenv.config({ path: ".env.test" })

// 确保NEWAPI_KEY使用真实值
const realApiKey = process.env.REAL_NEWAPI_KEY || process.argv[2]

if (!realApiKey) {
  console.error("错误: 需要提供真实的NewAPI密钥")
  console.error("使用方法: npm run test-with-real-ai <API_KEY>")
  console.error("或者在.env.test文件中设置REAL_NEWAPI_KEY")
  process.exit(1)
}

// 创建临时环境变量文件
const tempEnvFile = path.join(__dirname, "../.env.test.temp")
let envContent = ""

// 读取现有的.env.test文件
try {
  envContent = fs.readFileSync(path.join(__dirname, "../.env.test"), "utf8")
} catch (error) {
  console.error("无法读取.env.test文件:", error)
  process.exit(1)
}

// 替换或添加NEWAPI_KEY
if (envContent.includes("NEWAPI_KEY=")) {
  envContent = envContent.replace(/NEWAPI_KEY=.*/, `NEWAPI_KEY=${realApiKey}`)
} else {
  envContent += `\nNEWAPI_KEY=${realApiKey}`
}

// 写入临时环境变量文件
fs.writeFileSync(tempEnvFile, envContent)

console.log("启动测试模式，使用真实AI API...")

// 启动应用
const child = exec("dotenv -e .env.test.temp -- npm run setup-test && dotenv -e .env.test.temp -- next dev")

child.stdout?.pipe(process.stdout)
child.stderr?.pipe(process.stderr)

// 清理函数
const cleanup = () => {
  if (fs.existsSync(tempEnvFile)) {
    fs.unlinkSync(tempEnvFile)
  }
}

// 监听进程退出事件，清理临时文件
process.on("exit", cleanup)
process.on("SIGINT", () => {
  cleanup()
  process.exit()
})
