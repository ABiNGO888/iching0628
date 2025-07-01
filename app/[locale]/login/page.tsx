"use client"

import React, { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('LoginPage')
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)

  // SMS countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (smsCountdown > 0) {
      interval = setInterval(() => {
        setSmsCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [smsCountdown])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: t('errors.loginFailed'),
          description: t('errors.invalidCredentials'),
          variant: "destructive",
        })
      } else {
        router.push(`/${locale}`)
      }
    } catch (error) {
      toast({
        title: t('errors.loginFailed'),
        description: t('errors.mockLoginFailed'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSmsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('sms', {
        phone,
        code: smsCode,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: t('errors.loginFailed'),
          description: result.error,
          variant: "destructive",
        })
      } else {
        router.push(`/${locale}`)
      }
    } catch (error) {
      toast({
        title: t('errors.loginFailed'),
        description: t('errors.mockLoginFailed'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSms = async () => {
    if (!phone) {
      toast({
        title: t('errors.phoneRequired'),
        variant: "destructive",
      })
      return
    }

    // Simple phone validation
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      toast({
        title: t('errors.invalidPhone'),
        variant: "destructive",
      })
      return
    }

    setIsSendingSms(true)

    try {
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        toast({
          title: t('sms.sendSuccess'),
        })
        setSmsCountdown(60)
      } else {
        throw new Error('Failed to send SMS')
      }
    } catch (error) {
      toast({
        title: t('errors.smsSendFailed'),
        variant: "destructive",
      })
    } finally {
      setIsSendingSms(false)
    }
  }

  const handleOAuthLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: `/${locale}` })
    } catch (error) {
      toast({
        title: t('errors.loginFailed'),
        description: t('errors.developerLoginFailed'),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">{t('form.emailLogin')}</TabsTrigger>
              <TabsTrigger value="sms">{t('form.smsLogin')}</TabsTrigger>
              <TabsTrigger value="oauth">{t('form.oauthLogin')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {t('form.login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="sms" className="space-y-4">
              <form onSubmit={handleSmsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('form.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="13800138000"
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
                      placeholder="123456"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendSms}
                      disabled={isSendingSms || smsCountdown > 0}
                    >
                      {isSendingSms && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {smsCountdown > 0 ? `${smsCountdown}s` : t('form.sendSms')}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  {t('form.login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="oauth" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('wechat')}
                  className="w-full"
                >
                  <Icons.wechat className="mr-2 h-4 w-4" />
                  {t('oauth.wechat')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('alipay')}
                  className="w-full"
                >
                  <Icons.alipay className="mr-2 h-4 w-4" />
                  {t('oauth.alipay')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('qq')}
                  className="w-full"
                >
                  <Icons.qq className="mr-2 h-4 w-4" />
                  {t('oauth.qq')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full"
                >
                  <Icons.google className="mr-2 h-4 w-4" />
                  {t('oauth.google')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}