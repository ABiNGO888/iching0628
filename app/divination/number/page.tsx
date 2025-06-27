"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HexagramDisplay } from "@/components/hexagram-display"
import { AdOverlay } from "@/components/ad-overlay"
import { motion, AnimatePresence } from "framer-motion"
import { getHexagramData, trigramNames, getHexagramKey } from "@/components/hexagram-data" // Import trigramNames and getHexagramKey
import { getHexagramDataByLines, getHexagramsData } from "@/lib/hexagramParser"
import { extractYaoTextFromFile } from "@/lib/hexagramTextExtractor"
import { DivinationInstructionModal } from "@/components/divination-instruction-modal"
import { RechargeModal } from "@/components/recharge-modal"

// Import the modals
import { ShareModal } from "@/components/share-modal"
import { SaveModal } from "@/components/save-modal"
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Sparkles, Loader2 } from "lucide-react"; // Added Sparkles and Loader2 for AI interpretation button

// Helper function to get line name by index with proper yin/yang naming
const getLineNameByIndex = (index: number, hexagramLines: number[]): string => {
  if (!hexagramLines || hexagramLines.length !== 6) {
    const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
    return lineNames[index] || `第${index + 1}爻`;
  }
  
  // 根据卦象的阴阳性质生成正确的爻名
  const isYang = hexagramLines[index] === 1;
  
  if (index === 0) {
    return isYang ? '初九' : '初六';
  } else if (index === 5) {
    return isYang ? '上九' : '上六';
  } else {
    const positions = ['', '二', '三', '四', '五'];
    return isYang ? `九${positions[index]}` : `六${positions[index]}`;
  }
};

function NumberDivinationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAd, setShowAd] = useState(false)
  const [hexagram, setHexagram] = useState<number[]>([])
  const [hasResult, setHasResult] = useState(false)
  const [hexagramInterpretation, setHexagramInterpretation] = useState<any>(null)
  const [changingLineIndex, setChangingLineIndex] = useState<number | null>(null); // 新增：存储变爻索引
  
  // 显示占卦前须知弹窗
  const [showInstructionModal, setShowInstructionModal] = useState(true)
  
  // AI积分相关状态
  const [remainingCredits, setRemainingCredits] = useState(0) // 开发模式下默认为0
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [dailyFreeUsed, setDailyFreeUsed] = useState(false)

  useEffect(() => {
    // 预加载卦象数据
    getHexagramsData().catch(error => {
      console.error("Failed to load hexagram data", error)
    })
    
    // 不再自动恢复保存的卦象结果，让用户重新开始占卜
    // 清除之前保存的结果，确保每次进入都是全新的开始
    localStorage.removeItem('numberDivinationResult')
  }, [])
  
  // 初始化AI积分逻辑
  const checkAICreditsStatus = () => {
    // 如果session中有AI积分数据，使用session数据
    if (session?.user?.aiCreditsRemaining !== undefined) {
      setRemainingCredits(session.user.aiCreditsRemaining)
      return
    }
    
    // 测试模式：默认为0个积分
    setRemainingCredits(0)
  }

  useEffect(() => {
    if (session?.user) {
      checkAICreditsStatus()
    }
  }, [session])

  // 监听积分更新事件
  useEffect(() => {
    const handleAICreditsUpdate = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const userData = await response.json()
            setRemainingCredits(userData.aiCreditsRemaining || 0)
          }
        } catch (error) {
          console.error('Failed to refresh AI credits:', error)
        }
      }
    }

    const handleStorageChange = () => {
      if (session?.user) {
        checkAICreditsStatus()
      }
    }

    window.addEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    window.addEventListener('aiCreditsChanged', handleStorageChange)

    return () => {
      window.removeEventListener('aiCreditsChanged', handleStorageChange)
      window.removeEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    }
  }, [session])

  // For manual input
  const [number1, setNumber1] = useState("")
  const [number2, setNumber2] = useState("")
  const [number3, setNumber3] = useState("")
  const [remainders, setRemainders] = useState<{ lower: number | null; upper: number | null; changing: number | null }>({ lower: null, upper: null, changing: null }); // State to store remainders

  // For animation and step-by-step process
  const [currentStep, setCurrentStep] = useState(0)
  const [spinningNumbers, setSpinningNumbers] = useState<string[]>(["", "", ""])
  const [isSpinning, setIsSpinning] = useState(false)

  // Add state for modals right after the other state declarations
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [shouldKeepResult, setShouldKeepResult] = useState(false) // 新增：控制是否保持结果页面
  // AI Interpretation states
  const [userQuestionForAI, setUserQuestionForAI] = useState("");
  const [aiInterpretationResult, setAIInterpretationResult] = useState("");
  const [isAIInterpreting, setIsAIInterpreting] = useState(false);
  
  // 爻辞提取状态
  const [extractedYaoText, setExtractedYaoText] = useState<string>('')

  // For random number generation
  const generateRandomNumbers = () => {
    // Simulate ad for non-members
    setShowAd(true)
    setTimeout(() => {
      setShowAd(false)
      resetDivination()
      setCurrentStep(1)
      // 自动开始第一个数字的生成
      setTimeout(() => {
        spinNumber(1)
      }, 500)
    }, 1000) // 减少广告时间到1秒
  }

  const resetDivination = () => {
    setHexagram([])
    setNumber1("")
    setNumber2("")
    setNumber3("")
    setCurrentStep(0)
    setHasResult(false)
    setSpinningNumbers(["", "", ""])
    setHexagramInterpretation(null)
    setChangingLineIndex(null) // 重置变爻索引
    setRemainders({ lower: null, upper: null, changing: null }); // Reset remainders
    // Reset AI states
    setUserQuestionForAI("");
    setAIInterpretationResult("");
    setIsAIInterpreting(false);
    setExtractedYaoText("");
    setShowShareModal(false)
    setShowSaveModal(false)
    setShouldKeepResult(false) // 重置保持结果状态
    
    // 清除localStorage中保存的结果
    localStorage.removeItem('numberDivinationResult')
  }

  const spinNumber = (step: number) => {
    setIsSpinning(true)

    // Animation for spinning numbers
    let counter = 0
    const interval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * 900) + 100
      const newSpinningNumbers = [...spinningNumbers]
      newSpinningNumbers[step - 1] = randomNum.toString()
      setSpinningNumbers(newSpinningNumbers)

      counter++
      if (counter > 15) { // 减少动画时间
        clearInterval(interval)
        setIsSpinning(false)

        // Set the final number
        const finalNum = Math.floor(Math.random() * 900) + 100
        const newSpinningNumbers = [...spinningNumbers]
        newSpinningNumbers[step - 1] = finalNum.toString()
        setSpinningNumbers(newSpinningNumbers)

        if (step === 1) setNumber1(finalNum.toString())
        if (step === 2) setNumber2(finalNum.toString())
        if (step === 3) {
          setNumber3(finalNum.toString())

          // After the third number, calculate hexagram
          setTimeout(() => {
            const n1 = Number.parseInt(number1);
            const n2 = Number.parseInt(number2);
            const n3 = finalNum;
            calculateHexagram(n1, n2, n3);
          }, 500) // 减少等待时间
        }

        setCurrentStep(step + 1)
      }
    }, 40) // 稍微加快动画速度
  }

  const performManualDivination = () => {
    // Validate inputs
    if (!number1 || !number2 || !number3 || number1.length !== 3 || number2.length !== 3 || number3.length !== 3) {
      alert("请输入三个三位数")
      return
    }

    // Simulate ad for non-members
    setShowAd(true)
    setTimeout(() => {
      setShowAd(false)
      setIsGenerating(true)
      setHasResult(false)

      // Calculate hexagram based on input numbers
      setTimeout(() => {
        const n1 = Number.parseInt(number1);
        const n2 = Number.parseInt(number2);
        const n3 = Number.parseInt(number3);
        calculateHexagram(n1, n2, n3);
        setIsGenerating(false)
        setHasResult(true)
      }, 1500)
    }, 5000)
  }

  const calculateHexagram = async (num1: number, num2: number, num3: number) => {
    console.log(`Calculating hexagram with numbers: ${num1}, ${num2}, ${num3}`);
    // 下卦：第一组数除以8的余数 (1-8)
    const lowerRemainder = num1 % 8 === 0 ? 8 : num1 % 8
    console.log(`Lower remainder (num1 % 8): ${lowerRemainder}`);
    // 上卦：第二组数除以8的余数 (1-8)
    const upperRemainder = num2 % 8 === 0 ? 8 : num2 % 8
    console.log(`Upper remainder (num2 % 8): ${upperRemainder}`);
    // 变爻：第三组数除以6的余数 (1-6)，对应索引 (0-5)
    const changingRemainder = num3 % 6 === 0 ? 6 : num3 % 6;
    const calculatedChangingLineIndex = changingRemainder - 1;
    console.log(`Changing line index (num3 % 6 - 1): ${calculatedChangingLineIndex}`);
    setChangingLineIndex(calculatedChangingLineIndex); // Store the changing line index

    // Store remainders for display
    setRemainders({ lower: lowerRemainder, upper: upperRemainder, changing: changingRemainder });

    // Map trigram index to lines (0=Yin, 1=Yang)
    // Order: Qian(1), Dui(2), Li(3), Zhen(4), Xun(5), Kan(6), Gen(7), Kun(8)
    const trigramLines: { [key: number]: number[] } = {
      1: [1, 1, 1], // 乾 Qian
      2: [0, 1, 1], // 兑 Dui
      3: [1, 0, 1], // 离 Li
      4: [1, 0, 0], // 震 Zhen (Corrected: Yang, Yin, Yin)
      5: [1, 1, 0], // 巽 Xun
      6: [0, 1, 0], // 坎 Kan
      7: [0, 0, 1], // 艮 Gen (Corrected: Yin, Yin, Yang)
      8: [0, 0, 0], // 坤 Kun
    }

    const lowerLines = trigramLines[lowerRemainder] || [0, 0, 0] // Use 1-8 remainder
    console.log(`Lower lines (from remainder ${lowerRemainder}): ${JSON.stringify(lowerLines)}`);
    const upperLines = trigramLines[upperRemainder] || [0, 0, 0] // Use 1-8 remainder
    console.log(`Upper lines (from remainder ${upperRemainder}): ${JSON.stringify(upperLines)}`);

    // Combine lines: lower trigram first (lines 1-3), then upper trigram (lines 4-6)
    const newHexagram = [...lowerLines, ...upperLines]
    console.log(`Combined hexagram lines: ${JSON.stringify(newHexagram)}`);

    setHexagram(newHexagram)

    // Get interpretation using the combined lines - 使用新的解析器
    const hexData = getHexagramDataByLines(newHexagram) || getHexagramData(newHexagram)
    setHexagramInterpretation(hexData)
    
    // 提取变爻的爻辞
    if (hexData && calculatedChangingLineIndex !== null) {
      const isYang = newHexagram[calculatedChangingLineIndex] === 1
      try {
        const yaoText = await extractYaoTextFromFile(hexData.id, calculatedChangingLineIndex, isYang)
        if (yaoText) {
          setExtractedYaoText(yaoText)
        }
      } catch (error) {
        console.error('Failed to extract yao text:', error)
      }
    }
    
    setHasResult(true)
    setShouldKeepResult(true) // 设置保持结果状态
    
    // 保存卦象结果到localStorage
    try {
      const resultToSave = {
        hexagram: newHexagram,
        changingLineIndex: calculatedChangingLineIndex,
        hexagramInterpretation: hexData,
        remainders: { lower: lowerRemainder, upper: upperRemainder, changing: changingRemainder },
        userQuestionForAI,
        aiInterpretationResult,
        extractedYaoText,
        timestamp: Date.now()
      }
      localStorage.setItem('numberDivinationResult', JSON.stringify(resultToSave))
    } catch (error) {
      console.error('Failed to save result to localStorage:', error)
    }
    
    // 保存卦象历史记录
    try {
      const response = await fetch('/api/divination/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'number',
          hexagram: newHexagram,
          changingLines: calculatedChangingLineIndex !== null ? [calculatedChangingLineIndex] : [],
          question: userQuestionForAI || null,
          hexagramName: hexData?.name || null,
          interpretation: hexData?.decision || null
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save divination history');
      }
    } catch (error) {
      console.error('Error saving divination history:', error);
    }
  }

  // 处理AI解读请求 (copied and adapted from coin/page.tsx)
  const handleAIInterpretationSubmit = async () => {
    if (!userQuestionForAI.trim()) return;

    // AI解卦功能现在对所有用户免费开放，无需积分检查

    setIsAIInterpreting(true);
    setAIInterpretationResult(""); // 清空旧的解读结果

    let yaoCiInfo = "";
    let shouldUseGuaCi = false;
    
    if (changingLineIndex !== null && hexagramInterpretation) {
      // 数字卦通常有一个变爻，优先使用extractedYaoText（包含原文爻辞）
      if (extractedYaoText) {
        yaoCiInfo = extractedYaoText;
      } else {
        // 如果没有extractedYaoText，则使用JSON数据中的爻辞
        const yaoName = getLineNameByIndex(changingLineIndex, hexagram);
        const yaoText = hexagramInterpretation.lines_interpretation?.[yaoName];
        if (yaoText) {
          yaoCiInfo = `${yaoName}：${yaoText}`;
        } else {
          yaoCiInfo = `${yaoName}：爻辞数据暂缺`;
        }
      }
    } else {
      // 无变爻时使用总卦辞
      shouldUseGuaCi = true;
      const guaCi = hexagramInterpretation?.decision || "卦辞数据缺失";
      yaoCiInfo = `卦辞：${guaCi}`;
    }

    const benGuaName = hexagramInterpretation?.name || "未知卦象";

    const prompt = `
请以易经来说，结合以下${shouldUseGuaCi ? '卦辞' : '爻辞'}和问题，用白话文300字以内为我解读事件的发展方向或需要注意的地方：

${shouldUseGuaCi ? '卦辞' : '爻辞'}：${yaoCiInfo}
问题：${userQuestionForAI}

要求：
1. 深入解读${shouldUseGuaCi ? '卦辞' : '爻辞'}的含义，结合具体问题进行分析
2. 300字以内详细解读
3. 重点说明发展方向、注意事项和建议
4. 语言通俗易懂，贴近现代生活
5. 要紧密结合问题内容，给出针对性的指导
`;

    try {
      const response = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt,
          apiKey: process.env.NEXT_PUBLIC_ALI_API_KEY // 从环境变量读取API Key
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiInterpretation = data.interpretation || "AI未能提供解读。";
      setAIInterpretationResult(aiInterpretation);
      
      // 更新积分显示（所有用户都需要更新）
      if (data.remainingCredits !== undefined) {
        if (data.remainingCredits === "unlimited") {
          setRemainingCredits('unlimited');
        } else {
          setRemainingCredits(data.remainingCredits);
        }
      }
      
      // 非会员用户记录使用日期
      if (session?.user?.subscriptionStatus !== 'premium') {
        // 记录今天已使用免费次数
        const today = new Date().toDateString();
        localStorage.setItem('aiLastUsedDate', today);
        setDailyFreeUsed(true);
      }
      
      // 保存AI解读结果到历史记录
      try {
        await fetch('/api/divination/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'number',
            hexagram: hexagram,
            changingLines: changingLineIndex !== null ? [changingLineIndex] : [],
            question: userQuestionForAI || null,
            hexagramName: hexagramInterpretation?.name || null,
            interpretation: aiInterpretation
          }),
        });
      } catch (error) {
        console.error('Failed to save AI interpretation to history:', error);
      }
      
      // 保存完整的卦象结果到localStorage
      try {
        const resultToSave = {
          hexagram,
          changingLineIndex,
          hexagramInterpretation,
          remainders,
          userQuestionForAI,
          aiInterpretationResult: aiInterpretation,
          extractedYaoText,
          timestamp: Date.now()
        }
        localStorage.setItem('numberDivinationResult', JSON.stringify(resultToSave))
      } catch (error) {
        console.error('Failed to save result to localStorage:', error)
      }
      
      // 触发自定义事件通知其他页面更新AI次数显示
      window.dispatchEvent(new Event('aiCreditsChanged'));
      window.dispatchEvent(new Event('aiCreditsUpdated'));
    } catch (error: any) {
      console.error("AI Interpretation Error:", error);
      
      // AI解卦现在对所有用户免费，统一显示通用错误信息
      setAIInterpretationResult(`AI解读失败：${error.message}`);
      
      // 即使失败也要保存当前状态
      try {
        const resultToSave = {
          hexagram,
          changingLineIndex,
          hexagramInterpretation,
          remainders,
          userQuestionForAI,
          aiInterpretationResult,
          extractedYaoText,
          timestamp: Date.now()
        }
        localStorage.setItem('numberDivinationResult', JSON.stringify(resultToSave))
      } catch (saveError) {
        console.error('Failed to save result to localStorage:', saveError)
      }
    } finally {
      setIsAIInterpreting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24 flex flex-col items-center min-h-screen">
      <AdOverlay show={showAd} />
      <DivinationInstructionModal isOpen={showInstructionModal} onClose={() => setShowInstructionModal(false)} />
      
      {/* 固定返回按钮 - 始终显示在左上角 */}
      <div className="flex items-center mb-6 w-full max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
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
        <h1 className="text-3xl font-bold text-center flex-1 pr-16">数字卦</h1>
      </div>

      {/* Tabs for input method selection - moved outside result display */}
      {!hasResult && !shouldKeepResult && (
        <Tabs defaultValue="random" className="w-full max-w-md mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="random">随机数字</TabsTrigger>
            <TabsTrigger value="manual">手动输入</TabsTrigger>
          </TabsList>
          <TabsContent value="random" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>随机数字起卦</CardTitle>
                <CardDescription>点击按钮，让命运为您选择三个数字。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentStep === 0 && (
                  <Button onClick={generateRandomNumbers} className="w-full">
                    开始数字占卜
                  </Button>
                )}
                {currentStep > 0 && currentStep <= 3 && (
                  <div className="space-y-4">
                    <div className="flex justify-around text-2xl font-bold">
                      <span className={spinningNumbers[0] ? "text-black" : "text-gray-400"}>{spinningNumbers[0] || "---"}</span>
                       <span className={spinningNumbers[1] ? "text-black" : "text-gray-400"}>{spinningNumbers[1] || "---"}</span>
                       <span className={spinningNumbers[2] ? "text-black" : "text-gray-400"}>{spinningNumbers[2] || "---"}</span>
                    </div>
                    {currentStep <= 3 && (
                      <Button onClick={() => spinNumber(currentStep)} disabled={isSpinning} className="w-full">
                        {isSpinning ? "数字跳动中..." : currentStep === 1 ? "点击生成第一个数字" : currentStep === 2 ? "点击生成第二个数字" : "点击生成第三个数字"}
                      </Button>
                    )}
                  </div>
                )}
                {currentStep === 4 && <p className="text-center">数字已生成，请查看下方结果。</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manual" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>手动输入起卦</CardTitle>
                <CardDescription>请输入三个三位数进行占卜。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="num1">第一个三位数</Label>
                  <Input id="num1" type="number" value={number1} onChange={(e) => setNumber1(e.target.value.slice(0, 3))} placeholder="例如：123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num2">第二个三位数</Label>
                  <Input id="num2" type="number" value={number2} onChange={(e) => setNumber2(e.target.value.slice(0, 3))} placeholder="例如：456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num3">第三个三位数</Label>
                  <Input id="num3" type="number" value={number3} onChange={(e) => setNumber3(e.target.value.slice(0, 3))} placeholder="例如：789" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={performManualDivination} disabled={isGenerating} className="w-full">
                  {isGenerating ? "计算中..." : "开始占卜"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Result Display - now outside Tabs */}
      {(hasResult || shouldKeepResult) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mt-8"
          >
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">占卜结果</CardTitle>
                {hexagramInterpretation && (
                  <CardDescription className="text-lg">
                    {hexagramInterpretation.name} ({hexagramInterpretation.character} - {hexagramInterpretation.pinyin})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <HexagramDisplay lines={hexagram} changingLineIndex={changingLineIndex} />
                
                {remainders.lower !== null && (
                  <p className="text-sm text-muted-foreground">
                    数字: {number1} (下卦: {trigramNames[remainders.lower]}) / {number2} (上卦: {trigramNames[remainders.upper]}) / {number3} (变爻: {remainders.changing})
                  </p>
                )}

                {hexagramInterpretation && (
                  <div className="text-center space-y-2">
                    <p className="text-xl"><strong>卦辞：</strong> {hexagramInterpretation.description}</p>
                    {/* Interpretation field in hexagram-data.ts contains both Tuan and Xiang zhuan. We need to parse it or display as is. For now, displaying as is. */}
                    <p className="text-md"><strong>彖传/象传：</strong> {hexagramInterpretation.interpretation}</p>
                  </div>
                )}
                {changingLineIndex !== null && hexagramInterpretation && (
                  <div className="mt-4 p-4 border rounded-md w-full">
                    <h4 className="font-semibold text-lg mb-2 text-center">
                      判定为{hexagramInterpretation.name}的第{changingLineIndex + 1}爻({getLineNameByIndex(changingLineIndex, hexagram)})
                    </h4>
                    {(() => {
                      const yaoName = getLineNameByIndex(changingLineIndex, hexagram);
                      console.log("数字卦 - 查找爻辞:", {
                        yaoName,
                        changingLineIndex,
                        hexagram,
                        hasLinesInterpretation: !!hexagramInterpretation.lines_interpretation,
                        linesInterpretationKeys: hexagramInterpretation.lines_interpretation ? Object.keys(hexagramInterpretation.lines_interpretation) : [],
                        hasYaos: !!hexagramInterpretation.yaos,
                        yaosLength: hexagramInterpretation.yaos ? hexagramInterpretation.yaos.length : 0
                      });
                      
                      // 优先从lines_interpretation获取
                      let yaoText = hexagramInterpretation.lines_interpretation?.[yaoName];
                      
                      // 如果没有找到，从yaos数组中查找
                      if (!yaoText && hexagramInterpretation.yaos && Array.isArray(hexagramInterpretation.yaos)) {
                        const yao = hexagramInterpretation.yaos.find((y: any) => y.line === yaoName);
                        if (yao && yao.text) {
                          yaoText = yao.text;
                        }
                      }
                      
                      if (yaoText) {
                        return <p className="text-center"><strong>爻辞：</strong> {yaoText}</p>;
                      } else {
                        console.error("数字卦 - 未找到爻辞:", yaoName);
                        return null;
                      }
                    })()} 
                    
                    {/* 显示从六十四卦.md提取的爻辞 */}
                    {extractedYaoText && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-2">原文爻辞：</h4>
                        <div className="text-sm text-blue-700 whitespace-pre-line">
                          {extractedYaoText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

            </Card>

            {/* AI Interpretation Section - Integrated into the page */}
            {hexagramInterpretation && (
              <Card className="mt-8 shadow-xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-600" /> AI 辅助解读
                  </CardTitle>
                  <CardDescription>
                    请输入您想问的具体问题，AI将结合本次占卜结果为您提供参考。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <Textarea
                      id="ai-question-inline"
                      placeholder="例如：我最近想换工作，这个卦象对我有什么指引？"
                      value={userQuestionForAI}
                      onChange={(e) => setUserQuestionForAI(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAIInterpretationSubmit} disabled={isAIInterpreting || !userQuestionForAI.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                        {isAIInterpreting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            解读中...
                          </>
                        ) : "提交解读"}
                      </Button>
                      {/* AI解卦现在对所有用户免费，移除充值按钮 */}
                    </div>
                    {aiInterpretationResult && (
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">AI解读结果：</h4>
                        <p className="text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">{aiInterpretationResult}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <ShareModal 
              isOpen={showShareModal} 
              onClose={() => setShowShareModal(false)} 
              hexagram={hexagram} 
              interpretation={hexagramInterpretation} 
              changingLines={changingLineIndex !== null ? [changingLineIndex] : []} // Pass as array
              // resultHexagram={[]} // Number divination doesn't have a separate result hexagram in the same way
              // resultInterpretation={null}
              divinationType="number"
            />
            <SaveModal 
              isOpen={showSaveModal} 
              onClose={() => setShowSaveModal(false)} 
              hexagram={hexagram} 
              interpretation={hexagramInterpretation} 
              changingLines={changingLineIndex !== null ? [changingLineIndex] : []} // Pass as array
              // resultHexagram={[]} 
              // resultInterpretation={null}
              divinationType="number"
            />

          </motion.div>
        )}
      
      {/* AI解卦现在对所有用户免费，移除充值弹窗 */}
      
      {/* Closing div for the main container */}
      </div>
    )
  }

export default NumberDivinationPage;
