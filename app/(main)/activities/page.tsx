'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { useAuth } from '../../../context/AuthContext';
import CreateLightningModal from '../../../components/ui/CreateLightningModal';

// API 응답 타입
interface VoteItem {
    voteId: number;
    name: string;
    type: 'REGULAR' | 'FLUSH' | 'EVENT';
    location: string;
    voteStartAt: string;
    voteEndAt: string;
    activityTime: string;
    capacity: number;
    currentParticipantCount: number;
}

interface VotesResponse {
    votes: VoteItem[];
    isLast: boolean;
    totalElements: number;
    totalPages: number;
}

interface VotesHistory {
    joinableVotes: number;
    thisYearVotes: number;
}

// API type → 한글 라벨
const TYPE_LABEL: Record<string, string> = {
    'REGULAR': '정기모임',
    'FLUSH': '번개모임',
    'EVENT': '이벤트',
};

// 날짜 포맷: "2026-04-03T18:00:00" → "26.04.03 (목)"
function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd} (${days[d.getDay()]})`;
}

export default function ActivitiesPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleCreateLightning = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsModalOpen(true);
    };

    const [availableActivities, setAvailableActivities] = useState<VoteItem[]>([]);
    const [pastActivities, setPastActivities] = useState<VoteItem[]>([]);
    const [history, setHistory] = useState<VotesHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [joinableRes, pastRes, historyRes] = await Promise.all([
                api.get<VotesResponse>('/votes', { params: { joinable: true, page: 0, size: 50 } }),
                api.get<VotesResponse>('/votes', { params: { joinable: false, page: 0, size: 50 } }),
                api.get<VotesHistory>('/votes/history'),
            ]);
            setAvailableActivities(joinableRes.data.votes);
            setPastActivities(pastRes.data.votes);
            setHistory(historyRes.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '활동 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVotes();
    }, [fetchVotes]);

    // 클라이언트 사이드 탭 필터링
    const filterByTab = (items: VoteItem[]) => {
        if (activeTab === '전체') return items;
        return items.filter(item => TYPE_LABEL[item.type] === activeTab);
    };

    const filteredAvailable = filterByTab(availableActivities);
    const filteredPast = filterByTab(pastActivities);

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-10 sm:space-y-16">

                {/* 상단 탭 및 버튼 바 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        {['전체', '정기모임', '번개모임'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'bg-[#4B7332] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="bg-[#2D5A27] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:bg-[#1e3d1a] transition-all text-sm sm:text-base"
                        onClick={handleCreateLightning}>
                        + 번개 모임 만들기
                    </button>
                </div>

                {/* 에러 표시 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                {/* 로딩 */}
                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold">불러오는 중...</div>
                ) : (
                    <>
                        {/* 참여 가능 활동 */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-end">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">참여 가능 활동</h2>
                                <span className="bg-[#F2F8E1] text-[#4B7332] px-4 py-1.5 rounded-full text-xs font-black border border-[#E2EBC8]">
                                    {history ? `${history.joinableVotes}개 참여 가능` : `+ ${filteredAvailable.length} ACTIVITIES`}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {filteredAvailable.length > 0 ? (
                                    filteredAvailable.map(vote => (
                                        <ActivityCard key={vote.voteId} data={vote} isPast={false} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200 text-slate-400 font-bold">
                                        현재 참여 가능한 활동이 없습니다.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 이전 활동 */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-end">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">이전 활동</h2>
                                <span className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-xs font-black">
                                    {history ? `올해 ${history.thisYearVotes}회 활동` : `+ ${filteredPast.length} ACTIVITIES`}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4 opacity-60 grayscale-[0.3]">
                                {filteredPast.map(vote => (
                                    <ActivityCard key={vote.voteId} data={vote} isPast={true} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

            </div>
            <CreateLightningModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

/** 공용 활동 카드 컴포넌트 **/
function ActivityCard({ data, isPast }: { data: VoteItem; isPast: boolean }) {
    const router = useRouter();
    const percentage = data.capacity > 0
        ? (data.currentParticipantCount / data.capacity) * 100
        : 0;
    const typeLabel = TYPE_LABEL[data.type] || data.type;

    const handleCardClick = () => {
        if (!isPast) {
            router.push(`/activities/${data.voteId}`);
        }
    };

    return (
        <div className="relative group">
            <div
                onClick={handleCardClick}
                className={`bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-all relative ${isPast ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'}`}
            >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 ${isPast ? 'bg-slate-300' : 'bg-[#3D6B2C]'}`} />

                <div className="flex-grow space-y-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">
                            {typeLabel}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-800">{data.name}</h3>

                        {!isPast && (
                            <Link
                                href={`/activities/${data.voteId}/tournament`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                className="bg-[#4B7332] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap drop-shadow-sm hover:bg-[#3d5d28] transition-colors z-20"
                            >
                                대진
                            </Link>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm font-bold text-slate-400">
                        <p>📍 {data.location}</p>
                        <p>📅 {formatDate(data.voteEndAt)} {data.activityTime}</p>
                    </div>
                </div>

                <div className="w-full sm:w-48 sm:text-right space-y-2 sm:space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex-shrink-0">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">참여 인원</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-800">
                        {data.currentParticipantCount} / <span className="text-slate-300">{data.capacity}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${isPast ? 'bg-slate-400' : 'bg-[#4B7332]'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
