import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    // Fallback to Simplified Chinese for unsupported languages
    locale = 'zh-CN'; // Set Simplified Chinese as default for unsupported locales
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});