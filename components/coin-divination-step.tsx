"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HexagramDisplay } from "@/components/hexagram-display"
import Image from "next/image"

interface CoinDivinationStepProps {
  onComplete: (lines: number[], changingLines: number[]) => void
}

export function CoinDivinationStep({ onComplete }: CoinDivinationStepProps) {
  // 完全重写逻辑，使用一个组件管理整个过程
  const [step, setStep] = useState(0) // 0表示未开始，1-6表示正在生成第几爻
  const [lines, setLines] = useState<number[]>([])
  const [changingLines, setChangingLines] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentCoins, setCurrentCoins] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)

  // 获取当前爻的名称（初爻、二爻、三爻、四爻、五爻、上爻）
  const getLineNameByIndex = (index: number): string => {
    const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]
    return lineNames[index] || `第${index + 1}爻`
  }

  // 开始摇卦
  const startToss = () => {
    if (isAnimating) return

    // 如果已经完成了6爻，则重置
    if (step >= 6) {
      setStep(0)
      setLines([])
      setChangingLines([])
      setCurrentCoins([])
      setShowResult(false)
      return
    }

    // 开始动画
    setIsAnimating(true)
    setShowResult(false)
    setCurrentCoins([])

    // 模拟铜钱动画
    setTimeout(() => {
      // 生成三枚铜钱的结果 (2=反面/花面=阳, 3=正面/字面=阴)
      const coinResults = [Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2]
      setCurrentCoins(coinResults)

      // 计算爻的类型
      const sum = coinResults.reduce((a, b) => a + b, 0)
      let lineValue: number
      let isChanging = false

      if (sum === 6) {
        // 3个花面 = 老阳 (变爻)
        lineValue = 1
        isChanging = true
      } else if (sum === 7) {
        // 2个字面1个花面 = 少阴 (两个字一个花)
        lineValue = 0
      } else if (sum === 8) {
        // 2个花面1个字面 = 少阳 (两个花一个字)
        lineValue = 1
      } else {
        // 3个字面 = 老阴 (变爻)
        lineValue = 0
        isChanging = true
      }

      // 更新卦象
      const newLines = [...lines, lineValue]
      setLines(newLines)

      // 更新变爻
      if (isChanging) {
        // 注意：这里的step是从0开始的，所以当前爻的索引就是step
        setChangingLines([...changingLines, step])
      }

      // 显示结果
      setShowResult(true)
      setIsAnimating(false)

      // 更新步骤
      const nextStep = step + 1
      setStep(nextStep)

      // 如果已经完成六爻
      if (nextStep === 6) {
        // 通知父组件
        setTimeout(() => {
          onComplete(newLines, isChanging ? [...changingLines, 5] : changingLines)
        }, 1000)
      }
    }, 1500)
  }

  // 跳过动画
  const skipAnimation = () => {
    if (!isAnimating) return

    setIsAnimating(false)

    // 直接生成结果
    const coinResults = [Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2]
    setCurrentCoins(coinResults)

    // 计算爻的类型
    const sum = coinResults.reduce((a, b) => a + b, 0)
    let lineValue: number
    let isChanging = false

    if (sum === 6) {
      // 3个花面 = 老阳 (变爻)
      lineValue = 1
      isChanging = true
    } else if (sum === 7) {
      // 2个字面1个花面 = 少阴
      lineValue = 0
    } else if (sum === 8) {
      // 2个花面1个字面 = 少阳
      lineValue = 1
    } else {
      // 3个字面 = 老阴 (变爻)
      lineValue = 0
      isChanging = true
    }

    // 更新卦象
    const newLines = [...lines, lineValue]
    setLines(newLines)

    // 更新变爻
    if (isChanging) {
      setChangingLines([...changingLines, step])
    }

    // 显示结果
    setShowResult(true)

    // 更新步骤
    const nextStep = step + 1
    setStep(nextStep)

    // 如果已经完成六爻
    if (nextStep === 6) {
      // 通知父组件
      setTimeout(() => {
        onComplete(newLines, isChanging ? [...changingLines, 5] : changingLines)
      }, 1000)
    }
  }

  // 获取爻类型
  const getLineType = () => {
    if (!currentCoins.length) return ""
    const sum = currentCoins.reduce((a, b) => a + b, 0)
    if (sum === 6) return "老阳"
    if (sum === 7) return "少阴"
    if (sum === 8) return "少阳"
    return "老阴"
  }

  // 获取爻类型的符号
  const getLineSymbol = () => {
    const type = getLineType()
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
  const getLineDescription = () => {
    const type = getLineType()
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

  // 判断是否为变爻
  const isChangingLine = () => {
    const type = getLineType()
    return type === "老阳" || type === "老阴"
  }

  return (
    <div className="w-full" onClick={skipAnimation}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">{step === 0 ? "准备开始" : getLineNameByIndex(step - 1)}</h3>
        <p className="text-muted-foreground">
          {step === 0
            ? "点击下方按钮开始摇卦"
            : step === 6
              ? "占卦完成"
              : "点击下方按钮摇卦，点击屏幕任意位置可跳过动画"}
        </p>
      </div>

      {/* 铜钱动画区域 */}
      <div className="relative h-40 w-full flex justify-center items-center mb-6">
        <AnimatePresence>
          {(isAnimating || showResult) && (
            <div className="flex space-x-8">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  initial={{ y: -50, opacity: 0, rotateY: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotateY: isAnimating ? [0, 180, 360, 540, 720, 900, 1080] : 0,
                  }}
                  transition={{
                    y: { duration: 0.5, delay: index * 0.1 },
                    rotateY: { duration: 1.5, delay: 0.2 + index * 0.2 },
                  }}
                  className="relative w-20 h-20 perspective-500"
                  style={{ perspective: "500px" }}
                >
                  <div className="w-full h-full relative preserve-3d">
                    <motion.div
                      className="absolute w-full h-full backface-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: !isAnimating && currentCoins[index] === 2 ? "rotateY(180deg)" : "rotateY(0deg)",
                        transition: "transform 0.6s",
                      }}
                    >
                      {/* 正面(字面) */}
                      <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
                        <Image
                          src="/images/coin-front.png"
                          alt="铜钱正面"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                    <motion.div
                      className="absolute w-full h-full backface-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: !isAnimating && currentCoins[index] === 3 ? "rotateY(180deg)" : "rotateY(0deg)",
                        transition: "transform 0.6s",
                      }}
                    >
                      {/* 反面(花面) */}
                      <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
                        <Image
                          src="/images/coin-back.png"
                          alt="铜钱反面"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
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
              {getLineType()}
              <span className="ml-2 text-amber-600 font-medium">{getLineSymbol()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{getLineDescription()}</p>

            {isChangingLine() && (
              <div className="mt-2 inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">变爻</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 当前卦象进度 */}
      {lines.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">当前已生成 {lines.length}/6 爻</p>
          <HexagramDisplay lines={lines} changingLines={changingLines} className="scale-75" />
        </div>
      )}

      {/* 摇卦按钮 */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={startToss}
          disabled={isAnimating}
          className={`px-8 py-2 rounded-full ${
            step >= 6 ? "bg-green-600 hover:bg-green-700" : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {isAnimating ? "摇卦中..." : step === 0 ? "开始摇卦" : step >= 6 ? "占卦完成" : `摇第${step + 1}爻`}
        </Button>
      </div>
    </div>
  )
}
