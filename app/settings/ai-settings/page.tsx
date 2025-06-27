"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AIIntegrationModal } from "@/components/ai-integration-modal"
import { toast } from "@/components/ui/use-toast"

export default function AISettingsPage() {
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

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mr-2">
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
          返回
        </Button>
        <h1 className="text-3xl font-bold flex-1 pr-16">AI绘图设置</h1>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI绘图服务</CardTitle>
            <CardDescription>连接AI绘图服务以启用卦象AI画像功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">连接状态</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isConnected
                    ? `已连接到${provider === "baidu" ? "百度文心" : provider === "aliyun" ? "阿里通义" : "自定义"}AI服务`
                    : "未连接任何AI服务"}
                </p>
              </div>
              <div>
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      已连接
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                      断开连接
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowModal(true)}>连接AI服务</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI绘图选项</CardTitle>
            <CardDescription>自定义AI绘图功能的行为和外观</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-generate" className="font-medium">
                  自动生成
                </Label>
                <p className="text-sm text-muted-foreground mt-1">卦象结果出现后自动生成AI画像</p>
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
                  高质量图像
                </Label>
                <p className="text-sm text-muted-foreground mt-1">生成更高质量的图像（消耗更多API额度）</p>
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
                  包含卦象
                </Label>
                <p className="text-sm text-muted-foreground mt-1">在生成的图像中包含卦象符号</p>
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
                  包含卦辞
                </Label>
                <p className="text-sm text-muted-foreground mt-1">在生成的图像中包含卦辞文字</p>
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
                  title: "设置已保存",
                  description: "您的AI绘图设置已成功保存"
                })
              }}
            >
              保存设置
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AIIntegrationModal open={showModal} onOpenChange={setShowModal} onConnect={handleConnect} />
    </div>
  )
}
