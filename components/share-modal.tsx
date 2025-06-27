"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { WechatIcon, LineIcon } from "@/components/social-icons"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const [shared, setShared] = useState(false)

  const handleShare = (platform: string) => {
    // Simulate sharing
    setTimeout(() => {
      setShared(true)
      setTimeout(() => {
        onOpenChange(false)
        setShared(false)
      }, 1500)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享卦象结果</DialogTitle>
        </DialogHeader>
        {!shared ? (
          <div className="grid grid-cols-4 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare("wechat")}
            >
              <WechatIcon className="h-8 w-8 mb-1" />
              <span className="text-xs">微信</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare("line")}
            >
              <LineIcon className="h-8 w-8 mb-1" />
              <span className="text-xs">LINE</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare("weibo")}
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8 mb-1" fill="currentColor">
                <path d="M10.098 20c-3.297 0-6-1.932-6-4.5 0-2.568 2.703-4.5 6-4.5s6 1.932 6 4.5c0 2.568-2.703 4.5-6 4.5zm0-7.5c-2.493 0-4.5 1.35-4.5 3s2.007 3 4.5 3 4.5-1.35 4.5-3-2.007-3-4.5-3z" />
                <path d="M12.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20.794 11.955c-.326-.968-1.365-1.47-2.313-1.12-.574.21-.837.857-.586 1.45.253.59.932.9 1.506.69.252-.092.466-.285.614-.551.147-.266.176-.57.08-.856-.19-.57-.789-.866-1.33-.66-.18.07-.264.277-.186.463.077.184.282.276.462.207.18-.066.376.033.438.22.062.188-.033.392-.214.458-.361.132-.75-.022-.97-.38-.22-.36-.107-.83.254-1.052.574-.345 1.31-.16 1.64.414.332.574.136 1.32-.438 1.668-.287.174-.61.242-.933.2-.323-.04-.624-.195-.85-.437-.452-.485-.528-1.227-.18-1.798.174-.286.416-.51.702-.652.286-.142.604-.196.915-.158.624.076 1.165.463 1.456 1.042.29.58.29 1.258 0 1.838-.33.66-.99 1.066-1.716 1.066-.363 0-.723-.098-1.04-.287-.634-.38-.99-1.08-.93-1.82.03-.37.174-.72.414-1.008.24-.287.562-.497.93-.604.73-.21 1.516.076 1.92.7.407.624.407 1.444 0 2.068-.407.624-1.19.91-1.92.7-.367-.106-.69-.317-.93-.604-.24-.287-.383-.637-.414-1.008-.03-.37.074-.74.3-1.042.225-.303.55-.52.93-.614.38-.095.776-.048 1.127.132.35.18.624.47.773.83.148.36.148.76 0 1.12-.15.36-.423.65-.773.83-.35.18-.746.227-1.127.132-.38-.095-.704-.31-.93-.614-.225-.303-.33-.672-.3-1.042.03-.37.174-.72.414-1.008.24-.287.562-.497.93-.604.73-.21 1.516.076 1.92.7.407.624.407 1.444 0 2.068-.407.624-1.19.91-1.92.7-.367-.106-.69-.317-.93-.604-.24-.287-.383-.637-.414-1.008-.03-.37.074-.74.3-1.042.225-.303.55-.52.93-.614.38-.095.776-.048 1.127.132.35.18.624.47.773.83.148.36.148.76 0 1.12-.15.36-.423.65-.773.83-.35.18-.746.227-1.127.132-.38-.095-.704-.31-.93-.614-.225-.303-.33-.672-.3-1.042.03-.37.174-.72.414-1.008.24-.287.562-.497.93-.604.73-.21 1.516.076 1.92.7.407.624.407 1.444 0 2.068-.407.624-1.19.91-1.92.7z" />
              </svg>
              <span className="text-xs">微博</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-20"
              onClick={() => handleShare("qq")}
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8 mb-1" fill="currentColor">
                <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29 0 2.239.425 6.287.687 6.287 0 0-.688-1.768-1.182-1.768-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" />
              </svg>
              <span className="text-xs">QQ</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-2 text-lg font-medium">分享成功</p>
            </div>
          </div>
        )}
        <DialogFooter className="sm:justify-center">
          {!shared && (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
