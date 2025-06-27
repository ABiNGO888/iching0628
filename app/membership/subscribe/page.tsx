"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      // 根据选择的计划确定金额
      const amount = selectedPlan === "monthly" ? 5.9 : selectedPlan === "quarterly" ? 15.9 : 59.9

      // 根据是否为测试模式选择不同的API端点
      const endpoint = isTestMode ? "/api/payment/test" : "/api/payment/create"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "subscription",
          amount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (isTestMode) {
          // 测试模式下直接显示成功消息并刷新页面
          alert("测试订阅成功！您现在是VIP会员")
          router.push("/")
          router.refresh()
        } else if (data.paymentUrl) {
          router.push(data.paymentUrl)
        }
      } else {
        console.error("创建支付订单失败")
      }
    } catch (error) {
      console.error("处理订阅时出错:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
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
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">选择会员方案</h1>
          <p className="text-muted-foreground">升级为VIP会员，享受更多功能和服务</p>

          {isTestMode && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md inline-block">
              <p className="text-sm text-yellow-700">测试模式已启用，点击订阅按钮将立即成为会员</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="monthly" value={selectedPlan} onValueChange={setSelectedPlan} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">月付</TabsTrigger>
            <TabsTrigger value="quarterly">季付</TabsTrigger>
            <TabsTrigger value="yearly">年付</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            <Card className="border-2 border-amber-500 relative mt-6">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                推荐
              </div>
              <CardHeader>
                <CardTitle className="text-center">月度VIP会员</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">¥5.9</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
                <CardDescription className="text-center">完整功能无限制使用</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">无广告体验</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">无限次使用起卦功能</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">详细卦象解读与分析</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">保存并查看所有历史记录</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600"
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? "处理中..." : "立即订阅"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 季付和年付的TabsContent内容与月付类似，这里省略 */}
        </Tabs>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">常见问题</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div>
              <h3 className="font-medium">如何成为VIP会员？</h3>
              <p className="text-sm text-muted-foreground">选择您喜欢的支付方式完成支付即可成为VIP会员。</p>
            </div>
            <div>
              <h3 className="font-medium">会员可以退款吗？</h3>
              <p className="text-sm text-muted-foreground">会员服务开通后不支持退款，请谨慎选择。</p>
            </div>
            <div>
              <h3 className="font-medium">会员到期后会怎样？</h3>
              <p className="text-sm text-muted-foreground">
                会员到期后，您的账户将自动转为免费用户，历史记录将保留但无法查看全部。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
