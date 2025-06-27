"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  // 临时移除国际化，直接使用中文文本
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'title': '登录',
      'description': '选择登录方式',
      'form.emailLogin': '邮箱登录',
      'form.smsLogin': '短信登录',
      'form.oauthLogin': '第三方登录',
      'form.email': '邮箱',
      'form.password': '密码',
      'form.phone': '手机号',
      'form.smsCode': '验证码',
      'form.sendSms': '发送验证码',
      'form.login': '登录',
      'oauth.wechat': '微信',
      'oauth.alipay': '支付宝',
      'oauth.qq': 'QQ',
      'oauth.google': 'Google',
      'sms.sendSuccess': '验证码发送成功',
      'errors.phoneRequired': '请输入手机号',
      'errors.invalidPhone': '手机号格式不正确',
      'errors.smsSendFailed': '验证码发送失败',
      'errors.smsCodeRequired': '请输入验证码',
      'errors.invalidCredentials': '邮箱或密码错误',
      'errors.loginFailed': '登录失败',
      'errors.mockLoginFailed': '模拟登录失败',
      'errors.developerLoginFailed': '开发者登录失败'
    }
    return translations[key] || key
  }
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [error, setError] = useState("")
  const router = useRouter()
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"
  const isDeveloper = process.env.NODE_ENV === "development"

  // 处理第三方登录
  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      if (isTestMode) {
        // 测试模式下，模拟OAuth登录
        const response = await fetch("/api/auth/test-oauth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ provider }),
        })

        if (response.ok) {
          router.push("/")
          router.refresh()
        } else {
          setError(t('errors.mockLoginFailed'))
        }
      } else {
        // 正常模式下，使用NextAuth的signIn方法
        await signIn(provider, { callbackUrl: "/" })
      }
    } catch (error) {
      console.error("登录过程中出错:", error)
      setError(t('errors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 处理邮箱密码登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('errors.invalidCredentials'))
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("登录过程中出错:", error)
      setError(t('errors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 发送短信验证码
  const handleSendSms = async () => {
    if (!phone) {
      setError(t('errors.phoneRequired'))
      return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError(t('errors.invalidPhone'))
      return
    }

    setIsSendingSms(true)
    setError("")

    try {
      const response = await fetch("/api/auth/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t('sms.sendSuccess'),
          description: data.message,
        })
        
        // 开发环境下显示验证码
        if (data.code && process.env.NODE_ENV === "development") {
          toast({
            title: "开发环境验证码",
            description: `验证码: ${data.code}`,
            duration: 10000,
          })
        }

        // 开始倒计时
        setSmsCountdown(60)
        const timer = setInterval(() => {
          setSmsCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || t('errors.smsSendFailed'))
      }
    } catch (error) {
      console.error("发送短信验证码失败:", error)
      setError(t('errors.smsSendFailed'))
    } finally {
      setIsSendingSms(false)
    }
  }

  // 处理短信登录
  const handleSmsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("sms", {
        phone,
        code: smsCode,
        redirect: false,
      })

      if (result?.error) {
        setError(t('errors.invalidSmsCode'))
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("短信登录过程中出错:", error)
      setError(t('errors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 开发者快速登录
  const handleDeveloperLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // 创建或获取开发者用户
      let user = await fetch("/api/auth/developer-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (user.ok) {
        const userData = await user.json()
        
        // 使用邮箱登录开发者账户
        const result = await signIn("credentials", {
          email: userData.email,
          password: "developer123",
          redirect: false,
        })

        if (result?.error) {
          setError(t('errors.developerLoginFailed'))
        } else {
          toast({
            title: "开发者登录成功",
            description: "已使用开发者账户登录",
          })
          router.push("/")
          router.refresh()
        }
      } else {
        setError(t('errors.developerLoginFailed'))
      }
    } catch (error) {
      console.error("开发者登录失败:", error)
      setError(t('errors.developerLoginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">{t('form.emailLogin')}</TabsTrigger>
              <TabsTrigger value="sms">{t('form.smsLogin')}</TabsTrigger>
              <TabsTrigger value="oauth">{t('form.oauthLogin')}</TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("wechat")}
                  disabled={isLoading}
                >
                  <Icons.wechat className="mr-2 h-4 w-4" />
                  {t('oauth.wechat')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("alipay")}
                  disabled={isLoading}
                >
                  <Icons.alipay className="mr-2 h-4 w-4" />
                  {t('oauth.alipay')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("qq")}
                  disabled={isLoading}
                >
                  <Icons.qq className="mr-2 h-4 w-4" />
                  {t('oauth.qq')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading}
                >
                  <Icons.google className="mr-2 h-4 w-4" />
                  {t('oauth.google')}
                </Button>
              </div>

              {isDeveloper && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => handleDeveloperLogin()}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    🚀 开发者快速登录
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="py-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('form.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {t('form.loginButton')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="sms" className="py-4">
              <form onSubmit={handleSmsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('form.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smsCode">{t('form.smsCode')}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="smsCode"
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="请输入验证码"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendSms}
                      disabled={isSendingSms || smsCountdown > 0}
                      className="whitespace-nowrap"
                    >
                      {isSendingSms && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {smsCountdown > 0 ? `${smsCountdown}s` : t('form.sendSms')}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {t('form.smsLoginButton')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

          {isTestMode && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-700">{t('testMode.enabled')}</p>
              <p className="text-xs text-yellow-700">{t('testMode.credentials')}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center">{t('footer.noAccount')}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
