"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface SaveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveModal({ open, onOpenChange }: SaveModalProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // 获取当前显示的AI图像URL
      const imageElement = document.querySelector('.ai-generated-image') as HTMLImageElement;
      if (imageElement && imageElement.src) {
        // 创建文件名
        const now = new Date();
        const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
        const fileName = `iching-${dateStr}.jpg`;
        
        // 发送请求到服务器保存图像
        const response = await fetch('/api/ai/save-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: imageElement.src,
            fileName,
            folderPath: 'Aiphoto'
          }),
        });
        
        const result = await response.json();
        if (!result.success) {
          console.error('保存图像失败:', result.message);
        }
      }
      
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        onOpenChange(false);
        setSaved(false);
      }, 1500);
    } catch (error) {
      console.error('保存图像时出错:', error);
      setSaving(false);
      alert('保存图像失败，请稍后再试');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>保存卦象结果</DialogTitle>
        </DialogHeader>
        {!saved ? (
          <>
            <div className="py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <svg
                    className="h-16 w-16 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">卦象结果将保存到您的相册中</p>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-2 text-lg font-medium">保存成功</p>
              <p className="mt-1 text-sm text-muted-foreground">卦象结果已保存到您的相册</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
