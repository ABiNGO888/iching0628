"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface AdOverlayProps {
  duration?: number // 广告显示时间（秒）
  onComplete?: () => void // 广告结束回调
}

export function AdOverlay({ duration = 5, onComplete }: AdOverlayProps) {
  const { data: session } = useSession()
  const [countdown, setCountdown] = useState(duration)
  const [showAd, setShowAd] = useState(true)

  // 如果用户是会员，不显示广告
  useEffect(() => {
    if (session?.user?.subscriptionStatus === "premium") {
      setShowAd(false)
      if (onComplete) onComplete()
    }
  }, [session, onComplete])

  // 倒计时逻辑
  useEffect(() => {
    if (!showAd) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowAd(false)
          if (onComplete) onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showAd, onComplete])

  if (!showAd) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      <div className="bg-zinc-800 p-8 rounded-lg max-w-md w-full text-center">
        <h3 className="text-xl font-bold mb-4">广告</h3>
        <p className="mb-6">成为会员，享受无广告体验和更多功能</p>
        <div className="text-3xl font-bold mb-4">{countdown}</div>
        <p className="text-sm text-zinc-400">广告将在 {countdown} 秒后关闭</p>
      </div>
    </div>
  )
}
