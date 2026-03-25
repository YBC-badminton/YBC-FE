'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
    return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        {/* 시안 이미지(image_6.png)와 동일한 레이아웃 구성을 위한 flex 컨테이너 */}
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-12 py-5">
        
        {/* [좌측] YBC 로고 섹션 (이미지로 배치) */}
                <Link href="/public/images/logo.png" className="flex items-center">
                    {/* 실제 프로젝트에 로고 이미지가 있다면 src 경로를 수정해주세요. */}
                    {/* Next/Image 또는 일반 img 태그 사용 가능 */}
                    <img 
                        src="/images/logo.png" // 실제 로고 이미지 경로로 수정 필요
                        alt="YBC BADMINTON CLUB Logo"
                        className="h-12 w-auto object-contain" // 시안 이미지 비율에 맞춘 크기 조절
                    />
                </Link>
                {/* [우측] 메뉴 및 로그인 섹션 */}
                <div className="flex items-center gap-10">
                    <nav>
                        <ul className="flex items-center gap-10 text-[15px] font-medium text-slate-700 tracking-tight">
                            <li><Link href="/activities" className="hover:text-green-700 transition">정기 모임</Link></li>
                            <li><Link href="/reviews" className="hover:text-green-700 transition">장비 후기</Link></li>
                            <li><Link href="/past-activities" className="hover:text-green-700 transition">지난 활동</Link></li>
                            <li><Link href="/inquiry" className="hover:text-green-700 transition">문의하기</Link></li>
                            <li><Link href="/apply" className="hover:text-green-700 transition">지원하기</Link></li>
                        </ul>
                    </nav>
                    <Link 
                        href="/login" 
                        className="px-6 py-2 border-2 border-slate-300 rounded-full text-[15px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                        로그인
                    </Link>
                </div>
            </div>
        </header>
    );
}
