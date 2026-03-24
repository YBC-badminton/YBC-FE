// app/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';

import Header from '../../components/ui/Header'; // 헤더 컴포넌트 분리 추천
import FooterSection from '../../components/ui/FooterSection'; // 푸터 저작권 섹션 분리 추천

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header /> 
      <main className="min-h-screen">{children}</main>
      <FooterSection />
    </>
  );
}

