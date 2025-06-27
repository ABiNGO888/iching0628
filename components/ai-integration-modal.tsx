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

interface AIIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (provider: string, apiKey: string) => void
}

export function AIIntegrationModal({ open, onOpenChange, onConnect }: AIIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] = useState("baidu")
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)

    // 保存API密钥到localStorage，以便在组件之间共享
    try {
      // 如果是阿里通义，保存提供的API密钥
      if (selectedProvider === "aliyun") {
        localStorage.setItem("aliyunApiKey", apiKey)
        // 如果有密钥，也保存
        if (secretKey) {
          localStorage.setItem("aliyunSecretKey", secretKey)
        }
      }
      
      // 通知父组件连接成功
      onConnect(selectedProvider, apiKey)
      setIsConnecting(false)
      onOpenChange(false)

      // 重置表单
      setApiKey("")
      setSecretKey("")
    } catch (error) {
      console.error("保存API密钥失败", error)
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>连接AI绘图服务</DialogTitle>
          <DialogDescription>选择AI绘图服务提供商并输入您的API密钥</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="baidu" onValueChange={setSelectedProvider} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="baidu">百度文心</TabsTrigger>
            <TabsTrigger value="aliyun">阿里通义</TabsTrigger>
            <TabsTrigger value="custom">自定义</TabsTrigger>
          </TabsList>

          <TabsContent value="baidu" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="baidu-api-key">API Key</Label>
              <Input
                id="baidu-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的百度文心API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baidu-secret-key">Secret Key</Label>
              <Input
                id="baidu-secret-key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type="password"
                placeholder="输入您的百度文心Secret Key"
              />
            </div>
          </TabsContent>

          <TabsContent value="aliyun" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="aliyun-api-key">API Key</Label>
              <Input
                id="aliyun-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的阿里通义API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aliyun-secret-key">Secret Key</Label>
              <Input
                id="aliyun-secret-key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type="password"
                placeholder="输入您的阿里通义Secret Key"
              />
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="custom-api-url">API 端点</Label>
              <Input id="custom-api-url" placeholder="https://api.example.com/v1/images/generations" />
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

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConnect} disabled={!apiKey || isConnecting}>
            {isConnecting ? "连接中..." : "连接"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
