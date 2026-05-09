'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';

function KakaoCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { handleKakaoCallback } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (!accessToken || !refreshToken) {
            setError('로그인 정보를 받지 못했습니다. 다시 시도해 주세요.');
            return;
        }

        handleKakaoCallback(accessToken, refreshToken)
            .then(() => {
                const stored = sessionStorage.getItem('postLoginRedirect');
                sessionStorage.removeItem('postLoginRedirect');
                const target = stored && stored.startsWith('/') ? stored : '/';
                router.replace(target);
            })
            .catch(() => {
                setError('로그인 처리 중 오류가 발생했습니다.');
            });
    }, [searchParams, handleKakaoCallback, router]);

    if (error) {
        return (
            <div className="max-w-sm w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="text-sm text-red-500 font-bold">{error}</p>
                <button
                    onClick={() => router.replace('/login')}
                    className="bg-[#4B7332] text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#3d5d28] transition-all"
                >
                    로그인 페이지로
                </button>
            </div>
        );
    }

    return (
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#4B7332] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 font-bold text-sm">카카오 로그인 처리 중...</p>
        </div>
    );
}

export default function KakaoCallbackPage() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6 font-sans">
            <Suspense fallback={
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#4B7332] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 font-bold text-sm">로딩 중...</p>
                </div>
            }>
                <KakaoCallbackContent />
            </Suspense>
        </div>
    );
}
