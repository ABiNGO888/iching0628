import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'],
 
  // Used when no locale matches
  defaultLocale: 'zh-CN',
  
  // Enable automatic locale detection based on browser language
  localeDetection: true
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(zh-CN|zh-TW|en|ja|ko)/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
  missing: [
    { type: 'header', key: 'x-missing', value: 'true' }
  ]
};