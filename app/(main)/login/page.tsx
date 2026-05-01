'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
    const { loginKakao, isLoading, error } = useAuth();

    const handleKakaoLogin = async () => {
        try {
            await loginKakao();
        } catch {
            // 에러는 AuthContext에서 처리
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-12">

                {/* 헤더 */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800">로그인</h1>
                    <p className="text-slate-400 font-bold">양배추 배드민턴 동아리에 오신 것을 환영합니다.</p>
                </div>

                {/* 로그인 카드 */}
                <div className="max-w-md mx-auto space-y-6">

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-[#F2F8E1] rounded-full flex items-center justify-center mx-auto border border-[#E2EBC8]">
                                <svg className="w-8 h-8 text-[#4B7332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-800">카카오 로그인</h2>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                카카오 계정으로 로그인해 주세요.<br />
                                회원 및 관리자 모두 카카오 로그인을 사용합니다.
                            </p>
                        </div>

                        <button
                            onClick={handleKakaoLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-4 rounded-2xl hover:brightness-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24-.14.52-.9 3.37-.93 3.58 0 0-.02.17.09.23.11.07.23.03.23.03.31-.04 3.56-2.33 4.12-2.73.7.1 1.42.15 2.13.15 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
                            </svg>
                            {isLoading ? '로그인 중...' : '카카오로 로그인'}
                        </button>

                        <p className="text-center text-xs text-slate-300 font-bold">
                            카카오톡에 등록된 정보로 자동 로그인됩니다
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
