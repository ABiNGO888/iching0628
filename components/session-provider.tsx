"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children, ...props }: React.PropsWithChildren<any>) {
  return <NextAuthSessionProvider {...props}>{children}</NextAuthSessionProvider>
}