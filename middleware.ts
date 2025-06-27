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
  matcher: ['/', '/(en|zh-CN|zh-TW|ja|ko)/:path*']
};