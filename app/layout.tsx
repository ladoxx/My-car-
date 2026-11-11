import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '차량 연락 센터 | FMKAL VEHICLE CONTACT',
  description: 'FMKAL 기아 레이(Kia Ray) 차량 연락 센터입니다. 차량 이동 또는 문의사항이 있으시면 연락해 주세요.',
  applicationName: 'FMKAL Vehicle Contact',
  keywords: ['차량 연락처', '기아 레이', '주차 연락처', 'FMKAL', 'Kia Ray', 'Vehicle Contact'],
  authors: [{ name: 'FMKAL' }],
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: '차량 연락 센터 | FMKAL VEHICLE CONTACT',
    description: '차량 이동 또는 문의사항이 있으시면 아래 방법으로 연락해 주세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'FMKAL VEHICLE CONTACT',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#08090C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-[#08090C] text-gray-100 antialiased selection:bg-[#A3F542] selection:text-black">
        {children}
      </body>
    </html>
  );
}
