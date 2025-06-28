"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface CoinDivinationAnimationProps {
  onComplete: (lines: number[], changingLines: number[]) => void
}

export function CoinDivinationAnimation({ onComplete }: CoinDivinationAnimationProps) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState<number[]>([])
  const [changingLines, setChangingLines] = useState<number[]>([])
  const [currentCoins, setCurrentCoins] = useState<number[]>([])
  const [showCoins, setShowCoins] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [lineType, setLineType] = useState("")
  const [isChanging, setIsChanging] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  const coinRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const containerRef = useRef<HTMLDivElement>(null)

  // 初始化动画
  useEffect(() => {
    // 开始动画序列
    const timer = setTimeout(() => {
      generateLine(0)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 生成一爻
  const generateLine = (lineIndex: number) => {
    if (lineIndex >= 6) {
      // 所有爻都已生成，完成占卦
      setTimeout(() => {
        onComplete(lines, changingLines)
      }, 1500)
      return
    }

    setStep(lineIndex + 1)
    setProgress(0)
    setShowCoins(false)
    setShowResult(false)
    setCurrentCoins([])

    // 开始进度条动画
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          tossCoins(lineIndex)
          return 100
        }
        return prev + 2
      })
    }, 30)
  }

  // 抛掷铜钱
  const tossCoins = (lineIndex: number) => {
    setShowCoins(true)

    // 生成三枚铜钱的结果 (2=反面/花面, 3=正面/字面)
    setTimeout(() => {
      const coins = [Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2]
      setCurrentCoins(coins)

      // 钱币动画停止后，再进行爻的判定
      setTimeout(() => {
        // 计算爻的类型
      const sum = coins.reduce((a, b) => a + b, 0)
      let lineValue: number
      let changing = false
      let type = ""

      if (sum === 6) {
        // 3个花面 = 老阳 (变爻)
        lineValue = 1
        changing = true
        type = "老阳"
      } else if (sum === 7) {
        // 2个字面1个花面 = 少阴 (两个字一个花)
        lineValue = 0
        type = "少阴"
      } else if (sum === 8) {
        // 2个花面1个字面 = 少阳 (两个花一个字)
        lineValue = 1
        type = "少阳"
      } else {
        // 3个字面 = 老阴 (变爻)
        lineValue = 0
        changing = true
        type = "老阴"
      }

      setLineType(type)
      setIsChanging(changing)

      // 更新卦象
      const newLines = [...lines, lineValue]
      setLines(newLines)

      if (changing) {
        setChangingLines([...changingLines, lineIndex])
      }

      // 显示结果
      setTimeout(() => {
        setShowResult(true)

          // 准备下一爻
          setTimeout(() => {
            if (lineIndex === 5) {
              setAnimationComplete(true)
            } else {
              generateLine(lineIndex + 1)
            }
          }, 750)
        }, 500)
      }, 300) // 钱币动画停止后延迟300ms进行爻的判定
    }, 750) // 钱币摇晃动画时间减少一半
  }

  // 获取爻类型的符号
  const getLineSymbol = (type: string) => {
    switch (type) {
      case "老阳":
        return "X"
      case "老阴":
        return "O"
      case "少阳":
        return "•"
      case "少阴":
        return "••"
      default:
        return ""
    }
  }

  // 获取爻类型的描述
  const getLineDescription = (type: string) => {
    switch (type) {
      case "老阳":
        return "三个花面，阳爻变阴"
      case "老阴":
        return "三个字面，阴爻变阳"
      case "少阳":
        return "两个花面一个字面，稳定阳爻"
      case "少阴":
        return "两个字面一个花面，稳定阴爻"
      default:
        return ""
    }
  }

  return (
    <div className="w-full flex flex-col items-center" ref={containerRef}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">正在摇卦</h3>
        <p className="text-muted-foreground">第 {step}/6 爻</p>
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-md mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {/* 铜钱动画区域 */}
      <div className="relative h-40 w-full flex justify-center items-center mb-6">
        <AnimatePresence>
          {showCoins && (
            <div className="flex space-x-8">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  ref={(el) => (coinRefs.current[index] = el)}
                  initial={{ y: -100, opacity: 0, rotateY: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotateY: showResult ? (currentCoins[index] === 3 ? 180 : 0) : (currentCoins[index] ? [0, 180, 360, 540, 720, 900, 1080] : 0),
                  }}
                  transition={{
                    y: { duration: 0.5, delay: index * 0.1 },
                    rotateY: showResult ? { duration: 0 } : { duration: 0.75, delay: 0.5 + index * 0.2 },
                  }}
                  className="relative w-20 h-20"
                >
                  <div className="w-full h-full">
                    <div
                      className={`absolute inset-0 rounded-full ${
                        !currentCoins[index]
                          ? "bg-amber-400"
                          : currentCoins[index] === 3
                            ? "bg-amber-600"
                            : "bg-amber-500"
                      } border-4 border-amber-700 flex items-center justify-center shadow-lg`}
                    >
                      {currentCoins[index] === 3 ? (
                        // 正面(字面) - 带方孔的古钱币
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 bg-amber-900 border border-amber-800"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-1 bg-amber-900"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1 h-10 bg-amber-900"></div>
                          </div>
                        </div>
                      ) : currentCoins[index] === 2 ? (
                        // 反面(花面) - 带纹理的古钱币背面
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 bg-amber-900 border border-amber-800"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-50">
                            <div className="w-8 h-1 bg-amber-900 rotate-45"></div>
                            <div className="w-8 h-1 bg-amber-900 -rotate-45"></div>
                          </div>
                        </div>
                      ) : (
                        // 未定状态
                        <div className="animate-pulse">?</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 结果显示 */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className="mb-2">
              <span className="font-medium">结果：</span>
              {lineType}
              <span className="ml-2 text-amber-600 font-medium">{getLineSymbol(lineType)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{getLineDescription(lineType)}</p>

            {isChanging && (
              <div className="mt-2 inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">变爻</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 完成动画 */}
      <AnimatePresence>
        {animationComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
            <div className="text-lg font-medium text-green-600 mb-2">占卦完成</div>
            <p className="text-sm text-muted-foreground">正在生成卦象解读...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
