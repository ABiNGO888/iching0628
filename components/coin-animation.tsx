"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface CoinAnimationProps {
  onComplete: (coins: number[]) => void
}

export function CoinAnimation({ onComplete }: CoinAnimationProps) {
  const [coins, setCoins] = useState<number[]>([0, 0, 0]) // 0 = 未定, 2 = 反面(花面), 3 = 正面(字面)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    // 依次翻转三枚铜钱，确保公平几率
    const flipCoin = (index: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setCoins((prevCoins) => {
            const newCoins = [...prevCoins]
            // 50%几率正面(字面)或反面(花面)
            newCoins[index] = Math.random() > 0.5 ? 3 : 2
            return newCoins
          })
          resolve()
        }, 400) // 每枚硬币翻转间隔
      })
    }

    const animateCoins = async () => {
      // 开始动画
      if (animationStep === 0) {
        setAnimationStep(1)
        setTimeout(() => setAnimationStep(2), 500)
        return
      }

      // 依次翻转三枚铜钱
      if (animationStep === 2) {
        await flipCoin(0)
        await flipCoin(1)
        await flipCoin(2)

        // 动画完成后，等待一会儿再调用onComplete
        setTimeout(() => {
          onComplete(coins)
        }, 500)
      }
    }

    animateCoins()
  }, [animationStep, onComplete, coins])

  return (
    <div className="relative h-80 w-full flex flex-col items-center justify-center">
      {/* 龟壳 */}
      <div className="absolute w-56 h-56 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-amber-800">
        <div className="w-48 h-48 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center border border-amber-700">
          <div className="w-40 h-40 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full border border-amber-600"></div>
        </div>
      </div>

      {/* 钱币动画 */}
      <div className="relative z-10 mt-32">
        <div className="flex space-x-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ y: animationStep > 0 ? -100 : 0, opacity: animationStep > 0 ? 0 : 1, rotateY: 0 }}
              animate={{
                y: animationStep > 0 ? 0 : -100,
                opacity: 1,
                rotateY: coins[index] ? [0, 180, 360, 540, 720] : 0,
              }}
              transition={{
                y: { duration: 1, delay: index * 0.2 },
                rotateY: { duration: 0.375, delay: 0.5 + index * 0.4 },
              }}
              className="relative w-16 h-16 rounded-full"
            >
              <div className="w-full h-full">
                <div
                  className={`absolute inset-0 rounded-full ${
                    coins[index] === 0 ? "bg-amber-400" : coins[index] === 3 ? "bg-amber-600" : "bg-amber-500"
                  } border-4 border-amber-700 flex items-center justify-center shadow-lg`}
                >
                  {coins[index] === 3 ? (
                    // 正面(字面) - 带方孔的古钱币
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-amber-900 border border-amber-800"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-1 bg-amber-900"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-8 bg-amber-900"></div>
                      </div>
                    </div>
                  ) : coins[index] === 2 ? (
                    // 反面(花面) - 带纹理的古钱币背面
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-amber-900 border border-amber-800"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-50">
                        <div className="w-6 h-1 bg-amber-900 rotate-45"></div>
                        <div className="w-6 h-1 bg-amber-900 -rotate-45"></div>
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
      </div>
    </div>
  )
}
