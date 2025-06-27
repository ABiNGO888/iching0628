'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HexagramDisplay } from "@/components/hexagram-display"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

interface ManualCoinInputProps {
  onComplete: (lines: number[], changingLines: number[]) => void
  onBack: () => void
}

export function ManualCoinInput({ onComplete, onBack }: ManualCoinInputProps) {
  const [currentStep, setCurrentStep] = useState(0) // 0-5 表示当前正在输入的爻（从下往上）
  const [lines, setLines] = useState<number[]>([])
  const [changingLines, setChangingLines] = useState<number[]>([])
  const [currentCoins, setCurrentCoins] = useState<number[]>([2, 2, 2]) // 2=花面, 3=字面
  const [showResult, setShowResult] = useState(false)

  // 获取当前爻的名称（初爻、二爻、三爻、四爻、五爻、上爻）
  const getLineNameByIndex = (index: number): string => {
    const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]
    return lineNames[index] || `第${index + 1}爻`
  }

  // 翻转铜钱
  const flipCoin = (coinIndex: number) => {
    if (showResult) return
    
    const newCoins = [...currentCoins]
    newCoins[coinIndex] = newCoins[coinIndex] === 2 ? 3 : 2
    setCurrentCoins(newCoins)
  }

  // 确认当前爻
  const confirmCurrentLine = () => {
    if (showResult) return

    // 计算爻的类型
    const sum = currentCoins.reduce((a, b) => a + b, 0)
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
      setChangingLines([...changingLines, currentStep])
    }

    // 显示结果
    setShowResult(true)

    // 1秒后进入下一爻或完成
    setTimeout(() => {
      if (currentStep === 5) {
        // 完成六爻，通知父组件
        onComplete(newLines, isChanging ? [...changingLines, currentStep] : changingLines)
      } else {
        // 进入下一爻
        setCurrentStep(currentStep + 1)
        setCurrentCoins([2, 2, 2]) // 重置铜钱状态
        setShowResult(false)
      }
    }, 1500)
  }

  // 获取爻类型
  const getLineType = () => {
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

  // 返回上爻
  const goBackToPreviousLine = () => {
    if (currentStep === 0) {
      // 如果是第一爻，只重置当前爻
      setCurrentCoins([2, 2, 2])
      setShowResult(false)
    } else {
      // 返回上一爻，移除最后一个已确认的爻
      const newLines = lines.slice(0, -1)
      setLines(newLines)
      
      // 检查上一爻是否是变爻，如果是则从变爻列表中移除
      const previousLineIndex = currentStep - 1
      if (changingLines.includes(previousLineIndex)) {
        setChangingLines(changingLines.filter(index => index !== previousLineIndex))
      }
      
      // 回到上一步
      setCurrentStep(currentStep - 1)
      setCurrentCoins([2, 2, 2])
      setShowResult(false)
    }
  }

  return (
    <div className="w-full">
      {/* 返回按钮 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回选择
        </Button>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">{getLineNameByIndex(currentStep)}</h3>
        <p className="text-muted-foreground">
          {currentStep === 5 && lines.length === 5
            ? "最后一爻，完成后开始解卦"
            : "点击铜钱翻面，选择好后点击确认"}
        </p>
      </div>

      {/* 铜钱输入区域 */}
      <div className="relative h-40 w-full flex justify-center items-center mb-6">
        <div className="flex space-x-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="relative w-20 h-20 cursor-pointer"
              onClick={() => flipCoin(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                animate={{
                  rotateY: currentCoins[index] === 3 ? 180 : 0,
                }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 花面 (正面显示) */}
                <div
                  className="absolute w-full h-full backface-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-amber-300">
                    <Image
                      src="/images/coin-back.png"
                      alt="铜钱花面"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* 字面 (背面显示) */}
                <div
                  className="absolute w-full h-full backface-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden shadow-lg border-2 border-amber-300">
                    <Image
                      src="/images/coin-front.png"
                      alt="铜钱字面"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
              {/* 标签 */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                {currentCoins[index] === 2 ? "花面" : "字面"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 当前组合预览 */}
      <div className="text-center mb-6">
        <div className="mb-2">
          <span className="font-medium">当前组合：</span>
          {getLineType()}
          <span className="ml-2 text-amber-600 font-medium">{getLineSymbol()}</span>
        </div>
        <p className="text-sm text-muted-foreground">{getLineDescription()}</p>
        {isChangingLine() && (
          <div className="mt-2 inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">变爻</div>
        )}
      </div>

      {/* 结果显示 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="text-green-700 font-medium">
              {getLineNameByIndex(currentStep)} 已确认：{getLineType()}
            </div>
            {currentStep === 5 ? (
              <div className="text-sm text-green-600 mt-1">六爻完成，正在生成卦象...</div>
            ) : (
              <div className="text-sm text-green-600 mt-1">准备输入下一爻</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 当前卦象进度 */}
      {lines.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-2">当前已输入 {lines.length}/6 爻</p>
          <HexagramDisplay lines={lines} changingLines={changingLines} className="scale-75" />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={goBackToPreviousLine}
          disabled={showResult}
        >
          {currentStep === 0 ? "重置当前爻" : "返回上爻"}
        </Button>
        <Button
          onClick={confirmCurrentLine}
          disabled={showResult}
          className="bg-blue-600 hover:bg-blue-700"
        >
          确认{getLineNameByIndex(currentStep)}
        </Button>
      </div>
    </div>
  )
}