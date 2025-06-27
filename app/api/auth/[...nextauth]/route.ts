import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// 确保正确处理API路由请求，并返回JSON而不是HTML
const handler = NextAuth(authOptions)

// 明确指定导出的处理函数，确保它们能正确处理请求
export { handler as GET, handler as POST }
