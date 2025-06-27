import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google'; // Assuming you use Inter font
import '../globals.css'; // Adjust path if necessary

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  
  return {
    title: t('title'),
    description: t('subtitle'),
    generator: 'v0.dev'
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  // Await params before using its properties
  const { locale } = await params;
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}