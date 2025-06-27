"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface RechargeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface RechargePackage {
  id: string
  name: string
  price: number
  credits: number
  description: string
  popular?: boolean
}

const rechargePackages: RechargePackage[] = [
  {
    id: "trial",
    name: "观象试用包",
    price: 3,
    credits: 10,
    description: "适合初次体验"
  },
  {
    id: "member",
    name: "推演会员包",
    price: 6.6,
    credits: 30,
    description: "性价比之选",
    popular: true
  },
  {
    id: "premium",
    name: "悟道会员包",
    price: 9.9,
    credits: 99,
    description: "超值大礼包"
  }
]

export function RechargeModal({ open, onOpenChange, onSuccess }: RechargeModalProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"

  const handlePurchase = async (packageData: RechargePackage) => {
    setIsProcessing(true)
    setSelectedPackage(packageData.id)

    try {
      // 开发者模式下直接模拟充值成功
      if (isTestMode) {
        const response = await fetch("/api/payment/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "ai_credits",
            amount: packageData.price,
            credits: packageData.credits
          }),
        })

        const data = await response.json()

        if (response.ok) {
          alert(`充值成功！获得 ${packageData.credits} 次AI占卜次数`)
          // 触发全局积分更新事件
          window.dispatchEvent(new Event('aiCreditsUpdated'))
          onSuccess?.()
          onOpenChange(false)
          // 不需要router.refresh()，因为已经通过事件更新了状态
        } else {
          alert("充值失败，请重试")
        }
      } else {
        // 生产模式下创建真实支付订单
        const response = await fetch("/api/ai/credits/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            packageId: packageData.id,
            amount: packageData.price,
            credits: packageData.credits
          }),
        })

        const data = await response.json()

        if (response.ok && data.paymentUrl) {
          router.push(data.paymentUrl)
        } else {
          alert("创建支付订单失败")
        }
      }
    } catch (error) {
      console.error("充值处理失败:", error)
      alert("充值失败，请重试")
    } finally {
      setIsProcessing(false)
      setSelectedPackage(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">充值AI次数</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {rechargePackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                pkg.popular ? 'border-amber-500 border-2' : 'border'
              }`}
              onClick={() => handlePurchase(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  推荐
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">¥{pkg.price}</div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground">AI占卜次数</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>{pkg.credits}次AI占卜</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>永久有效</span>
                  </li>
                  {pkg.popular && (
                    <li className="flex items-center justify-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium text-amber-600">性价比最高</span>
                    </li>
                  )}
                </ul>
                
                <Button 
                  className={`w-full mt-4 ${
                    pkg.popular ? 'bg-amber-500 hover:bg-amber-600' : ''
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing && selectedPackage === pkg.id ? "处理中..." : "立即充值"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>• 所有充值次数永久有效，不会过期</p>
          <p>• 开发者模式下可直接测试充值功能</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}