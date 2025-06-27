"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Share2, RefreshCw, Settings } from "lucide-react"
import { ShareModal } from "@/components/share-modal"
import { SaveModal } from "@/components/save-modal"
import { AIIntegrationSettings } from "./ai-integration-settings"
import { RechargeModal } from "@/components/recharge-modal"
import { useRouter } from "next/navigation"

interface AIImageGeneratorProps {
  hexagramName: string
  hexagramDescription: string
  interpretation: string
  lines?: number[]
  changingLines?: number[]
}

export function AIImageGenerator({
  hexagramName,
  hexagramDescription,
  interpretation,
  lines = [],
  changingLines = [],
}: AIImageGeneratorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [userQuestion, setUserQuestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [apiConnected, setApiConnected] = useState(true) // 默认已连接，因为我们已经有API密钥
  const [customApiKey, setCustomApiKey] = useState("")
  const [remainingCredits, setRemainingCredits] = useState<number | "unlimited">(0) // 开发者测试：默认为0
  const [needsPayment, setNeedsPayment] = useState(false)
  // 移除showRechargeModal状态，AI图片生成现在对所有用户免费
  const [autoGenerate, setAutoGenerate] = useState(true) // 默认自动生成
  const [dailyFreeUsed, setDailyFreeUsed] = useState(false)
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"

  // 获取用户AI绘图额度和设置
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData?.user) {
            const user = sessionData.user
            
            // 开发者测试模式：每次打开时次数为零
            if (isTestMode || user.isDeveloper) {
              setRemainingCredits(0)
            } else {
              // 检查每日免费次数
              const today = new Date().toDateString()
              const lastFreeDate = localStorage.getItem('lastFreeDate')
              const freeUsedToday = localStorage.getItem('freeUsedToday') === 'true'
              
              if (lastFreeDate !== today) {
                // 新的一天，重置免费次数
                localStorage.setItem('lastFreeDate', today)
                localStorage.setItem('freeUsedToday', 'false')
                setDailyFreeUsed(false)
                setRemainingCredits(user.aiCreditsRemaining + 1) // 加上每日免费1次
              } else {
                setDailyFreeUsed(freeUsedToday)
                setRemainingCredits(user.aiCreditsRemaining + (freeUsedToday ? 0 : 1))
              }
            }
          }
        }
      } catch (error) {
        console.error('获取会话信息失败:', error)
      }
    }

    fetchSession()
    
    // 获取AI设置
    try {
      const savedSettings = localStorage.getItem("aiSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setAutoGenerate(parsedSettings.autoGenerate)
        setCustomApiKey(parsedSettings.apiKey || '')
        setApiConnected(!!parsedSettings.apiKey)
        
        // 如果设置为自动生成且有问题，自动生成图像
        if (parsedSettings.autoGenerate && hexagramName && hexagramDescription) {
          // 设置一个默认问题
          const defaultQuestion = "请解读这个卦象对我的启示";
          setUserQuestion(defaultQuestion)
          // 延迟一秒后自动生成，确保组件已完全加载
          setTimeout(() => {
            // 使用当前状态值而不是可能过时的闭包值
            autoGenerateImage(defaultQuestion);
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Failed to load AI settings", error)
    }
  }, [hexagramName, hexagramDescription])
  
  // 自动生成图像的函数
  const autoGenerateImage = async (question: string) => {
    // AI图片生成现在对所有用户免费开放

    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedText(null);
    setNeedsPayment(false);

    try {
      // 创建提示词，包含卦象爻词与用户问题
      const prompt = `${hexagramName}卦：${hexagramDescription}。问题：${question}。${interpretation}`;

      // 始终使用真实API端点，不管是否为测试模式
      const endpoint = "/api/ai/generate-image";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          useCustomApi: !!customApiKey,
          customApiKey,
        }),
      });

      // Check if response is OK and is JSON before parsing
      if (!response.ok) {
        const errorText = await response.text(); // Get error text for logging
        console.error(`生成图像失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`生成图像失败: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("收到了非JSON响应:", responseText);
        throw new Error("服务器返回了无效的响应格式");
      }

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.imageUrl;
        setGeneratedImage(imageUrl);
        setRemainingCredits(data.remainingCredits);
        
        // 自动保存图像到Aiphoto文件夹
        saveImageToAiphoto(imageUrl, hexagramName, question); // Call the separate save function
        
        // 如果使用了每日免费次数，标记为已使用
        if (!dailyFreeUsed && !(isTestMode || (await fetch('/api/auth/session').then(r => r.json())).user?.isDeveloper)) {
          setDailyFreeUsed(true);
          localStorage.setItem('freeUsedToday', 'true');
        }
        
        setGeneratedText(
          `基于"${hexagramName}"卦象和您的问题"${question}"，AI解读如下：\n\n${interpretation}\n\n这幅图像展示了${hexagramName}的精神，象征着${
            hexagramName.includes("乾")
              ? "创造力和领导力"
              : hexagramName.includes("坤")
                ? "包容和顺从"
                : hexagramName.includes("震")
                  ? "行动和激发"
                  : hexagramName.includes("艮")
                    ? "稳定和停止"
                    : hexagramName.includes("离")
                      ? "光明和洞察"
                      : hexagramName.includes("坎")
                        ? "危险和机遇"
                        : hexagramName.includes("巽")
                          ? "柔顺和渗透"
                          : hexagramName.includes("兑")
                            ? "喜悦和满足"
                            : "变化与平衡"
          }。您的问题将在${Math.floor(Math.random() * 10) + 1}天内得到答案。`,
        );
      } else if (data.needsPayment) {
        // AI图片生成现在对所有用户免费，不再显示充值弹窗
        console.log("AI图片生成免费开放，忽略needsPayment");
      } else {
        console.error("生成图像失败", data.message);
        throw new Error(data.message || "生成图像失败");
      }
    } catch (error) {
      console.error("生成图像失败", error);
      // Optionally show user-friendly error message here
      alert(`生成图像时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 自动保存图像到Aiphoto文件夹
  const saveImageToAiphoto = async (imageUrl: string, hexagramName: string, question: string) => {
    try {
      // 创建文件名：卦名-日期时间
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
      const fileName = `${hexagramName}-${dateStr}.jpg`;
      
      // 发送请求到服务器保存图像
      const response = await fetch('/api/ai/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          fileName,
          folderPath: 'Aiphoto',
          metadata: {
            hexagramName,
            question,
            date: now.toISOString()
          }
        }),
      });

      // Check if response is OK and is JSON before parsing
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`保存图像失败: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`保存图像失败: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("保存图像时收到了非JSON响应:", responseText);
        throw new Error("保存图像时服务器返回了无效的响应格式");
      }
      
      const result = await response.json();
      if (result.success) {
        console.log('图像已自动保存到Aiphoto文件夹');
      } else {
        console.error('保存图像失败:', result.message);
        // Optionally notify user
      }
    } catch (error) {
      console.error('保存图像时出错:', error);
      // Optionally notify user
    }
  };
  
  // 处理API连接
  const handleApiConnect = (_provider: string, key: string) => {
    setCustomApiKey(key)
    setApiConnected(true)
    localStorage.setItem("customAiApiKey", key)
  }

  // 修改generateImage函数，使其在测试模式下也调用真实API
  const generateImage = async () => {
    if (!userQuestion.trim()) {
      alert("请输入您想要解答的问题")
      return
    }

    // AI图片生成现在对所有用户免费开放

    setIsGenerating(true)
    setGeneratedImage(null)
    setGeneratedText(null)
    setNeedsPayment(false)

    try {
      // 创建提示词
      const prompt = `${hexagramName}卦：${hexagramDescription}。问题：${userQuestion}。${interpretation}`

      // 始终使用真实API端点，不管是否为测试模式
      const endpoint = "/api/ai/generate-image"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          useCustomApi: !!customApiKey,
          customApiKey,
        }),
      })

      // Check if response is OK and is JSON before parsing
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`生成图像失败: ${response.status} ${response.statusText}`, errorText);
        // Try to parse potential JSON error from backend even if status is not 2xx
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.needsPayment) {
            // AI图片生成现在对所有用户免费，不再显示充值弹窗
            console.log("AI图片生成免费开放，忽略needsPayment错误");
          }
          throw new Error(errorData.message || `生成图像失败: ${response.status}`);
        } catch (parseError) {
          // If parsing fails or it's not the expected structure, throw generic error
          throw new Error(`生成图像失败: ${response.status}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("收到了非JSON响应:", responseText);
        throw new Error("服务器返回了无效的响应格式");
      }

      const data = await response.json()

      if (data.success) {
        const imageUrl = data.imageUrl;
        setGeneratedImage(imageUrl)
        setRemainingCredits(data.remainingCredits)
        
        // 自动保存图像到Aiphoto文件夹
        saveImageToAiphoto(imageUrl, hexagramName, userQuestion); // Call the separate save function
        
        // 如果使用了每日免费次数，标记为已使用
        if (!dailyFreeUsed && !(isTestMode || (await fetch('/api/auth/session').then(r => r.json())).user?.isDeveloper)) {
          setDailyFreeUsed(true);
          localStorage.setItem('freeUsedToday', 'true');
        }
        
        setGeneratedText(
          `基于"${hexagramName}"卦象和您的问题"${userQuestion}"，AI解读如下：\n\n${interpretation}\n\n这幅图像展示了${hexagramName}的精神，象征着${
            hexagramName.includes("乾")
              ? "创造力和领导力"
              : hexagramName.includes("坤")
                ? "包容和顺从"
                : hexagramName.includes("震")
                  ? "行动和激发"
                  : hexagramName.includes("艮")
                    ? "稳定和停止"
                    : hexagramName.includes("离")
                      ? "光明和洞察"
                      : hexagramName.includes("坎")
                        ? "危险和机遇"
                        : hexagramName.includes("巽")
                          ? "柔顺和渗透"
                          : hexagramName.includes("兑")
                            ? "喜悦和满足"
                            : "变化与平衡"
          }。您的问题将在${Math.floor(Math.random() * 10) + 1}天内得到答案。`,
        )
      } else if (data.needsPayment) {
        // AI图片生成现在对所有用户免费，不再显示充值弹窗
        console.log("AI图片生成免费开放，忽略needsPayment");
      } else {
        alert(data.message || "生成图像失败，请稍后再试")
      }
    } catch (error) {
      console.error("生成图像失败", error)
      // Avoid setting needsPayment here unless specifically indicated by the error
      if (!(error instanceof Error && error.message.includes("需要支付"))) { // Basic check
         alert(`生成图像失败: ${error instanceof Error ? error.message : '请稍后再试'}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRechargeSuccess = () => {
    // 充值成功后刷新用户信息
    const fetchUpdatedCredits = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData?.user?.aiCreditsRemaining !== undefined) {
            setRemainingCredits(sessionData.user.aiCreditsRemaining + (dailyFreeUsed ? 0 : 1))
          }
        }
      } catch (error) {
        console.error('获取更新后的积分失败:', error)
      }
    }
    
    fetchUpdatedCredits()
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI解卦画像</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            剩余次数: {remainingCredits === "unlimited" ? "无限" : 
              `${remainingCredits}${!dailyFreeUsed && !isTestMode ? " (含今日免费1次)" : ""}`
            }
          </span>
          <Button variant="ghost" size="icon" onClick={() => setShowSettingsModal(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {remainingCredits !== "unlimited" && remainingCredits <= 0 ? (
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">AI绘图次数已用完</h3>
            <p className="text-sm text-amber-700 mb-4">
              {isTestMode || dailyFreeUsed ? 
                "您的AI绘图次数已用完，请充值获取更多次数" :
                "今日免费次数已用完，请充值获取更多次数"
              }
            </p>
            {/* AI图片生成现在对所有用户免费，移除充值和升级按钮 */}
            <div className="text-center text-sm text-green-600">
              AI图片生成现已免费开放给所有用户！
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">输入您想要解答的问题</label>
              <Textarea
                placeholder="例如：我的事业发展方向如何？"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">选择画像风格</label>
              <Tabs defaultValue="realistic" onValueChange={(value) => setSelectedStyle(value)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="realistic">写实风格</TabsTrigger>
                  <TabsTrigger value="chinese">国画风格</TabsTrigger>
                  <TabsTrigger value="modern">现代艺术</TabsTrigger>
                  <TabsTrigger value="fantasy">奇幻风格</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Button onClick={generateImage} disabled={isGenerating || !userQuestion.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : !apiConnected ? (
                "连接AI服务"
              ) : (
                "生成AI解卦画像"
              )}
            </Button>

            {generatedImage && (
              <div className="space-y-4 pt-4">
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt={`${hexagramName}卦象AI解读`}
                    className="w-full h-auto ai-generated-image"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm">
                  <h4 className="font-medium mb-2">AI解读</h4>
                  <p className="whitespace-pre-line">{generatedText}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowSaveModal(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    保存到相册
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowShareModal(true)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    分享
                  </Button>
                  <Button variant="outline" onClick={generateImage} disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <ShareModal open={showShareModal} onOpenChange={setShowShareModal} />
      <SaveModal open={showSaveModal} onOpenChange={setShowSaveModal} />
      <AIIntegrationSettings
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        onConnect={handleApiConnect}
      />
      {/* AI图片生成现在对所有用户免费，移除充值弹窗 */}
    </Card>
  )
}
