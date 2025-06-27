"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HexagramDisplay } from "@/components/hexagram-display"
import { Badge } from "@/components/ui/badge"
import { RechargeModal } from "@/components/recharge-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [userType] = useState("free") // "free" or "vip"
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [remainingCredits, setRemainingCredits] = useState<number | "unlimited">(0)
  const [dailyFreeUsed, setDailyFreeUsed] = useState(false)
  const [rechargeHistory, setRechargeHistory] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showInterpretationModal, setShowInterpretationModal] = useState(false)
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"
  const isDeveloper = process.env.NODE_ENV === "development"

  // 检查AI次数状态的函数
  const checkAICreditsStatus = () => {
    // 如果session中有AI积分数据，使用session数据
    if (session?.user?.aiCreditsRemaining !== undefined) {
      // 所有用户都显示实际积分数量
      setRemainingCredits(session.user.aiCreditsRemaining)
      return
    }
    
    // 默认为0个积分（用于测试）
    setRemainingCredits(0)
  }

  // 刷新用户积分数据
  const refreshUserCredits = async () => {
    try {
      const userResponse = await fetch('/api/user/profile')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.user) {
          setRemainingCredits(userData.user.aiCreditsRemaining)
          // 触发全局积分更新事件
          window.dispatchEvent(new Event('aiCreditsUpdated'))
        }
      }
    } catch (error) {
      console.error('刷新积分数据失败:', error)
    }
  }

  // 开发者清零积分函数
  const handleClearCredits = async () => {
    try {
      const response = await fetch('/api/user/clear-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // 立即刷新积分数据
        await refreshUserCredits()
        alert('积分已清零')
      } else {
        alert('清零失败')
      }
    } catch (error) {
      console.error('清零积分失败:', error)
      alert('清零失败')
    }
  }

  // 获取用户AI积分和充值记录
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 获取最新的用户数据
        const userResponse = await fetch('/api/user/profile')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.user) {
            // 更新AI积分显示
            // 所有用户都显示实际积分数量
            setRemainingCredits(userData.user.aiCreditsRemaining)
          }
        } else {
          // 如果API失败，使用session数据
          checkAICreditsStatus()
        }
        
        // 获取充值记录
        const paymentResponse = await fetch('/api/payment/history')
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          setRechargeHistory(paymentData.payments || [])
        }
      } catch (error) {
        console.error('获取用户数据失败:', error)
        // 出错时使用session数据
        checkAICreditsStatus()
      }
    }
    
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  // 监听localStorage变化和AI积分变化，实时更新AI次数显示
  useEffect(() => {
    const handleStorageChange = () => {
      // 只使用session数据，避免重复API调用
      checkAICreditsStatus()
    }

    const handleAICreditsUpdate = async () => {
      // 重新获取最新的用户数据
      try {
        const userResponse = await fetch('/api/user/profile')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.user) {
            if (userData.user.subscriptionStatus === 'premium') {
              setRemainingCredits('unlimited')
            } else {
              setRemainingCredits(userData.user.aiCreditsRemaining)
            }
          }
        }
      } catch (error) {
        console.error('更新AI积分失败:', error)
      }
    }

    // 监听AI积分更新事件（只在AI解读完成后触发）
    window.addEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    
    // 监听自定义事件（同一页面内的变化），使用session数据避免重复API调用
    window.addEventListener('aiCreditsChanged', handleStorageChange)

    return () => {
      window.removeEventListener('aiCreditsChanged', handleStorageChange)
      window.removeEventListener('aiCreditsUpdated', handleAICreditsUpdate)
    }
  }, [session])

  // 卦象历史记录
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // 获取卦象历史记录
  const fetchDivinationHistory = async () => {
    if (!session?.user) return
    
    setHistoryLoading(true)
    try {
      const response = await fetch('/api/divination/history?page=1&limit=3')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.histories || [])
      }
    } catch (error) {
      console.error('获取卦象历史失败:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  // 在组件加载时获取历史记录
  useEffect(() => {
    if (session?.user) {
      fetchDivinationHistory()
    }
  }, [session])

  // 充值成功处理
  const handleRechargeSuccess = async () => {
    // 立即刷新积分数据
    await refreshUserCredits()
    
    // 重新获取充值记录
    try {
      const paymentResponse = await fetch('/api/payment/history')
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        setRechargeHistory(paymentData.payments || [])
      }
    } catch (error) {
      console.error('获取更新后的数据失败:', error)
    }
  }

  if (status === "loading") {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">加载中...</h1>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="mb-6 text-muted-foreground">登录后可查看个人资料和卦象历史记录</p>
          <Link href="/login">
            <Button>登录</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mr-2">
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
        <h1 className="text-3xl font-bold flex-1 pr-16">个人中心</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-medium">{session.user?.name || '用户'}</p>
                    <p className="text-sm text-muted-foreground">{session.user?.email || session.user?.phone || '未设置'}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  登出
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium">会员状态</p>
                <div className="flex items-center mt-1">
                  {userType === "vip" ? (
                    <Badge className="bg-amber-500">VIP会员</Badge>
                  ) : (
                    <Badge variant="outline">免费用户</Badge>
                  )}
                  {userType === "vip" && (
                    <span className="text-xs ml-2 text-muted-foreground">有效期至: 2023-12-31</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">AI积分</p>
                  {isDeveloper && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearCredits}
                      className="text-xs px-2 py-1 h-6"
                    >
                      清零
                    </Button>
                  )}
                </div>
                <div className="text-center p-4 bg-muted rounded-md mt-1">
                  <p className="text-3xl font-bold">{userType === "vip" ? "无限" : remainingCredits}</p>
                  <p className="text-xs text-muted-foreground">剩余次数</p>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  每日登入赠送一次AI解卦
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setShowRechargeModal(true)}>
                充值AI次数
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>卦象历史</CardTitle>
              <CardDescription>
                您的历史卦象记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <p>加载中...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <p>暂无卦象记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => {
                    const formatDate = (dateString) => {
                      return new Date(dateString).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                    
                    const typeMap = {
                      'coin': '金钱卦',
                      'number': '数字卦'
                    }
                    
                    return (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">卦象记录</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(record.createdAt)} · {typeMap[record.type] || record.type}
                            </p>
                            {record.question && (
                              <p className="text-sm text-blue-600 mt-1">
                                问题：{record.question}
                              </p>
                            )}
                          </div>
                          {record.interpretation && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record)
                                setShowInterpretationModal(true)
                              }}
                            >
                              更多
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center space-x-8">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-2">本卦</span>
                            <HexagramDisplay
                              lines={record.hexagram}
                              changingLines={record.changingLines}
                              className="scale-75"
                            />
                            {record.hexagramName && (
                              <div className="text-xs text-gray-600 mt-1">{record.hexagramName}</div>
                            )}
                          </div>

                          {record.resultHexagram && (
                            <>
                              <div className="text-muted-foreground">→</div>
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-muted-foreground mb-2">变卦</span>
                                <HexagramDisplay lines={record.resultHexagram} className="scale-75" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                查看更多历史记录
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* 充值记录 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">充值记录</h2>
          {rechargeHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无充值记录</p>
          ) : (
            <div className="space-y-3">
              {rechargeHistory.slice(0, 5).map((record: any, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{record.packageName || `充值 ${record.credits} 积分`}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{record.credits} 积分</p>
                    <p className="text-sm text-gray-500">¥{record.amount}</p>
                  </div>
                </div>
              ))}
              {rechargeHistory.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    查看更多记录
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 充值模态框 */}
      <RechargeModal 
        open={showRechargeModal}
        onOpenChange={setShowRechargeModal}
        onSuccess={handleRechargeSuccess}
      />
      
      {/* AI解卦内容弹窗 */}
      <Dialog open={showInterpretationModal} onOpenChange={setShowInterpretationModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI解卦内容</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedRecord.hexagramName || '卦象'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedRecord.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {selectedRecord.question && (
                    <p className="text-sm text-blue-600 mt-1">
                      问题：{selectedRecord.question}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-8">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-2">本卦</span>
                  <HexagramDisplay
                    lines={selectedRecord.hexagram}
                    changingLines={selectedRecord.changingLines}
                    className="scale-100"
                  />
                  {selectedRecord.hexagramName && (
                    <div className="text-sm text-gray-600 mt-2">{selectedRecord.hexagramName}</div>
                  )}
                </div>

                {selectedRecord.resultHexagram && (
                  <>
                    <div className="text-muted-foreground text-xl">→</div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-muted-foreground mb-2">变卦</span>
                      <HexagramDisplay lines={selectedRecord.resultHexagram} className="scale-100" />
                    </div>
                  </>
                )}
              </div>
              
              {selectedRecord.interpretation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">AI解卦：</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRecord.interpretation}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
