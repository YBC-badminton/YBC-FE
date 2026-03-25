import React from 'react';
import Link from 'next/link';

import Sidebar from './components/Sidebar'; // 사이드바 컴포넌트 분리 추천

export default function AdminLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <div className="flex">
        {/* 고정 사이드바 */}
        <Sidebar />
        
        {/* 페이지 콘텐츠 영역 */}
        <main className="flex-1 bg-gray-50 p-8">
            {children}
        </main>
        </div>
    );
}