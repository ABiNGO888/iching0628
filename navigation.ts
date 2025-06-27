import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation"; // Reverted to next/navigation, removed duplicate Link import

export const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'] as const;
export const localePrefix = 'always'; // Default
export const pathnames = {
  "/": "/",
  "/login": "/login",
  "/membership": "/membership",
  "/settings": "/settings",
  // 可根据实际页面结构继续补充
} as const;

// Re-exporting Link from 'next/link' and others from 'next/navigation'
export { Link, redirect, usePathname, useRouter };