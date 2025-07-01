"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RechargeModal } from "@/components/recharge-modal"
import { Loader2, User, CreditCard, History, LogOut, Settings } from "lucide-react"

interface DivinationRecord {
  id: string
  type: string
  question: string
  result: string
  createdAt: string
}

interface UserData {
  id: string
  name: string
  email: string
  aiCredits: number
  membershipType: string
  membershipExpiry: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Profile')
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [history, setHistory] = useState<DivinationRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push(`/${locale}/login`)
      return
    }

    fetchUserData()
    fetchDivinationHistory()
  }, [session, status, router, locale])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDivinationHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await fetch('/api/divination/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch divination history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRechargeSuccess = () => {
    fetchUserData() // Refresh user data after successful recharge
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('error')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{userData.name}</CardTitle>
                  <CardDescription>{userData.email}</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('signOut')}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t('aiCredits')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {userData.aiCredits}
              </div>
              <Button 
                onClick={() => setShowRechargeModal(true)}
                className="w-full"
              >
                {t('recharge')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('membership')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={userData.membershipType === 'premium' ? 'default' : 'secondary'}>
                {t(`membershipType.${userData.membershipType}`)}
              </Badge>
              {userData.membershipExpiry && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('expiresOn')}: {new Date(userData.membershipExpiry).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Divination History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              {t('divinationHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.slice(0, 5).map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{t(`divinationType.${record.type}`)}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium mb-1">{record.question}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {record.result}
                    </p>
                  </div>
                ))}
                {history.length > 5 && (
                  <Button variant="outline" className="w-full">
                    {t('viewMore')}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('noHistory')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              {t('settings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => router.push(`/${locale}/settings/ai-settings`)}
              >
                {t('aiSettings')}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => router.push(`/${locale}/membership`)}
              >
                {t('membershipSettings')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={handleRechargeSuccess}
      />
    </div>
  )
}