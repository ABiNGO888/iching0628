"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, BookText, User, Compass } from "lucide-react"

export function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#f5eee1] border-t border-amber-200 py-2 z-50">
      <div className="flex justify-around">
        <Link href="/" className={cn("flex flex-col items-center", isActive("/") ? "text-amber-900" : "text-gray-500")}>
          <Compass className="h-6 w-6" />
          <span className="text-xs mt-1">筮</span>
        </Link>
        <Link
          href="/hexagrams"
          className={cn("flex flex-col items-center", isActive("/hexagrams") ? "text-amber-900" : "text-gray-500")}
        >
          <BookOpen className="h-6 w-6" />
          <span className="text-xs mt-1">经</span>
        </Link>
        <Link
          href="/classics"
          className={cn("flex flex-col items-center", isActive("/classics") ? "text-amber-900" : "text-gray-500")}
        >
          <BookText className="h-6 w-6" />
          <span className="text-xs mt-1">传</span>
        </Link>
        <Link
          href="/profile"
          className={cn("flex flex-col items-center", isActive("/profile") ? "text-amber-900" : "text-gray-500")}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">我</span>
        </Link>
      </div>
    </div>
  )
}
