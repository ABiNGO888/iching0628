'use client';

// import Link from "next/link" // Use Link from navigation.ts instead
import { useState } from "react" // Import useState
import { useTranslations } from 'next-intl'; // Import useTranslations
import { useRouter, usePathname } from 'next/navigation'; // Import navigation utilities
import { Link } from '@/navigation'; // Keep Link from @/navigation as it might be styled or have other props
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover components

export default function Home() {
  const t = useTranslations('HomePage'); // Initialize translation hook
  const router = useRouter();
  const pathname = usePathname();

  // Get current locale from pathname or default
  const currentLocale = pathname.split('/')[1] || 'zh-CN'; // Extract locale from path

  // Map locale codes to display names using translations
  const localeDisplayNames: { [key: string]: string } = {
    'zh-CN': t('langSimplified'),
    'zh-TW': t('langTraditional'),
    'en': t('langEnglish'),
    'ja': t('langJapanese'),
    'ko': t('langKorean'),
  };

  const [currentLanguageDisplay, setCurrentLanguageDisplay] = useState(localeDisplayNames[currentLocale] || t('langSimplified'));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false) // Add state for popover visibility

  const handleLanguageChange = (locale: string) => {
    setCurrentLanguageDisplay(localeDisplayNames[locale]);
    setIsPopoverOpen(false) // Close popover after selection
    // Navigate to the new locale by replacing the current locale in the path
    const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/';
    const newPath = `/${locale}${pathWithoutLocale}`;
    // Use window.location.href for a full page reload to ensure proper locale switching
    window.location.href = newPath;
  }

  return (
    <div className="w-screen h-screen flex items-start justify-center bg-[#f5eee1] pt-16">
      {/* 9:16 Container */}
      <div className="relative flex flex-col items-center justify-between" style={{ aspectRatio: '9/16', width: 'min(100vw,56.25vh)', height: 'min(177.78vw,100vh)', background: '#f5eee1', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* Main content area - Adjusted padding and removed justify-start to allow space for footer */}
        <div className="flex flex-col items-center w-full h-full px-4 pt-8 pb-4 overflow-y-auto"> {/* Reduced pb slightly */}

          {/* Top Section: Title, Subtitle */}
          <div className="w-full flex flex-col items-center mb-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>

          {/* Middle Section: Divination Options Card */}
          <Card className="w-full max-w-sm bg-white/90 backdrop-blur-sm shadow-md rounded-lg mb-6"> {/* Added mb-6 */}
            <div className="pt-5 pb-1 flex justify-center">
              <Image src="/SLM-2.png" alt="算了吧 乌龟 LOGO" width={125} height={125} priority />
            </div>
            <CardHeader className="text-center pt-2 pb-4">
              <CardTitle className="text-xl font-semibold">{t('selectMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/divination/coin" className="w-full">
                  <Button variant="outline" className="w-full h-24 flex flex-col justify-center items-center border-gray-300 hover:bg-amber-50">
                    <span className="text-lg font-medium">{t('coinMethod')}</span>
                    <span className="text-xs text-muted-foreground mt-1">{t('coinDesc')}</span>
                  </Button>
                </Link>
                <Link href="/divination/number" className="w-full">
                  <Button variant="outline" className="w-full h-24 flex flex-col justify-center items-center border-gray-300 hover:bg-amber-50">
                    <span className="text-lg font-medium">{t('numberMethod')}</span>
                    <span className="text-xs text-muted-foreground mt-1">{t('numberDesc')}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>

          </Card>

          {/* Language Switch Button with Popover */}
          <div className="mb-4"> {/* Removed mt-6 */} 
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">{currentLanguageDisplay}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 rounded-none"
                    onClick={() => handleLanguageChange('zh-CN')}
                  >
                    {t('langSimplified')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 rounded-none"
                    onClick={() => handleLanguageChange('zh-TW')}
                  >
                    {t('langTraditional')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 rounded-none"
                    onClick={() => handleLanguageChange('en')}
                  >
                    {t('langEnglish')}
                  </Button>
                   <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 rounded-none"
                    onClick={() => handleLanguageChange('ja')}
                  >
                    {t('langJapanese')}
                  </Button>
                   <Button
                    variant="ghost"
                    className="justify-start px-4 py-2 rounded-none"
                    onClick={() => handleLanguageChange('ko')}
                  >
                    {t('langKorean')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

        </div>

        {/* Copyright Info - Positioned at the absolute bottom */}
        <div className="absolute bottom-4 left-0 right-0 w-full text-center text-[10px] text-gray-400 space-y-0 px-4">
          <p>{t('copyrightOwner')}</p>
          <p>{t('contactEmail')}</p>
        </div>

      </div>
    </div>
  )
}