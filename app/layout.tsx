// app/layout.tsx
'use client';

import './globals.css'; // 이 줄이 반드시 있어야 합니다!
import React from 'react';
import Link from 'next/link';

import Header from '../components/ui/Header'; // 헤더 컴포넌트 분리 추천
import FooterSection from '../components/ui/FooterSection'; // 푸터 저작권 섹션 분리 추천

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans select-none">
        <Header /> {/* 상단 고정 헤더 */}
        <main>{children}</main> {/* 여기에 각 페이지 내용이 들어옵니다 */}
        <FooterSection /> {/* 하단 저작권 섹션 */}
      </body>
    </html>
  );
}

