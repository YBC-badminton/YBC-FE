import "./globals.css";
import type { Metadata } from "next";
import { Agbalumo } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/ui/Toast";

// 히어로 디스플레이 서체 (Figma: "YBC badminton club")
const agbalumo = Agbalumo({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-agbalumo",
});

// export const metadata: Metadata = {
//   title: "YBC Badminton Club",
//   description: "양질의 배드민턴 추구 — YBC 배드민턴 클럽",
//   icons: { apple: "/images/apple-touch-icon.png" },
// };

export const metadata: Metadata = {
  title: {
    default: 'YBC 양배추 배드민턴 클럽 | 2030 대학생·청년 배드민턴 동아리',
    template: '%s | YBC 양배추 배드민턴',
  },
  description: '양질의 배드민턴을 추구하는 모임, 양배추(YBC) 배드민턴 클럽입니다. 마곡·망원 체육관 정기모임, 장비 후기, 신입 부원 모집 안내.',
  icons: { apple: "/images/apple-touch-icon.png" },
  keywords: [
    '양배추 배드민턴',
    '양배추',
    'YBC',
    'YBC 배드민턴',
    '배드민턴',
    '배드민턴 동아리',
    '배드민턴 모임',
    '서울 배드민턴',
    '마포구 배드민턴',
    '강서구 배드민턴',
    '망원나들목체육관',
    '마곡실내배드민턴장',
  ],
  verification: {
  google: 'CLxAFkSsFejlcwF1xpJJO-YIO674Ot2zrti-eD1oX_U',
  },
  authors: [{ name: 'YBC Badminton Club' }],
  creator: 'YBC Badminton Club',
  publisher: 'YBC Badminton Club',
  metadataBase: new URL('https://ybcbadminton.co.kr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YBC 양배추 배드민턴 클럽',
    description: '양질의 배드민턴을 추구하는 2030 청년 배드민턴 동아리 양배추입니다.',
    url: 'https://ybcbadminton.co.kr',
    siteName: 'YBC 배드민턴',
    images: [
      {
        url: '../public/images/logo.png', // 카카오톡/SNS 공유 시 노출될 대표 썸네일
        width: 1200,
        height: 630,
        alt: 'YBC 양배추 배드민턴 클럽',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={agbalumo.variable}>
      <body className="antialiased font-sans">
        {/* 여기에 (admin)이나 (main)의 레이아웃이 들어옵니다. */}
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
