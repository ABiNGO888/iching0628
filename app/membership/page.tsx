"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function MembershipPage() {
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
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">会员套餐</h1>
        <p className="text-muted-foreground">选择适合您的AI占卜套餐</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">基础套餐</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">¥19.9</span>
            </div>
            <CardDescription className="text-center">适合轻度用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">50</div>
              <div className="text-sm text-muted-foreground">AI占卜次数</div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">50次AI占卜</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">永久有效</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-amber-500 hover:bg-amber-600">立即购买</Button>
          </CardFooter>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center">豪华套餐</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">¥59.9</span>
            </div>
            <CardDescription className="text-center">重度用户首选</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">150</div>
              <div className="text-sm text-muted-foreground">AI占卜次数</div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">150次AI占卜</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">永久有效</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-purple-500 hover:bg-purple-600">立即购买</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}