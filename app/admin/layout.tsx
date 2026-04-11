'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';

export default function AdminLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    // TODO: 개발 완료 후 아래 주석 해제하여 인증 보호 활성화
    // useEffect(() => {
    //     if (user === null && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    //         router.replace('/login?redirect=/admin');
    //     }
    // }, [user, router]);

    return (
        <div className="flex min-h-screen bg-gray-50">
        {/* 1. 사이드바 (isOpen, onClose 전달) */}
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* 2. 메인 콘텐츠 영역 */}
        <main className="flex-1 flex flex-col w-full">
            
            {/* 모바일 상단 바 - lg(데스크탑) 이상에서는 숨김 */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-[40]">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-600"
            >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
            <span className="font-bold text-gray-800">관리자 페이지</span>
            <div className="w-10"></div>
            </header>

            <div className="p-2">
            {children}
            </div>
        </main>
        </div>
    );
}