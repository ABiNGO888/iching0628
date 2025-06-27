import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SessionProvider } from "@/components/session-provider"
import "@/app/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Metadata is now handled in the locale-specific layout
// to support internationalization

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-[#f5eee1] font-sans antialiased pb-16", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SessionProvider>
            {children}
            <BottomNavigation />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}