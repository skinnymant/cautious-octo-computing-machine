import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AiChatWidget } from '@/components/ai-chat-widget';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TechMart — Thiết bị & Dụng cụ công nghiệp chính hãng',
    template: '%s | TechMart',
  },
  description:
    'TechMart — nhà phân phối thiết bị, dụng cụ công nghiệp chính hãng: máy hàn, máy khoan, máy cắt, máy mài, thang nhôm. Giá tốt, báo giá B2B nhanh, giao toàn quốc.',
  keywords: ['máy khoan', 'máy hàn', 'dụng cụ công nghiệp', 'Makita', 'Bosch', 'báo giá B2B'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'TechMart',
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: siteUrl },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TechMart',
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-1900-1234',
    contactType: 'customer service',
    areaServed: 'VN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <AiChatWidget />
      </body>
    </html>
  );
}
