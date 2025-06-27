"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function PaymentProcessPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!orderId) {
      setError("订单ID不存在")
      setIsProcessing(false)
      return
    }

    // 模拟支付处理
    const timer = setTimeout(() => {
      verifyPayment(orderId)
    }, 3000)

    return () => clearTimeout(timer)
  }, [orderId])

  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.message || "支付验证失败")
      }
    } catch (error) {
      setError("支付处理过程中出错")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>支付处理</CardTitle>
          <CardDescription>
            {isProcessing ? "正在处理您的支付..." : isSuccess ? "支付成功" : "支付失败"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isProcessing ? (
            <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
          ) : isSuccess ? (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-center text-lg font-medium">支付已完成</p>
              <p className="mt-2 text-center text-sm text-muted-foreground">您的订单已成功处理，感谢您的购买！</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mt-4 text-center text-lg font-medium">支付失败</p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {error || "处理您的支付时出现问题，请重试。"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/")} disabled={isProcessing}>
            {isSuccess ? "返回首页" : "重试"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
