"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AIIntegrationModal } from "@/components/ai-integration-modal"
import { toast } from "@/components/ui/use-toast"

export default function AISettingsPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const t = useTranslations('aiSettings')
  
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [settings, setSettings] = useState({
    autoGenerate: true,
    highQuality: false,
    includeHexagram: true,
    includeText: true,
  })

  // 加载保存的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem("aiSettings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)
      } catch (error) {
        console.error("Failed to parse saved AI settings", error)
      }
    }
  }, [])

  const handleConnect = (provider: string, apiKey: string) => {
    setIsConnected(true)
    setProvider(provider)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setProvider("")
  }

  const handleBack = () => {
    router.back()
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "baidu":
        return t('providers.baidu')
      case "aliyun":
        return t('providers.aliyun')
      default:
        return t('providers.custom')
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t('back')}
        </Button>
        <h1 className="text-3xl font-bold flex-1 pr-16">{t('title')}</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('service.title')}</CardTitle>
            <CardDescription>{t('service.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('service.connectionStatus')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isConnected
                    ? t('service.connected', { provider: getProviderName(provider) })
                    : t('service.notConnected')}
                </p>
              </div>
              <div>
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t('service.connectedBadge')}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                      {t('service.disconnect')}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowModal(true)}>{t('service.connect')}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('options.title')}</CardTitle>
            <CardDescription>{t('options.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-generate" className="font-medium">
                  {t('options.autoGenerate.title')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{t('options.autoGenerate.description')}</p>
              </div>
              <Switch
                id="auto-generate"
                checked={settings.autoGenerate}
                onCheckedChange={(checked) => setSettings({ ...settings, autoGenerate: checked })}
                disabled={!isConnected}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-quality" className="font-medium">
                  {t('options.highQuality.title')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{t('options.highQuality.description')}</p>
              </div>
              <Switch
                id="high-quality"
                checked={settings.highQuality}
                onCheckedChange={(checked) => setSettings({ ...settings, highQuality: checked })}
                disabled={!isConnected}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-hexagram" className="font-medium">
                  {t('options.includeHexagram.title')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{t('options.includeHexagram.description')}</p>
              </div>
              <Switch
                id="include-hexagram"
                checked={settings.includeHexagram}
                onCheckedChange={(checked) => setSettings({ ...settings, includeHexagram: checked })}
                disabled={!isConnected}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-text" className="font-medium">
                  {t('options.includeText.title')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{t('options.includeText.description')}</p>
              </div>
              <Switch
                id="include-text"
                checked={settings.includeText}
                onCheckedChange={(checked) => setSettings({ ...settings, includeText: checked })}
                disabled={!isConnected}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              disabled={!isConnected} 
              className="w-full"
              onClick={() => {
                localStorage.setItem("aiSettings", JSON.stringify(settings))
                toast({
                  title: t('saveSuccess.title'),
                  description: t('saveSuccess.description')
                })
              }}
            >
              {t('saveSettings')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AIIntegrationModal open={showModal} onOpenChange={setShowModal} onConnect={handleConnect} />
    </div>
  )
}