"use client"

import { cn } from "@/lib/utils"

interface HexagramDisplayProps {
  lines: number[]
  changingLines?: number[]
  className?: string
}

export function HexagramDisplay({ lines, changingLines = [], className }: HexagramDisplayProps) {
  if (!lines || lines.length === 0) {
    return null
  }

  // 确保changingLines是数组
  const safeChangingLines = changingLines || []

  return (
    <div className={cn("flex flex-col-reverse gap-2", className)}>
      {lines.map((line, index) => (
        <div
          key={index}
          className={cn("flex justify-center items-center", safeChangingLines.includes(index) && "relative")}
        >
          {line === 1 ? (
            // Yang line (solid)
            <div className="h-2 w-16 bg-black dark:bg-white" />
          ) : (
            // Yin line (broken)
            <div className="h-2 w-16 flex justify-between items-center">
              <div className="h-full w-[45%] bg-black dark:bg-white" />
              {/* Explicit gap */}
              <div className="h-full w-[45%] bg-black dark:bg-white" />
            </div>
          )}

          {safeChangingLines.includes(index) && <div className="absolute -right-6 text-sm text-red-500">×</div>}
        </div>
      ))}
    </div>
  )
}
