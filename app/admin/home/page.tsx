'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import ImageUploader from '../../../components/admin/ImageUploader';
import { Save, Home, Image as ImageIcon, Hash } from 'lucide-react';

interface HomeContent {
    clubIntroduction: string;
    activityImageUrl: string;
    regularMeetingCount: number;
    memberCount: number;
}

export default function AdminHomePage() {
    const { showToast } = useToast();
    const [content, setContent] = useState<HomeContent>({
        clubIntroduction: '',
        activityImageUrl: '',
        regularMeetingCount: 0,
        memberCount: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // 1. 메인페이지 콘텐츠 조회 (GET /)
    useEffect(() => {
        const fetchHomeContent = async () => {
            try {
                const response = await api.get<HomeContent>('/');
                if (response.data) {
                    setContent({
                        clubIntroduction: response.data.clubIntroduction ?? '',
                        activityImageUrl: response.data.activityImageUrl ?? '',
                        regularMeetingCount: response.data.regularMeetingCount ?? 0,
                        memberCount: response.data.memberCount ?? 0,
                    });
                }
            } catch (error) {
                console.error('데이터 조회 실패', error);
                showToast('기존 데이터를 불러오지 못했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeContent();
    }, []);

    // 2. 변경 사항 저장 (PATCH /admin/content/home)
    const handleSave = async () => {
        if (!content.clubIntroduction.trim()) {
            showToast('동아리 소개 내용을 입력해 주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.patch<HomeContent>('/admin/content/home', {
                clubIntroduction: content.clubIntroduction,
                activityImageUrl: content.activityImageUrl,
                regularMeetingCount: content.regularMeetingCount,
                memberCount: content.memberCount,
            });
            if (response.data) {
                setContent({
                    clubIntroduction: response.data.clubIntroduction ?? '',
                    activityImageUrl: response.data.activityImageUrl ?? '',
                    regularMeetingCount: response.data.regularMeetingCount ?? 0,
                    memberCount: response.data.memberCount ?? 0,
                });
            }
            showToast('메인페이지 내용이 성공적으로 저장되었습니다.', 'success');
        } catch (error: unknown) {
            console.error('저장 실패', error);
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                '저장에 실패했습니다.';
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
        <div className="min-h-screen bg-[#F8F9FA] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans select-none text-left flex flex-col">
            <div className="max-w-[1440px] mx-auto w-full space-y-6">

                {/* 헤더 */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="inline-block bg-[#f7f9f5] text-[#A1C852] px-3 py-1.5 rounded-lg text-[12px] font-extrabold uppercase tracking-wider mb-2">
                            Home Admin System
                        </span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Home className="w-6 h-6 text-[#A1C852]" />
                            메인페이지 편집 및 관리
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#A1C852] hover:bg-[#8eb344] text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
                    >
                        <Save className="w-4.5 h-4.5" />
                        {isSaving ? '저장 중...' : '저장하여 최종 배포하기'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 동아리 소개 */}
                    <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                        <div className="border-b pb-3 border-slate-100">
                            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Home className="w-5 h-5 text-[#A1C852]" />
                                동아리 소개
                            </h2>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500">소개 문구</label>
                            <textarea
                                value={content.clubIntroduction}
                                onChange={(e) => setContent((c) => ({ ...c, clubIntroduction: e.target.value }))}
                                rows={12}
                                placeholder="동아리 소개 문구를 입력하세요."
                                className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition leading-relaxed resize-y min-h-[240px]"
                            />
                        </div>
                    </div>

                    {/* 사이드: 수치 + 대표 이미지 */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                            <div className="border-b pb-3 border-slate-100">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-[#A1C852]" />
                                    주요 수치
                                </h2>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500">정기 모임 횟수</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={content.regularMeetingCount}
                                    onChange={(e) => setContent((c) => ({ ...c, regularMeetingCount: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500">부원 수</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={content.memberCount}
                                    onChange={(e) => setContent((c) => ({ ...c, memberCount: Number(e.target.value) }))}
                                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                            <div className="border-b pb-3 border-slate-100">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-[#A1C852]" />
                                    대표 활동 이미지
                                </h2>
                            </div>
                            <ImageUploader
                                value={content.activityImageUrl}
                                onChange={(url) => setContent((c) => ({ ...c, activityImageUrl: url }))}
                                onError={(msg) => showToast(msg, 'error')}
                                heightClass="h-48"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
