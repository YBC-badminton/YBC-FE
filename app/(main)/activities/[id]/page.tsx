'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../lib/axios';

// API 응답 타입
interface VoteDetail {
    voteId: number;
    name: string;
    type: 'REGULAR' | 'LIGHTNING';
    activityDate: string;
    activityTime: string;
    location: string;
    memo: string;
    voteStartAt: string;
    voteEndAt: string;
    capacity: number;
    currentParticipantCount: number;
}

const TYPE_LABEL: Record<string, string> = {
    'REGULAR': '정기모임',
    'LIGHTNING': '번개모임',
};

// "2026-04-10" → "2026.04.10 (목)"
function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

// "2026-04-10T23:59:59" → "2026.04.10 23:59"
function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ActivityVotePage() {
    const params = useParams();
    const voteId = params.id;

    const [activity, setActivity] = useState<VoteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 투표 진행 중 여부
    const isVoteActive = activity
        ? new Date() >= new Date(activity.voteStartAt) && new Date() <= new Date(activity.voteEndAt)
        : false;

    const attendanceRate = activity && activity.capacity > 0
        ? Math.round((activity.currentParticipantCount / activity.capacity) * 100)
        : 0;

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get<VoteDetail>(`/votes/${voteId}`);
                setActivity(res.data);
            } catch (err: unknown) {
                const message = (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || '활동 정보를 불러오는 중 오류가 발생했습니다.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [voteId]);

    // 게스트 폼 상태 (API 미연동 — 추후 연결)
    const [guestName, setGuestName] = useState('');
    const [showAttending, setShowAttending] = useState(false);
    const [showAbsent, setShowAbsent] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none">
                <div className="max-w-3xl mx-auto py-20 text-center text-slate-400 font-bold">불러오는 중...</div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Link href="/activities" className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                        ← 목록으로 돌아가기
                    </Link>
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">
                        {error || '활동 정보를 찾을 수 없습니다.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none relative pb-32">
        <div className="max-w-3xl mx-auto space-y-8">

            {/* 상단 뒤로가기 */}
            <Link href="/activities" className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
            ← 목록으로 돌아가기
            </Link>

            {/* --- [1] 활동 요약 카드 (API 연동) --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-[#4B7332] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {TYPE_LABEL[activity.type] || activity.type}
                </span>
                <h1 className="text-3xl font-black text-slate-800">{activity.name}</h1>
            </div>

            <div className="bg-[#F2F8E1] p-6 rounded-2xl grid grid-cols-2 gap-y-6">
                <InfoItem icon="📍" label="장소" value={activity.location} />
                <InfoItem icon="⏰" label="시간" value={activity.activityTime} />
                <InfoItem icon="📅" label="활동 날짜" value={formatDate(activity.activityDate)} />
                <InfoItem icon="👥" label="인원제한" value={`${activity.capacity}명`} />
            </div>

            {activity.memo && (
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500">{activity.memo}</p>
                </div>
            )}

            {/* 투표 기간 안내 */}
            <div className="bg-white border border-gray-100 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <span>📅</span> 투표 기간: {formatDateTime(activity.voteStartAt)} ~ {formatDateTime(activity.voteEndAt)}
                </div>
                {isVoteActive ? (
                    <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                    <span className="animate-pulse">⏱️</span> 투표 진행 중!
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <span>🔒</span> 투표가 마감되었습니다.
                    </div>
                )}
            </div>
            </section>

            {/* --- [2] 참석/불참 현황 (참석자 목록 API 추후 연동) --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-8 relative z-10">
            <h3 className="text-xl font-black text-slate-800">참석/불참 현황</h3>

            <div className="space-y-10">
                {/* 참석 섹션 */}
                <div className="space-y-4">
                <div
                    className="flex justify-between items-end cursor-pointer group"
                    onClick={() => setShowAttending(!showAttending)}
                >
                    <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800">참석</span>
                    <span className="text-xs text-slate-400 font-bold group-hover:text-green-700 transition-colors">
                        {showAttending ? '▲ 명단 접기' : '▼ 명단 보기'}
                    </span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 transition-transform group-hover:scale-105">
                    {activity.currentParticipantCount}명
                    </span>
                </div>

                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="h-full bg-[#4B7332] transition-all duration-700" style={{ width: `${attendanceRate}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow-sm">{attendanceRate}%</span>
                </div>

                {showAttending && (
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 mt-6 text-center">
                        <p className="text-sm text-slate-400 font-bold">참석자 목록 API 연동 예정</p>
                    </div>
                )}
                </div>

                {/* 불참 섹션 */}
                <div className="space-y-4">
                <div
                    className="flex justify-between items-end cursor-pointer group"
                    onClick={() => setShowAbsent(!showAbsent)}
                >
                    <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800">불참</span>
                    <span className="text-xs text-slate-400 font-bold group-hover:text-slate-600 transition-colors">
                        {showAbsent ? '▲ 명단 접기' : '▼ 명단 보기'}
                    </span>
                    </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-slate-400 w-[5%]" />
                </div>

                {showAbsent && (
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 mt-6 text-center">
                        <p className="text-sm text-slate-400 font-bold">불참자 목록 API 연동 예정</p>
                    </div>
                )}
                </div>
            </div>
            </section>

            {/* --- [3] 참석 여부 선택 버튼 --- */}
            {isVoteActive && (
                <div className="grid grid-cols-2 gap-4 relative z-10">
                <button className="py-5 bg-white border border-gray-200 text-slate-800 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">불참</button>
                <button className="py-5 bg-[#4B7332] text-white font-black rounded-2xl hover:bg-[#3d5d28] transition-all shadow-md active:scale-[0.98]">참석</button>
                </div>
            )}

            {/* --- [4] 게스트 신청 리스트 (API 추후 연동) --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-800">게스트 신청</h3>
            <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-sm text-slate-400 font-bold">게스트 목록 API 연동 예정</p>
            </div>
            </section>

            {/* --- [5] 게스트 추가 폼 (API 추후 연동) --- */}
            {isVoteActive && (
                <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6 mb-10">
                <h3 className="text-xl font-black text-slate-800">게스트 추가</h3>
                <div className="space-y-4">
                    <input
                    type="text"
                    placeholder="게스트 이름"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                    <select className="p-4 border border-gray-200 rounded-xl text-slate-400 font-bold bg-white focus:outline-none cursor-pointer">
                        <option>성별</option>
                        <option>남</option>
                        <option>여</option>
                    </select>
                    <select className="p-4 border border-gray-200 rounded-xl text-slate-400 font-bold bg-white focus:outline-none cursor-pointer">
                        <option>실력</option>
                        <option>A (최상)</option>
                        <option>B (상)</option>
                        <option>C (중)</option>
                        <option>D (하)</option>
                    </select>
                    </div>
                    <button className="w-full py-5 bg-[#4B7332] text-white font-black rounded-2xl shadow-md hover:bg-[#3d5d28] transition-all active:scale-[0.98]">
                    등록
                    </button>
                </div>
                </section>
            )}

        </div>
        </div>
    );
}

// 정보 아이템 컴포넌트
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-[15px] font-black text-slate-700">{value}</span>
        </div>
        </div>
    );
}
