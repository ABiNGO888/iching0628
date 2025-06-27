"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface AIIntegrationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (provider: string, apiKey: string, options?: any) => void
}

export function AIIntegrationSettings({ open, onOpenChange, onConnect }: AIIntegrationSettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState("midjourney")
  const [apiKey, setApiKey] = useState("")
  const [apiEndpoint, setApiEndpoint] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  const handleConnect = () => {
    setError("")

    // 验证输入
    if (!apiKey.trim()) {
      setError("请输入API密钥")
      return
    }

    if (selectedProvider === "custom" && !apiEndpoint.trim()) {
      setError("请输入API端点")
      return
    }

    setIsConnecting(true)

    // 模拟API连接
    setTimeout(() => {
      // 在实际应用中，这里应该进行API验证
      onConnect(selectedProvider, apiKey, { endpoint: apiEndpoint })
      setIsConnecting(false)
      onOpenChange(false)

      // 重置表单
      setApiKey("")
      setApiEndpoint("")
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>连接AI绘图服务</DialogTitle>
          <DialogDescription>选择AI绘图服务提供商并输入您的API密钥</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="midjourney" onValueChange={setSelectedProvider} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="midjourney">即梦</TabsTrigger>
            <TabsTrigger value="stable">Stable Diffusion</TabsTrigger>
            <TabsTrigger value="custom">自定义</TabsTrigger>
          </TabsList>

          <TabsContent value="midjourney" className="space-y-4 mt-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>即梦API提供每日免费积分，可用于生成少量图像。</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="midjourney-api-key">API Key</Label>
              <Input
                id="midjourney-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的即梦API Key"
              />
            </div>
          </TabsContent>

          <TabsContent value="stable" className="space-y-4 mt-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>Stable Diffusion API提供免费试用额度，适合测试使用。</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="stable-api-key">API Key</Label>
              <Input
                id="stable-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的Stable Diffusion API Key"
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-api-url">API 端点</Label>
              <Input
                id="custom-api-url"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1/images/generations"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-api-key">API Key</Label>
              <Input
                id="custom-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的API Key"
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "连接中..." : "连接"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
