'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import ImageUploader from '../../../components/admin/ImageUploader';
import { Save, Sparkles, Users, CalendarDays, PartyPopper, Plus, Trash2, ImagePlus } from 'lucide-react';

interface RegularMeeting {
    description: string;
    imageUrls: string[];
}

interface ActivityEvent {
    title: string;
    description: string;
    imageUrl: string;
}

interface AfterParties {
    description: string[];
    imageUrl: string;
}

interface ActivitiesContent {
    mainTitle: string;
    subDescription: string;
    regularMeeting: RegularMeeting;
    events: ActivityEvent[];
    afterParties: AfterParties;
}

const EMPTY: ActivitiesContent = {
    mainTitle: '',
    subDescription: '',
    regularMeeting: { description: '', imageUrls: [] },
    events: [],
    afterParties: { description: [], imageUrl: '' },
};

const inputClass =
    'w-full px-4 py-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition';

export default function AdminActivitiesPage() {
    const { showToast } = useToast();
    const [content, setContent] = useState<ActivitiesContent>(EMPTY);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // 1. 지난 활동 콘텐츠 조회 (GET /activities)
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.get<ActivitiesContent>('/activities');
                const d = response.data;
                if (d) {
                    setContent({
                        mainTitle: d.mainTitle ?? '',
                        subDescription: d.subDescription ?? '',
                        regularMeeting: {
                            description: d.regularMeeting?.description ?? '',
                            imageUrls: d.regularMeeting?.imageUrls ?? [],
                        },
                        events: (d.events ?? []).map((e) => ({
                            title: e.title ?? '',
                            description: e.description ?? '',
                            imageUrl: e.imageUrl ?? '',
                        })),
                        afterParties: {
                            description: d.afterParties?.description ?? [],
                            imageUrl: d.afterParties?.imageUrl ?? '',
                        },
                    });
                }
            } catch (error) {
                console.error('데이터 조회 실패', error);
                showToast('기존 데이터를 불러오지 못했습니다.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivities();
    }, []);

    // 2. 변경 사항 저장 (PATCH /admin/content/activities)
    const handleSave = async () => {
        if (!content.mainTitle.trim()) {
            showToast('메인 타이틀을 입력해 주세요.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            // 비어 있는(삭제 후 미교체) 정기모임 이미지 슬롯은 전송에서 제외합니다.
            const payload: ActivitiesContent = {
                ...content,
                regularMeeting: {
                    ...content.regularMeeting,
                    imageUrls: content.regularMeeting.imageUrls.filter(Boolean),
                },
            };
            const response = await api.patch<ActivitiesContent>('/admin/content/activities', payload);
            const d = response.data;
            if (d) {
                setContent({
                    mainTitle: d.mainTitle ?? '',
                    subDescription: d.subDescription ?? '',
                    regularMeeting: {
                        description: d.regularMeeting?.description ?? '',
                        imageUrls: d.regularMeeting?.imageUrls ?? [],
                    },
                    events: (d.events ?? []).map((e) => ({
                        title: e.title ?? '',
                        description: e.description ?? '',
                        imageUrl: e.imageUrl ?? '',
                    })),
                    afterParties: {
                        description: d.afterParties?.description ?? [],
                        imageUrl: d.afterParties?.imageUrl ?? '',
                    },
                });
            }
            showToast('지난 활동 내용이 성공적으로 저장되었습니다.', 'success');
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

    const onError = (msg: string) => showToast(msg, 'error');

    // --- 정기 모임 이미지 갤러리 (개수 고정) ---
    // 이미지 개수는 기존 개수로 고정됩니다. 삭제 시 슬롯은 유지되고(빈 슬롯),
    // 같은 슬롯에 새 이미지를 업로드해 교체합니다. 슬롯을 추가/제거하지 않습니다.
    const updateMeetingImage = (index: number, url: string) => {
        setContent((c) => {
            const imageUrls = [...c.regularMeeting.imageUrls];
            imageUrls[index] = url; // '' 이면 빈 슬롯으로 유지
            return { ...c, regularMeeting: { ...c.regularMeeting, imageUrls } };
        });
    };

    // --- 이벤트 ---
    const updateEvent = (index: number, patch: Partial<ActivityEvent>) => {
        setContent((c) => {
            const events = [...c.events];
            events[index] = { ...events[index], ...patch };
            return { ...c, events };
        });
    };
    const addEvent = () => {
        setContent((c) => ({ ...c, events: [...c.events, { title: '', description: '', imageUrl: '' }] }));
    };
    const removeEvent = (index: number) => {
        setContent((c) => ({ ...c, events: c.events.filter((_, i) => i !== index) }));
    };

    // --- 뒤풀이 설명 (문자열 배열) ---
    const updateAfterPartyLine = (index: number, value: string) => {
        setContent((c) => {
            const description = [...c.afterParties.description];
            description[index] = value;
            return { ...c, afterParties: { ...c.afterParties, description } };
        });
    };
    const addAfterPartyLine = () => {
        setContent((c) => ({ ...c, afterParties: { ...c.afterParties, description: [...c.afterParties.description, ''] } }));
    };
    const removeAfterPartyLine = (index: number) => {
        setContent((c) => ({
            ...c,
            afterParties: { ...c.afterParties, description: c.afterParties.description.filter((_, i) => i !== index) },
        }));
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
                            Activities Admin System
                        </span>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-[#A1C852]" />
                            지난 활동 편집 및 관리
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

                {/* 상단 소개 */}
                <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-slate-100">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#A1C852]" />
                            상단 소개
                        </h2>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500">메인 타이틀</label>
                        <input
                            type="text"
                            value={content.mainTitle}
                            onChange={(e) => setContent((c) => ({ ...c, mainTitle: e.target.value }))}
                            placeholder="메인 타이틀을 입력하세요."
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500">서브 설명</label>
                        <textarea
                            value={content.subDescription}
                            onChange={(e) => setContent((c) => ({ ...c, subDescription: e.target.value }))}
                            rows={3}
                            placeholder="서브 설명을 입력하세요."
                            className={`${inputClass} resize-y`}
                        />
                    </div>
                </div>

                {/* 정기 모임 */}
                <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-slate-100">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#A1C852]" />
                            정기 모임
                        </h2>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500">설명</label>
                        <textarea
                            value={content.regularMeeting.description}
                            onChange={(e) =>
                                setContent((c) => ({ ...c, regularMeeting: { ...c.regularMeeting, description: e.target.value } }))
                            }
                            rows={3}
                            placeholder="정기 모임 설명을 입력하세요."
                            className={`${inputClass} resize-y`}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-500">이미지 ({content.regularMeeting.imageUrls.length}장 고정)</label>
                            <span className="text-[11px] font-medium text-slate-400">변경하려면 삭제 후 새 이미지를 업로드하세요</span>
                        </div>
                        {content.regularMeeting.imageUrls.length === 0 ? (
                            <p className="text-sm text-slate-400 font-medium py-6 text-center border border-dashed border-gray-200 rounded-xl">
                                등록된 이미지가 없습니다.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {content.regularMeeting.imageUrls.map((url, i) => (
                                    <ImageUploader
                                        key={i}
                                        value={url}
                                        onChange={(newUrl) => updateMeetingImage(i, newUrl)}
                                        onError={onError}
                                        heightClass="h-32"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 이벤트 */}
                <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-[#A1C852]" />
                            이벤트 ({content.events.length})
                        </h2>
                        <button
                            type="button"
                            onClick={addEvent}
                            className="flex items-center gap-1 text-[#A1C852] hover:text-[#8eb344] text-sm font-bold transition"
                        >
                            <Plus className="w-4 h-4" /> 이벤트 추가
                        </button>
                    </div>

                    {content.events.length === 0 && (
                        <p className="text-sm text-slate-400 font-medium py-6 text-center">등록된 이벤트가 없습니다. 우측 상단에서 추가하세요.</p>
                    )}

                    <div className="space-y-4">
                        {content.events.map((ev, i) => (
                            <div key={i} className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-56 shrink-0">
                                    <ImageUploader
                                        value={ev.imageUrl}
                                        onChange={(url) => updateEvent(i, { imageUrl: url })}
                                        onError={onError}
                                        heightClass="h-36"
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="inline-flex items-center justify-center bg-[#A1C852] text-white text-xs font-black w-6 h-6 rounded-lg shrink-0">
                                            {i + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeEvent(i)}
                                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"
                                            aria-label="이벤트 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={ev.title}
                                        onChange={(e) => updateEvent(i, { title: e.target.value })}
                                        placeholder="이벤트 제목"
                                        className={`${inputClass} font-bold`}
                                    />
                                    <textarea
                                        value={ev.description}
                                        onChange={(e) => updateEvent(i, { description: e.target.value })}
                                        rows={3}
                                        placeholder="이벤트 설명"
                                        className={`${inputClass} resize-y`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 뒤풀이 */}
                <div className="bg-white rounded-[24px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="border-b pb-3 border-slate-100">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <PartyPopper className="w-5 h-5 text-[#A1C852]" />
                            뒤풀이
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-500">설명 (줄 단위)</label>
                                <button
                                    type="button"
                                    onClick={addAfterPartyLine}
                                    className="flex items-center gap-1 text-[#A1C852] hover:text-[#8eb344] text-xs font-bold transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> 줄 추가
                                </button>
                            </div>
                            {content.afterParties.description.length === 0 && (
                                <p className="text-sm text-slate-400 font-medium py-4 text-center border border-dashed border-gray-200 rounded-xl">
                                    설명 줄을 추가하세요.
                                </p>
                            )}
                            <div className="space-y-2">
                                {content.afterParties.description.map((line, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={line}
                                            onChange={(e) => updateAfterPartyLine(i, e.target.value)}
                                            placeholder={`설명 ${i + 1}`}
                                            className={inputClass}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAfterPartyLine(i)}
                                            className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition shrink-0"
                                            aria-label="설명 줄 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <ImagePlus className="w-4 h-4 text-[#A1C852]" /> 뒤풀이 이미지
                            </label>
                            <ImageUploader
                                value={content.afterParties.imageUrl}
                                onChange={(url) => setContent((c) => ({ ...c, afterParties: { ...c.afterParties, imageUrl: url } }))}
                                onError={onError}
                                heightClass="h-40"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
