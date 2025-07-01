"use client"

import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowLeft } from "lucide-react"

export default function MembershipPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('Membership')

  const handleGoBack = () => {
    router.back()
  }

  const handlePurchase = (planType: string) => {
    // Handle purchase logic here
    router.push(`/${locale}/membership/subscribe?plan=${planType}`)
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('basic.title')}</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">{t('basic.price')}</span>
            </div>
            <CardDescription className="text-center">{t('basic.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">50</div>
              <div className="text-sm text-muted-foreground">{t('basic.credits')}</div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">{t('basic.feature1')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">{t('basic.feature2')}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={() => handlePurchase('basic')}
            >
              {t('basic.buyNow')}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center">{t('premium.title')}</CardTitle>
            <div className="text-center">
              <span className="text-3xl font-bold">{t('premium.price')}</span>
            </div>
            <CardDescription className="text-center">{t('premium.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">150</div>
              <div className="text-sm text-muted-foreground">{t('premium.credits')}</div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">{t('premium.feature1')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm font-medium">{t('premium.feature2')}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => handlePurchase('premium')}
            >
              {t('premium.buyNow')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}