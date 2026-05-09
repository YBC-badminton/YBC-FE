'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-6 p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">로그인이 필요합니다</h3>
                    <p className="text-sm text-slate-400 font-medium">이 기능을 사용하려면 로그인해 주세요.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 text-slate-500 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm"
                    >
                        닫기
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="flex-1 py-3 bg-[#4B7332] text-white font-bold rounded-2xl hover:bg-[#3d5d28] transition-all shadow-md text-sm"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
}
