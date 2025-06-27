"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HexagramDisplay } from "@/components/hexagram-display"
import { AdOverlay } from "@/components/ad-overlay"
import { getHexagramData, getHexagramKey } from "@/components/hexagram-data"
import { AIImageGenerator } from "@/components/ai-image-generator"
import { CoinDivinationStep } from "@/components/coin-divination-step"
import { ManualCoinInput } from "@/components/manual-coin-input"
import { DivinationInstructionModal } from "@/components/divination-instruction-modal"
import { RechargeModal } from "@/components/recharge-modal"
import { extractYaoTextFromFile } from "@/lib/hexagramTextExtractor"
import { Bell } from "lucide-react"
import Link from "next/link"

// Import the modals
import { ShareModal } from "@/components/share-modal"
import { SaveModal } from "@/components/save-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getHexagramById, getHexagramDataByLines, getHexagramsData } from "@/lib/hexagramParser"

export default function CoinDivinationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // 状态变量
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAd, setShowAd] = useState(false)
  const [hexagram, setHexagram] = useState<number[]>([])
  const [changingLines, setChangingLines] = useState<number[]>([])
  const [resultHexagram, setResultHexagram] = useState<number[]>([])
  const [hasResult, setHasResult] = useState(false)
  const [showMeditationStep, setShowMeditationStep] = useState(true)
  const [showDivinationStep, setShowDivinationStep] = useState(false)
  const [hexagramInterpretation, setHexagramInterpretation] = useState<any>(null)
  const [resultHexagramInterpretation, setResultHexagramInterpretation] = useState<any>(null)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showResultView, setShowResultView] = useState(false)
  const [showAITextDialog, setShowAITextDialog] = useState(false)
  const [aiTextQuestion, setAiTextQuestion] = useState("")
  const [aiTextAnswer, setAiTextAnswer] = useState("")
  const [aiTextLoading, setAiTextLoading] = useState(false)
  // 新增状态：用户AI提问，AI回答，AI加载状态
  const [userQuestionForAI, setUserQuestionForAI] = useState("");
  const [aiInterpretationResult, setAIInterpretationResult] = useState("");
  const [isAIInterpreting, setIsAIInterpreting] = useState(false);
  
  // AI积分管理状态
  const [remainingCredits, setRemainingCredits] = useState<number | "unlimited">(999) // 未登录用户默认999次
  const [dailyFreeUsed, setDailyFreeUsed] = useState(false)
  // 移除showRechargeModal状态，AI解卦现在对所有用户免费
  
  // 爻辞提取状态
  const [extractedYaoText, setExtractedYaoText] = useState<string>('')
  const [shouldKeepResult, setShouldKeepResult] = useState(false) // 新增：控制是否保持结果页面
  const [yaoAnalysisText, setYaoAnalysisText] = useState<string>('')
  
  // 显示占卦前须知弹窗
  const [showInstructionModal, setShowInstructionModal] = useState(true)
  
  // 模式选择相关状态
  const [showModeSelection, setShowModeSelection] = useState(false)
  const [divinationMode, setDivinationMode] = useState<'auto' | 'manual'>('auto')
  
  // 处理异步的爻辞解析
  useEffect(() => {
    if (hasResult) {
      renderYaoAnalysis().then(result => {
        setYaoAnalysisText(result)
      })
    }
  }, [hasResult, changingLines, hexagram, hexagramInterpretation])
  
  // 读取AI设置和预加载数据
  useEffect(() => {
    // 预加载卦象数据
    getHexagramsData().catch(error => {
      console.error("Failed to load hexagram data", error)
    })
    
    try {
      const savedSettings = localStorage.getItem("aiSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        // 如果设置了自动生成，在结果显示时会自动设置showAIGenerator为true
        // 这里不需要立即设置，因为结果还没有生成
      }
    } catch (error) {
      console.error("Failed to load AI settings", error)
    }
  }, [])

  // 初始化AI积分逻辑
  const checkAICreditsStatus = () => {
    // 如果session中有AI积分数据，使用session数据
    if (session?.user?.aiCreditsRemaining !== undefined) {
      setRemainingCredits(session.user.aiCreditsRemaining)
      return
    }
    
    // 未登录用户：默认为999个积分
    setRemainingCredits(999)
  }

  useEffect(() => {
    // 无论是否登录都检查积分状态
    checkAICreditsStatus()
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
      } else {
        // 未登录用户保持999积分
        setRemainingCredits(999)
      }
    }

    const handleStorageChange = () => {
      checkAICreditsStatus()
    }

    window.addEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    window.addEventListener('aiCreditsChanged', handleStorageChange)

    return () => {
      window.removeEventListener('aiCreditsChanged', handleStorageChange)
      window.removeEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    }
  }, [session])

  // 重置占卦
  const resetDivination = () => {
    setHexagram([])
    setChangingLines([])
    setResultHexagram([])
    setHasResult(false)
    setHexagramInterpretation(null)
    setResultHexagramInterpretation(null)
    setShowAIGenerator(false)
    setShowMeditationStep(true)
    setShowDivinationStep(false)
    setShowResultView(false)
    setShowModeSelection(false)
    setDivinationMode('auto')
    setUserQuestionForAI("")
    setAIInterpretationResult("")
    setIsAIInterpreting(false)
    setAiTextQuestion("")
    setAiTextAnswer("")
    setAiTextLoading(false)
    setShowAITextDialog(false)
    setShowShareModal(false)
    setShowSaveModal(false)
    setShouldKeepResult(false) // 重置保持结果状态
  }

  // 开始占卦
  const startDivination = () => {
    // 显示广告 (1秒)
    setShowAd(true)
    setTimeout(() => {
      setShowAd(false)
      setShowMeditationStep(false)
      setShowModeSelection(true)
    }, 1000)
  }
  
  // 设置占卦模式
  const handleModeSelection = (mode: 'auto' | 'manual') => {
    setDivinationMode(mode)
    setShowModeSelection(false)
    setShowDivinationStep(true)
  }

  // 处理占卦完成
  const handleDivinationComplete = async (lines: number[], changingLines: number[]) => {
    setHexagram(lines)
    setChangingLines(changingLines)

    // 如果有变爻，计算变卦
    if (changingLines.length > 0) {
      const newResultHexagram = [...lines]
      changingLines.forEach((lineIndex) => {
        newResultHexagram[lineIndex] = lines[lineIndex] === 1 ? 0 : 1
      })
      setResultHexagram(newResultHexagram)

      // 获取变卦解释 - 使用新的解析器
      const resultHexData = getHexagramDataByLines(newResultHexagram) || getHexagramData(newResultHexagram)
      setResultHexagramInterpretation(resultHexData)
      
      // 提取变爻的爻辞 - 根据易经占卦规则选择正确的爻辞
      const hexData = getHexagramDataByLines(lines) || getHexagramData(lines)
      if (hexData && changingLines.length > 0) {
        let targetLineIndex;
        let targetHexData = hexData;
        let targetHexagram = lines;
        
        // 根据易经占卦规则确定应该提取哪个爻的爻辞
        if (changingLines.length === 1) {
          // 一爻动：以本卦动爻之爻辞断之
          targetLineIndex = changingLines[0];
        } else if (changingLines.length === 2) {
          // 二爻动：以本卦二动爻之上爻爻辞断之
          targetLineIndex = Math.max(...changingLines);
        } else if (changingLines.length === 4) {
          // 四爻动：以变卦二不变爻之下爻爻辞断之
          const unchangedLines = [0, 1, 2, 3, 4, 5].filter(i => !changingLines.includes(i));
          targetLineIndex = Math.min(...unchangedLines);
          targetHexData = getHexagramDataByLines(newResultHexagram) || getHexagramData(newResultHexagram);
          targetHexagram = newResultHexagram;
        } else if (changingLines.length === 5) {
          // 五爻动：以变卦不变爻之爻辞断之
          targetLineIndex = [0, 1, 2, 3, 4, 5].find(i => !changingLines.includes(i));
          targetHexData = getHexagramDataByLines(newResultHexagram) || getHexagramData(newResultHexagram);
          targetHexagram = newResultHexagram;
        }
        
        if (targetLineIndex !== undefined && targetHexData) {
          const isYang = targetHexagram[targetLineIndex] === 1;
          try {
            const yaoText = await extractYaoTextFromFile(targetHexData.id, targetLineIndex, isYang);
            if (yaoText) {
              setExtractedYaoText(yaoText);
            }
          } catch (error) {
            console.error('Failed to extract yao text:', error);
          }
        }
      }
    }

    // 获取本卦解释 - 使用新的解析器
    const hexData = getHexagramDataByLines(lines) || getHexagramData(lines)
    setHexagramInterpretation(hexData)

    // 显示结果
    setHasResult(true)
    setShowDivinationStep(false)
    setShouldKeepResult(true) // 设置保持结果状态
    // 检查是否应该自动显示AI生成器
    try {
      const savedSettings = localStorage.getItem("aiSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        if (parsedSettings.autoGenerate) {
          setShowAIGenerator(true)
        }
      } else {
        // 如果没有保存的设置，默认启用AI生图功能
        setShowAIGenerator(true)
      }
    } catch (error) {
      console.error("Failed to load AI settings", error)
      // 出错时默认启用
      setShowAIGenerator(true)
    }
    setTimeout(() => {
      setShowResultView(true)
    }, 500)

    // 保存卦象到历史记录
    if (session?.user) {
      try {
        await fetch('/api/divination/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          type: 'coin',
          hexagram: lines,
          resultHexagram: changingLines.length > 0 ? newResultHexagram : null,
          changingLines: changingLines.length > 0 ? changingLines : null,
          question: userQuestionForAI || null,
          hexagramName: hexagramInterpretation?.name || null,
          interpretation: hexagramInterpretation?.decision || null
        }),
        })
      } catch (error) {
        console.error('Failed to save divination history:', error)
      }
    }
  }

  // AI解卦功能现在免费开放，移除自动弹出的对话框
  // useEffect(() => {
  //   if (hasResult) {
  //     setTimeout(() => setShowAITextDialog(true), 800)
  //   }
  // }, [hasResult])

  // 处理AI解读请求
  const handleAIInterpretationSubmit = async () => {
    if (!userQuestionForAI.trim()) return;

    // AI解卦功能现在对所有用户免费开放，无需积分检查

    setIsAIInterpreting(true);
    setAIInterpretationResult(""); // 清空旧的解读结果

    // 准备爻辞信息 - 根据易经占卦规则选择正确的爻辞
    let yaoCiInfo = "";
    let shouldUseGuaCi = false;
    
    if (changingLines.length === 0) {
      // 无变爻时使用本卦卦辞
      shouldUseGuaCi = true;
      const guaCi = hexagramInterpretation?.decision || hexagramInterpretation?.description || "卦辞数据缺失";
      const tuanXiang = hexagramInterpretation?.interpretation || "";
      yaoCiInfo = `卦辞：${guaCi}${tuanXiang ? `\n${tuanXiang}` : ""}`;
    } else if (changingLines.length === 3) {
      // 三爻动：以本卦卦辞及变卦卦辞断之，以本卦为主
      shouldUseGuaCi = true;
      const benGuaCi = hexagramInterpretation?.decision || hexagramInterpretation?.description || "本卦卦辞数据缺失";
      const benGuaTuanXiang = hexagramInterpretation?.interpretation || "";
      const bianGuaCi = resultHexagramInterpretation?.decision || resultHexagramInterpretation?.description || "变卦卦辞数据缺失";
      const bianGuaTuanXiang = resultHexagramInterpretation?.interpretation || "";
      
      yaoCiInfo = `【本卦卦辞】${benGuaCi}${benGuaTuanXiang ? `\n${benGuaTuanXiang}` : ""}

【变卦卦辞】${bianGuaCi}${bianGuaTuanXiang ? `\n${bianGuaTuanXiang}` : ""}`;
    } else {
      // 其他情况使用爻辞，优先使用extractedYaoText（包含原文爻辞）
      if (extractedYaoText) {
        yaoCiInfo = extractedYaoText;
      } else {
        // 如果没有extractedYaoText，则根据易经占卦规则选择正确的爻辞
        let targetLineIndex;
        let targetHexData = hexagramInterpretation;
        
        if (changingLines.length === 1) {
          // 一爻动：以本卦动爻之爻辞断之
          targetLineIndex = changingLines[0];
        } else if (changingLines.length === 2) {
          // 二爻动：以本卦二动爻之上爻爻辞断之
          targetLineIndex = Math.max(...changingLines);
        } else if (changingLines.length === 4) {
          // 四爻动：以变卦二不变爻之下爻爻辞断之
          const unchangedLines = [0, 1, 2, 3, 4, 5].filter(i => !changingLines.includes(i));
          targetLineIndex = Math.min(...unchangedLines);
          targetHexData = resultHexagramInterpretation;
        } else if (changingLines.length === 5) {
          // 五爻动：以变卦不变爻之爻辞断之
          targetLineIndex = [0, 1, 2, 3, 4, 5].find(i => !changingLines.includes(i));
          targetHexData = resultHexagramInterpretation;
        }
        
        if (targetLineIndex !== undefined && targetHexData) {
          // 获取正确的爻名
          const getCorrectYaoName = (lineIndex: number, hexagramLines: number[]): string => {
            const isYang = hexagramLines[lineIndex] === 1;
            if (lineIndex === 0) {
              return isYang ? '初九' : '初六';
            } else if (lineIndex === 5) {
              return isYang ? '上九' : '上六';
            } else {
              const positions = ['', '二', '三', '四', '五'];
              return isYang ? `九${positions[lineIndex]}` : `六${positions[lineIndex]}`;
            }
          };
          
          const targetHexagram = changingLines.length >= 4 ? resultHexagram : hexagram;
          const correctYaoName = getCorrectYaoName(targetLineIndex, targetHexagram);
          
          // 尝试从不同数据源获取爻辞
          let yaoText = "";
          
          // 从lines_interpretation获取
          if (targetHexData.lines_interpretation && targetHexData.lines_interpretation[correctYaoName]) {
            yaoText = targetHexData.lines_interpretation[correctYaoName];
          }
          // 从yaos数组中查找
          else if (targetHexData.yaos && Array.isArray(targetHexData.yaos)) {
            const yao = targetHexData.yaos.find((y: any) => y.line === correctYaoName);
            if (yao && yao.text) {
              yaoText = yao.text;
            }
          }
          
          if (yaoText) {
            yaoCiInfo = `${correctYaoName}：${yaoText}`;
          } else {
            yaoCiInfo = `${correctYaoName}：爻辞数据缺失`;
          }
        } else {
          yaoCiInfo = "无法确定应使用的爻辞";
        }
      }
    }

    const benGuaName = hexagramInterpretation?.name || "未知卦象";
    const bianGuaName = resultHexagramInterpretation?.name || "未知变卦";
    
    // 构建详细的占卦情况说明
    let divinationContext = "";
    if (changingLines.length === 0) {
      divinationContext = `本次占得${benGuaName}，无变爻`;
    } else if (changingLines.length === 1) {
      divinationContext = `本次占得${benGuaName}，一爻动，变为${bianGuaName}`;
    } else if (changingLines.length === 2) {
      divinationContext = `本次占得${benGuaName}，二爻动，变为${bianGuaName}`;
    } else if (changingLines.length === 3) {
      divinationContext = `本次占得${benGuaName}，三爻动，变为${bianGuaName}`;
    } else if (changingLines.length === 4) {
      divinationContext = `本次占得${benGuaName}，四爻动，变为${bianGuaName}`;
    } else if (changingLines.length === 5) {
      divinationContext = `本次占得${benGuaName}，五爻动，变为${bianGuaName}`;
    } else if (changingLines.length === 6) {
      divinationContext = `本次占得${benGuaName}，六爻皆动，变为${bianGuaName}`;
    }

    const prompt = `
请以易经占卦的角度，结合以下占卦结果和问题，用白话文300字以内为我解读事件的发展方向或需要注意的地方：

【占卦情况】${divinationContext}
【根据易经占卦规则，应以此${shouldUseGuaCi ? '卦辞' : '爻辞'}断之】
${shouldUseGuaCi ? '卦辞' : '爻辞'}：${yaoCiInfo}

【问题】${userQuestionForAI}

要求：
1. 请明确这是根据易经占卦规则选择的正确${shouldUseGuaCi ? '卦辞' : '爻辞'}，必须以此为准进行解读
2. ${changingLines.length === 3 ? '三爻动时，以本卦卦辞及变卦卦辞断之，以本卦为主。请重点解读本卦卦辞的含义，同时参考变卦卦辞，分析事物的发展变化趋势' : `深入解读${shouldUseGuaCi ? '卦辞' : '爻辞'}的含义，结合具体问题进行分析`}
3. 300字以内详细解读
4. 重点说明发展方向、注意事项和建议
5. 语言通俗易懂，贴近现代生活
6. 要紧密结合问题内容，给出针对性的指导
7. 不要使用其他爻辞，严格按照提供的${shouldUseGuaCi ? '卦辞' : '爻辞'}进行解读
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
            type: 'coin',
            hexagram: lines,
            resultHexagram: changingLines.length > 0 ? newResultHexagram : null,
            changingLines: changingLines.length > 0 ? changingLines : null,
            question: userQuestionForAI || null,
            hexagramName: hexagramInterpretation?.name || null,
            interpretation: aiInterpretation
          }),
        });
      } catch (error) {
        console.error('Failed to save AI interpretation to history:', error);
      }
      
      // 触发自定义事件通知其他页面更新AI次数显示
      window.dispatchEvent(new Event('aiCreditsChanged'));
      window.dispatchEvent(new Event('aiCreditsUpdated'));

    } catch (error: any) {
      console.error("AI interpretation error:", error);
      
      // AI解卦现在对所有用户免费，统一显示通用错误信息
      setAIInterpretationResult(`AI解读时发生错误：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAIInterpreting(false);
    }
  };

  // 获取爻的名称，根据卦象的阴阳性质生成正确的爻名
  const getLineNameByIndex = (index: number, hexagramLines?: number[]): string => {
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
  }

  // 渲染结果视图
  const renderResultView = () => {
    return (
      <div className="bg-[#f5eee1] min-h-screen pb-20">
        <div className="container pt-6 pb-16">
          <div className="flex items-center mb-6">
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
            <h1 className="text-2xl font-bold text-center flex-1 pr-16">每日一卦</h1>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold">{hexagramInterpretation?.name || "未知卦象"}</h2>
            <p className="text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
          </div>

          {/* 卦象展示区，居中，箭头连接 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col items-center">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center mx-6">
                <HexagramDisplay lines={hexagram} changingLines={changingLines} />
                <div className="mt-2 text-base text-gray-700 font-semibold">{hexagramInterpretation?.name || "本卦"}</div>
              </div>
              <div className="mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24" viewBox="0 0 48 24" fill="none">
                  <path d="M4 12h40M36 6l8 6-8 6" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col items-center mx-6">
                <HexagramDisplay lines={resultHexagram} changingLines={[]} />
                <div className="mt-2 text-base text-gray-700 font-semibold">{resultHexagramInterpretation?.name || "变卦"}</div>
              </div>
            </div>
          </div>

          {/* 变爻解析与卦辞爻辞展示区 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <span className="text-lg font-bold text-red-700">变爻解析：</span>
              <div className="mt-2 text-base text-gray-800 whitespace-pre-line">
                {yaoAnalysisText}
              </div>
              
              {/* 显示原文爻辞 */}
              {extractedYaoText && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h4 className="text-md font-semibold text-amber-700 mb-2">原文爻辞：</h4>
                  <p className="text-gray-700 whitespace-pre-line">{extractedYaoText}</p>
                </div>
              )}

              {/* 新增：AI解卦提问区域 */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">AI辅助解卦</h3>
                <p className="text-sm text-gray-600 mb-4">
                  结合当前卦象和爻辞，输入您想问的具体问题，让AI为您提供更个性化的白话解读。
                </p>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow duration-200 ease-in-out shadow-sm resize-none"
                  rows={3}
                  placeholder="例如：我应该如何理解这个变爻对我的事业的启示？"
                  value={userQuestionForAI}
                  onChange={(e) => setUserQuestionForAI(e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <Button 
                    onClick={handleAIInterpretationSubmit} 
                    disabled={isAIInterpreting || !userQuestionForAI.trim()}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAIInterpreting ? "正在解读中..." : "提交给AI解读"}
                  </Button>
                  {/* AI解卦现在对所有用户免费，移除充值按钮 */}
                </div>
                {aiInterpretationResult && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md shadow">
                    <h4 className="text-md font-semibold text-amber-700 mb-2">AI解读结果：</h4>
                    <p className="text-gray-700 whitespace-pre-line">{aiInterpretationResult}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI生图区域 - 暂时隐藏 */}
            {/* {showAIGenerator && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <AIImageGenerator hexagramName={hexagramInterpretation?.name || "未知卦象"} />
              </div>
            )} */}


          </div>



          {/* <div className="flex justify-center mt-8">
            <Button className="bg-amber-700 text-white px-8" onClick={resetDivination}>再来一卦</Button>
          </div> */}
        </div>
      </div>
    )
  }

  // 变爻解析与卦辞爻辞展示
  async function renderYaoAnalysis() {
    if (!hexagramInterpretation) return "正在加载卦象信息...";

    const mainHexData = hexagramInterpretation;
    const changedHexData = resultHexagramInterpretation;

    if (!mainHexData || !mainHexData.name) return "错误：未能加载本卦数据。";

    const numChanging = changingLines.length;
    let rule = "";
    let analysis = "";

    // 辅助函数，获取爻名
    const getYaoName = (lineIndex: number): string => {
      // 爻位名称映射（从下到上：初、二、三、四、五、上）
      const lineNames = ['初', '二', '三', '四', '五', '上'];
      if (lineIndex < 0 || lineIndex >= lineNames.length) {
        return `第${lineIndex + 1}爻`;
      }
      
      // 获取当前卦象的二进制表示，用于判断爻的阴阳性质
      const hexagramKey = getHexagramKey(hexagram);
      
      // 注意：hexagramKey是从上往下的顺序（上爻到初爻），但lineIndex是从下往上的（初爻到上爻）
      // 所以需要转换索引：lineIndex=0对应hexagramKey[5]，lineIndex=5对应hexagramKey[0]
      const hexagramBitIndex = 5 - lineIndex;
      const isYang = hexagramKey[hexagramBitIndex] === '1';
      
      // 构建正确的爻名
      if (lineIndex === 0) {
        return isYang ? '初九' : '初六';
      } else if (lineIndex === 5) {
        return isYang ? '上九' : '上六';
      } else {
        const positions = ['', '二', '三', '四', '五'];
        return isYang ? `九${positions[lineIndex]}` : `六${positions[lineIndex]}`;
      }
    };

    // 辅助函数，安全地获取爻辞
    const getYaoText = async (hexData: any, lineIndex: number, targetHexagram?: number[]): Promise<string | null> => {
      if (!hexData || lineIndex < 0) {
        console.error("getYaoText: Invalid hexData or lineIndex", hexData, lineIndex);
        return null;
      }
      
      // 爻位名称映射（从下到上：初、二、三、四、五、上）
      const lineNames = ['初', '二', '三', '四', '五', '上'];
      if (lineIndex >= lineNames.length) {
        console.error("getYaoText: lineIndex out of range", lineIndex);
        return null;
      }
      
      // 获取目标卦象的二进制表示，用于判断爻的阴阳性质
      // 如果没有提供targetHexagram，则使用当前卦象
      const targetHex = targetHexagram || hexagram;
      const hexagramKey = getHexagramKey(targetHex);
      
      // 注意：hexagramKey是从上往下的顺序（上爻到初爻），但lineIndex是从下往上的（初爻到上爻）
      // 所以需要转换索引：lineIndex=0对应hexagramKey[5]，lineIndex=5对应hexagramKey[0]
      const hexagramBitIndex = 5 - lineIndex;
      const isYang = hexagramKey[hexagramBitIndex] === '1';
      
      // 构建正确的爻名
      let yaoName = '';
      if (lineIndex === 0) {
        yaoName = isYang ? '初九' : '初六';
      } else if (lineIndex === 5) {
        yaoName = isYang ? '上九' : '上六';
      } else {
        const positions = ['', '二', '三', '四', '五'];
        yaoName = isYang ? `九${positions[lineIndex]}` : `六${positions[lineIndex]}`;
      }
      
      // 优先从lines_interpretation获取
      if (hexData.lines_interpretation && hexData.lines_interpretation[yaoName]) {
        return `${yaoName}：${hexData.lines_interpretation[yaoName]}`;
      }
      
      // 从yaos数组中查找
      if (hexData.yaos && Array.isArray(hexData.yaos)) {
        const yao = hexData.yaos.find((y: any) => y.line === yaoName);
        if (yao && yao.text) {
          return `${yaoName}：${yao.text}`;
        }
      }
      
      // 如果以上都没找到，尝试从六十四卦.md文件中提取
      try {
        const extractedText = await extractYaoTextFromFile(hexData.id, lineIndex, isYang);
        if (extractedText) {
          return `${yaoName}：${extractedText}`;
        }
      } catch (error) {
        console.error("Failed to extract yao text from file:", error);
      }
      
      console.error("getYaoText: No matching yao found for", yaoName);
      return null;
    };

    switch (numChanging) {
      case 0:
        rule = "〇爻动：以本卦卦辞断之。";
        analysis = `【${mainHexData.name}】${mainHexData.description}\n【解读】${mainHexData.interpretation || '无'}`;
        break;

      case 1:
        const lineIndex1 = changingLines[0];
        const yaoName1 = getYaoName(lineIndex1);
        rule = `一爻动：以本卦动爻之爻辞断之(即本卦:${mainHexData.name}的${yaoName1}爻辞断之。)`;
        const yaoText1 = await getYaoText(mainHexData, lineIndex1);
        analysis = yaoText1 ? `【${mainHexData.name}】${yaoText1}` : "错误：未能加载对应爻辞。";
        break;

      case 2:
        const higherLineIndex = Math.max(...changingLines);
        const yaoName2 = getYaoName(higherLineIndex);
        rule = `二爻动：以本卦二动爻之上爻爻辞断之(即本卦:${mainHexData.name}的${yaoName2}爻辞断之。)`;
        const yaoText2 = await getYaoText(mainHexData, higherLineIndex);
        analysis = yaoText2 ? `【${mainHexData.name}】${yaoText2}` : "错误：未能加载对应爻辞。";
        break;

      case 3:
        rule = "三爻动：以本卦卦辞及变卦卦辞断之，以本卦为主。";
        if (!changedHexData || !changedHexData.name) return "错误：未能加载变卦数据。";
        const mainText3 = `【本卦：${mainHexData.name}】${mainHexData.description}\n【解读】${mainHexData.interpretation || '无'}`;
        const changedText3 = `【变卦：${changedHexData.name}】${changedHexData.description}\n【解读】${changedHexData.interpretation || '无'}`;
        analysis = `${mainText3}\n\n${changedText3}`;
        break;

      case 4:
        if (!changedHexData || !changedHexData.name) return "错误：未能加载变卦数据。";
        const unchangedLines4 = [0, 1, 2, 3, 4, 5].filter(i => !changingLines.includes(i));
        if (unchangedLines4.length < 2) return "错误：变卦中不变爻少于两个。";
        const lowerUnchangedIndex4 = Math.min(...unchangedLines4);
        const yaoName4 = getYaoName(lowerUnchangedIndex4);
        rule = `四爻动：以变卦二不变爻之下爻爻辞断之(即变卦:${changedHexData.name}的${yaoName4}爻辞断之。)`;
        const yaoText4 = await getYaoText(changedHexData, lowerUnchangedIndex4, resultHexagram);
        analysis = yaoText4 ? `【${changedHexData.name}】${yaoText4}` : "错误：未能加载对应爻辞。";
        break;

      case 5:
        if (!changedHexData || !changedHexData.name) return "错误：未能加载变卦数据。";
        const unchangedLineIndex5 = [0, 1, 2, 3, 4, 5].find(i => !changingLines.includes(i));
        if (unchangedLineIndex5 !== undefined) {
          const yaoName5 = getYaoName(unchangedLineIndex5);
          rule = `五爻动：以变卦不变爻之爻辞断之(即变卦:${changedHexData.name}的${yaoName5}爻辞断之。)`;
          const yaoText5 = await getYaoText(changedHexData, unchangedLineIndex5, resultHexagram);
          analysis = yaoText5 ? `【${changedHexData.name}】${yaoText5}` : "错误：未能加载对应爻辞。";
        } else {
          rule = "五爻动：以变卦不变爻之爻辞断之。";
          analysis = "错误：无法确定不变爻。";
        }
        break;

      case 6:
        if (!changedHexData || !changedHexData.name) return "错误：未能加载变卦数据。";
        if (changedHexData.use_nine) {
          rule = "六爻皆动：以变卦之“用九”断之。";
          analysis = `【用九】${changedHexData.use_nine}`;
        } else if (changedHexData.use_six) {
          rule = "六爻皆动：以变卦之“用六”断之。";
          analysis = `【用六】${changedHexData.use_six}`;
        } else {
          rule = "六爻皆动：以变卦卦辞断之。";
          analysis = `【${changedHexData.name}】${changedHexData.description}\n【解读】${changedHexData.interpretation || '无'}`;
        }
        break;

      default:
        analysis = "无效的变爻数量。";
    }

    return `${rule}\n\n${analysis}`;
  }

  // 主要渲染逻辑
  if (showResultView || shouldKeepResult) {
    return (
      <>
        {renderResultView()}
        <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
        <SaveModal open={showSaveModal} onOpenChange={setShowSaveModal} />
      </>
    )
  }

  // 渲染主页面
  return (
    <div className="container py-8 pb-24 relative min-h-screen">
      {showInstructionModal && (
        <DivinationInstructionModal onClose={() => setShowInstructionModal(false)} divinationType="coin" />
      )}
      
      {showAd && <AdOverlay />}

      <div className="flex items-center mb-6">
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
        <h1 className="text-3xl font-bold text-center flex-1 pr-16">金钱卦</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="md:min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>起卦</CardTitle>
            <CardDescription>金钱卦是传统的铜钱起卦方法，通过模拟抛掷三枚铜钱来生成卦象</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            {showMeditationStep && (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">准备好了吗？</h3>
                <p className="text-muted-foreground mb-6">静心凝神，默念所求之事，然后点击开始。</p>
                <Button onClick={startDivination} size="lg" className="bg-amber-600 hover:bg-amber-700">
                  开始摇卦
                </Button>
              </div>
            )}
            {showModeSelection && (
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold mb-8">选择金钱卦方式</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModeSelection('auto')}>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">自动摇卦</h3>
                      <p className="text-sm text-muted-foreground">系统自动模拟摇卦过程，适合快速占卜</p>
                    </div>
                  </Card>
                  <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModeSelection('manual')}>
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold">手动输入</h3>
                      <p className="text-sm text-muted-foreground">手动输入真实摇卦结果，适合实体占卜</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            {showDivinationStep && (
              divinationMode === 'auto' ? (
                <CoinDivinationStep onComplete={handleDivinationComplete} />
              ) : (
                <ManualCoinInput onComplete={handleDivinationComplete} onBack={() => setShowModeSelection(true)} />
              )
            )}
          </CardContent>
        </Card>

        <Card className="md:min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>卦象结果</CardTitle>
            <CardDescription>摇出的卦象将显示在此处</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            {!hasResult && (
              <div className="text-center text-muted-foreground">
                <p>请先完成起卦</p>
              </div>
            )}
            {hasResult && (
              <div className="w-full">
                <div className="flex justify-around items-start mb-6">
                  <div>
                    <p className="text-center font-medium mb-2">本卦</p>
                    <HexagramDisplay lines={hexagram} changingLines={changingLines} />
                    <p className="text-center mt-2 font-semibold">{hexagramInterpretation?.name}</p>
                  </div>
                  {resultHexagram.length > 0 && (
                    <>
                      <div className="flex items-center h-full pt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                      <div>
                        <p className="text-center font-medium mb-2">之卦</p>
                        <HexagramDisplay lines={resultHexagram} />
                        <p className="text-center mt-2 font-semibold">{resultHexagramInterpretation?.name}</p>
                      </div>
                    </>
                  )}
                </div>

                {showAIGenerator && (
                  <AIImageGenerator
                    prompt={`易经 ${hexagramInterpretation?.name} 卦 ${resultHexagram.length > 0 ? `之 ${resultHexagramInterpretation?.name} 卦` : ''}`}
                    onGenerating={setIsGenerating}
                  />
                )}

                {changingLines.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-lg font-medium mb-2">变爻解读</h3>
                    <div className="mt-2 text-sm space-y-2">
                      <div className="p-2 bg-amber-100 rounded-md mb-3">
                        <p className="font-medium mb-1">变爻规则：</p>
                        {changingLines.length === 1 && <p>一爻动，以本卦动爻爻辞断。</p>}
                        {changingLines.length === 2 && <p>二爻动，以本卦动爻辞断，上爻为主。</p>}
                        {changingLines.length === 3 && <p>三爻动，以本卦及变卦卦辞彖辞断，以本卦为主。</p>}
                        {changingLines.length === 4 && <p>四爻动，以变卦二静爻爻辞断，以下爻为主。</p>}
                        {changingLines.length === 5 && <p>五爻动，以变卦静爻爻辞断。</p>}
                        {changingLines.length === 6 && <p>六爻全动，以变卦卦辞彖辞断。（乾坤两卦以用辞断）</p>}
                      </div>
                      {changingLines.map((line, index) => (
                        <div key={index} className="p-2 bg-amber-50 rounded-md">
                          <span className="font-medium">{getLineNameByIndex(line, hexagram)}：</span>
                          {(() => {
                            const yaoName = getLineNameByIndex(line, hexagram);
                            
                            // 首先尝试从 lines_interpretation 中获取
                            let yaoText = null;
                            if (hexagramInterpretation?.lines_interpretation && hexagramInterpretation.lines_interpretation[yaoName]) {
                              yaoText = hexagramInterpretation.lines_interpretation[yaoName];
                            }
                            
                            // 如果没有找到，从yaos数组中查找
                            if (!yaoText && hexagramInterpretation?.yaos && Array.isArray(hexagramInterpretation.yaos)) {
                              const yao = hexagramInterpretation.yaos.find((y: any) => y.line === yaoName);
                              if (yao && yao.text) {
                                yaoText = yao.text;
                              }
                            }
                            
                            if (yaoText) {
                              return yaoText;
                            } else {
                              console.error("金钱卦 - 未找到爻辞:", yaoName);
                              // 保留原有的默认文本作为后备
                              if (line === 0) return "谨慎起步，稳固根基。";
                              if (line === 1) return "逐渐发展，循序渐进。";
                              if (line === 2) return "处于中位，谨防挫折。";
                              if (line === 3) return "局势渐明，调整方向。";
                              if (line === 4) return "居高位，影响广泛。";
                              if (line === 5) return "事情终结，总结经验。";
                              return "爻辞数据缺失";
                            }
                          })()} 
                        </div>
                      ))}
                      
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
                  </div>
                )}

                {changingLines.length === 0 && (
                  <div>
                    <h3 className="text-lg font-medium border-b pb-2">卦象解析</h3>
                    <div className="mt-2 text-sm p-2 bg-amber-100 rounded-md">
                      <p className="font-medium mb-1">变爻规则：</p>
                      <p>六爻安静，查看卦辞彖辞断。</p>
                    </div>
                  </div>
                )}

                {hasResult && !showAIGenerator && (
                  <div className="pt-4">
                    {/* <Button onClick={() => setShowAIGenerator(true)} className="w-full" variant="outline">
                      生成AI解卦画像
                    </Button> */}
                  </div>
                )}
              </div>
            )}
          </CardContent>

        </Card>
      </div>

      <Dialog open={showAITextDialog} onOpenChange={setShowAITextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI智能解卦对话</DialogTitle>
            <DialogDescription>请输入你想结合卦象进一步询问的问题，AI将为你精准解读。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              placeholder="例如：这卦对我近期事业有何启示？"
              value={aiTextQuestion}
              onChange={e => setAiTextQuestion(e.target.value)}
              disabled={aiTextLoading}
            />
            <button
              className="w-full bg-amber-600 text-white rounded py-2 mt-2 disabled:opacity-60"
              disabled={!aiTextQuestion.trim() || aiTextLoading}
              onClick={async () => {
                setAiTextLoading(true)
                setAiTextAnswer("")
                // 预留AI文本API调用接口
                try {
                  const res = await fetch("/api/ai/interpret", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: aiTextQuestion,
                      hexagram: hexagramInterpretation?.name,
                      description: hexagramInterpretation?.description,
                      interpretation: hexagramInterpretation?.interpretation
                    })
                  })
                  const data = await res.json()
                  setAiTextAnswer(data.answer || "AI暂未返回解读，请稍后重试。")
                } catch {
                  setAiTextAnswer("AI解读失败，请检查网络或稍后再试。")
                } finally {
                  setAiTextLoading(false)
                }
              }}
            >{aiTextLoading ? "解读中..." : "提交问题并AI解读"}</button>
            {aiTextAnswer && (
              <div className="bg-gray-50 border rounded p-2 mt-2 text-sm text-gray-800 whitespace-pre-line">{aiTextAnswer}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
      <SaveModal open={showSaveModal} onOpenChange={setShowSaveModal} />
      
      {/* AI解卦现在对所有用户免费，移除充值弹窗 */}
    </div>
  )
}
