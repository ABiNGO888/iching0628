import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

// 导入自定义提供商
import WechatProvider from "./auth-providers/wechat-provider"
import AlipayProvider from "./auth-providers/alipay-provider"
import QQProvider from "./auth-providers/qq-provider"
import GoogleProvider from "./auth-providers/google-provider"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // 自定义登录页面
  },
  debug: process.env.NODE_ENV === "development",
  // 确保API路由能正确处理请求并返回JSON
  useSecureCookies: process.env.NODE_ENV === "production",
  // 明确设置URL，避免客户端获取错误
  basePath: "/api/auth",
  providers: [
    // 微信登录
    WechatProvider({
      clientId: process.env.WECHAT_CLIENT_ID || "",
      clientSecret: process.env.WECHAT_CLIENT_SECRET || "",
    }),
    // 支付宝登录
    AlipayProvider({
      clientId: process.env.ALIPAY_CLIENT_ID || "",
      clientSecret: process.env.ALIPAY_CLIENT_SECRET || "",
    }),
    // QQ登录
    QQProvider({
      clientId: process.env.QQ_CLIENT_ID || "",
      clientSecret: process.env.QQ_CLIENT_SECRET || "",
    }),
    // 谷歌登录
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // 短信验证码登录
    CredentialsProvider({
      id: "sms",
      name: "短信验证码",
      credentials: {
        phone: { label: "手机号", type: "text" },
        code: { label: "验证码", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null
        }

        // 验证短信验证码
        const verification = await db.smsVerification.findFirst({
          where: {
            phone: credentials.phone,
            code: credentials.code,
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
          return null
        }

        // 标记验证码为已使用
        await db.smsVerification.update({
          where: { id: verification.id },
          data: { verified: true },
        })

        // 查找或创建用户
        let user = await db.user.findUnique({
          where: { phone: credentials.phone },
        })

        if (!user) {
          user = await db.user.create({
            data: {
              phone: credentials.phone,
              name: `用户${credentials.phone.slice(-4)}`,
            },
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          role: user.role,
        }
      },
    }),
    // 邮箱密码登录（备选）
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.role = token.role
        session.user.subscriptionStatus = token.subscriptionStatus
        session.user.aiCreditsRemaining = token.aiCreditsRemaining
        session.user.phone = token.phone
        session.user.isDeveloper = token.isDeveloper
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // 处理第三方登录的用户信息更新
        const existingUser = await db.user.findUnique({
          where: { id: user.id },
        })

        if (existingUser) {
          // 更新第三方登录ID
          const updateData: any = {}
          
          if (user.wechatId && !existingUser.wechatId) {
            updateData.wechatId = user.wechatId
          }
          if (user.alipayId && !existingUser.alipayId) {
            updateData.alipayId = user.alipayId
          }
          if (user.qqId && !existingUser.qqId) {
            updateData.qqId = user.qqId
          }
          if (user.googleId && !existingUser.googleId) {
            updateData.googleId = user.googleId
          }

          if (Object.keys(updateData).length > 0) {
            await db.user.update({
              where: { id: user.id },
              data: updateData,
            })
          }
        }
      }

      let dbUser = await db.user.findFirst({
        where: {
          OR: [
            { email: token.email },
            { id: token.id },
          ],
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
          token.phone = user.phone
          token.isDeveloper = user.isDeveloper
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        picture: dbUser.image,
        role: dbUser.role,
        subscriptionStatus: dbUser.subscriptionStatus,
        aiCreditsRemaining: dbUser.aiCreditsRemaining,
        isDeveloper: dbUser.isDeveloper,
      }
    },
  },
}
