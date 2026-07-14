'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import { Save, FileText, CheckCircle, RefreshCw } from 'lucide-react';

interface PrivacyData {
    content: string;
    updatedAt: string;
}

export default function AdminPrivacyPage() {
    const { showToast } = useToast();
    const [content, setContent] = useState<string>('');
    const [updatedAt, setUpdatedAt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // 1. 개인정보 처리방침 내용 조회 (GET /privacy-policy)
    useEffect(() => {
        const fetchPrivacyData = async () => {
            try {
                const response = await api.get('/privacy-policy');
                if (response.data) {
                    setContent(response.data.content || '');
                    setUpdatedAt(response.data.updatedAt || '');
                }
            } catch (error) {
                console.error('데이터 조회 실패', error);
                showToast('기존 데이터를 불러오지 못했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrivacyData();
    }, []);

    // 2. 변경 사항 서버 반영 (PUT /admin/content/privacy-policy)
    const handleSave = async () => {
        if (!content.trim()) {
            showToast('내용을 입력해 주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // 명세서 상 Request Body 구조: { "content": "..." }
            const response = await api.put('/admin/content/privacy-policy', { content });
            
            if (response.data) {
                // 성공적으로 반환되면 변경된 날짜와 텍스트 상태 업데이트
                setContent(response.data.content);
                setUpdatedAt(response.data.updatedAt);
                showToast('개인정보 처리방침이 저장되었습니다.', 'success');
            }
        } catch (error: any) {
            console.error('저장 실패', error);
            const message = error?.response?.data?.message || '업데이트에 실패했습니다.';
            showToast(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="inline-block w-8 h-8 border-4 border-[#A1C852] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none text-left">
            <div className="max-w-[1440px] mx-auto space-y-6">
                
                {/* 관리자 대시보드 헤더 */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="inline-block bg-[#f7f9f5] text-[#A1C852] px-3 py-1.5 rounded-lg text-[12px] font-extrabold uppercase tracking-wider mb-2">
                            Policy Admin System
                        </span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            개인정보 처리방침 편집 및 관리
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#A1C852] hover:bg-[#8eb344] text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 active:scale-95"
                    >
                        <Save className="w-4.5 h-4.5" />
                        {isSaving ? '저장 중...' : '저장하여 최종 배포하기'}
                    </button>
                </div>

                {/* 2컬럼 레이아웃 (좌: 통편집 텍스트 영역, 우: 프론트 UI 100% 동일 미리보기) */}
                <div className="grid grid-cols-1 gap-8">
                    
                    {/* 왼쪽 컬럼: 편집 에디터 카드 */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                        <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#A1C852]" />
                                처리방침 내용 작성
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">
                                줄바꿈 및 간격을 자유롭게 작성하세요
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                <div className="text-[12px] text-slate-400 font-bold">마지막 반영일</div>
                                <div className="text-[14px] text-slate-700 font-bold">{updatedAt || '데이터 없음 (저장 시 자동 갱신)'}</div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500">방침 전체 본문 내용</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={25}
                                    placeholder="개인정보 처리방침 내용을 입력하세요."
                                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition leading-relaxed resize-y min-h-[500px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}