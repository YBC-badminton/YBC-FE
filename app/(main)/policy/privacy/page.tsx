'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../../lib/axios';

interface PrivacyData {
    content: string;
    updatedAt: string;
}

export default function PrivacyPolicyPage() {
    const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPrivacy = async () => {
            try {
                // GET /privacy-policy 호출
                const response = await api.get('/privacy-policy');
                if (response.data) {
                    setPrivacyData(response.data);
                }
            } catch (error) {
                console.error('개인정보 처리방침 로드 실패', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrivacy();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="inline-block w-8 h-8 border-4 border-[#A1C852] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!privacyData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] font-sans">
                <p className="text-slate-500 font-bold">처리방침 데이터를 불러올 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none text-left">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* 헤더 안내 영역 */}
                <header className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800">개인정보 처리방침</h1>
                    <p className="text-sm font-bold text-slate-400">
                        시행일: {privacyData.updatedAt}
                    </p>
                </header>

                {/* 통 텍스트를 렌더링하는 100% 싱크로율의 단일 섹션 */}
                <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                    <div className="text-[15px] leading-7 text-slate-700 whitespace-pre-wrap break-keep font-medium">
                        {privacyData.content}
                    </div>
                </section>

            </div>
        </div>
    );
}