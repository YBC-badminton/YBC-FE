'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

type ActivityType = 'REGULAR' | 'FLUSH' | 'EVENT';
type VoteStatusType = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
    REGULAR: '정기',
    FLUSH: '번개',
    EVENT: '이벤트',
};

const STATUS_CONFIG: Record<VoteStatusType, { text: string; color: string }> = {
    UPCOMING: { text: '대기중', color: 'bg-orange-50 text-orange-500' },
    IN_PROGRESS: { text: '진행중', color: 'bg-green-50 text-green-500' },
    COMPLETED: { text: '완료', color: 'bg-gray-100 text-gray-400' },
};

interface VoteSummary {
    totalCount: number;
    upcomingCount: number;
    inProgressCount: number;
    completedCount: number;
}

interface VoteAttendance {
    currentAttendees: number;
    currentGuests: number;
    totalParticipants: number;
}

interface VoteItem {
    voteId: number;
    status: VoteStatusType;
    activityType: ActivityType;
    title: string;
    activityDate: string;
    activityTime: string;
    location: string;
    memo: string;
    voteStartAt: string;
    voteEndAt: string;
    attendance: VoteAttendance;
}

interface VotesResponse {
    summary: VoteSummary;
    data: VoteItem[];
}

type FilterType = 'all' | 'IN_PROGRESS' | 'COMPLETED';

export default function VoteStatusPage() {
    const [summary, setSummary] = useState<VoteSummary | null>(null);
    const [votes, setVotes] = useState<VoteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    // GET /admin/votes
    const fetchVotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<VotesResponse>('/admin/votes');
            setSummary(res.data.summary);
            setVotes(res.data.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '투표 현황을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVotes();
    }, [fetchVotes]);

    // DELETE /admin/votes/{voteId}
    const handleDelete = async (voteId: number) => {
        if (!confirm('이 투표를 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/admin/votes/${voteId}`);
            fetchVotes();
        } catch {
            alert('삭제에 실패했습니다.');
        }
    };

    const filteredList = votes.filter((vote) => {
        if (filter === 'all') return true;
        return vote.status === filter;
    });

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: '전체' },
        { key: 'IN_PROGRESS', label: '진행 중' },
        { key: 'COMPLETED', label: '종료됨' },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">투표 예약 현황</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">예약된 투표 정보를 확인하고 관리하세요.</p>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
                <div className="col-span-3 sm:col-span-1">
                    <StatCard label="전체 투표" count={summary?.totalCount ?? 0} color="text-gray-800" />
                </div>
                <StatCard label="대기중" count={summary?.upcomingCount ?? 0} color="text-orange-500" bgColor="bg-orange-50" />
                <StatCard label="진행중" count={summary?.inProgressCount ?? 0} color="text-green-500" bgColor="bg-green-50" />
                <StatCard label="완료" count={summary?.completedCount ?? 0} color="text-blue-500" bgColor="bg-blue-50" />
            </div>

            {/* 필터 탭 */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                            filter === f.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* 투표 카드 목록 */}
            <div className="space-y-4 sm:space-y-6">
                {loading && <p className="text-center py-10 text-gray-400">현황을 불러오는 중입니다...</p>}
                {error && <p className="text-center py-10 text-red-500">데이터 로드 실패: {error}</p>}

                {!loading && filteredList.map((vote) => (
                    <VoteCard key={vote.voteId} vote={vote} onDelete={handleDelete} onRefresh={fetchVotes} />
                ))}

                {!loading && !error && filteredList.length === 0 && (
                    <p className="text-center py-10 text-gray-400 text-sm">해당하는 투표가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, count, color, bgColor }: { label: string; count: number; color: string; bgColor?: string }) {
    return (
        <div className={`p-3 sm:p-5 rounded-xl border border-gray-100 shadow-sm ${bgColor ?? 'bg-white'}`}>
            <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-medium">{label}</p>
            <p className={`text-base sm:text-2xl font-bold ${color}`}>{count}개</p>
        </div>
    );
}

function VoteCard({ vote, onDelete, onRefresh }: { vote: VoteItem; onDelete: (id: number) => void; onRefresh: () => void }) {
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        activityType: vote.activityType,
        title: vote.title,
        activityDate: vote.activityDate,
        activityTime: vote.activityTime,
        location: vote.location,
        memo: vote.memo,
        voteStartAt: vote.voteStartAt,
        voteEndAt: vote.voteEndAt,
    });

    // PATCH /admin/votes/{voteId}
    const handleSave = async () => {
        try {
            await api.patch(`/admin/votes/${vote.voteId}`, editForm);
            setEditing(false);
            onRefresh();
        } catch {
            alert('수정에 실패했습니다.');
        }
    };

    const status = STATUS_CONFIG[vote.status];
    const typeLabel = ACTIVITY_TYPE_LABEL[vote.activityType] || vote.activityType;

    if (editing) {
        return (
            <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 sm:p-6 space-y-4">
                <h3 className="font-bold text-gray-800">투표 수정</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">제목</label>
                        <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">활동 유형</label>
                        <select value={editForm.activityType} onChange={(e) => setEditForm({ ...editForm, activityType: e.target.value as ActivityType })} className="w-full p-2 border rounded-lg text-sm">
                            <option value="REGULAR">정기 운동</option>
                            <option value="FLUSH">번개 운동</option>
                            <option value="EVENT">이벤트 운동</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">활동 날짜</label>
                        <input type="date" value={editForm.activityDate} onChange={(e) => setEditForm({ ...editForm, activityDate: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">활동 시간</label>
                        <input value={editForm.activityTime} onChange={(e) => setEditForm({ ...editForm, activityTime: e.target.value })} className="w-full p-2 border rounded-lg text-sm" placeholder="14:00 ~ 17:00" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">장소</label>
                        <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">메모</label>
                        <input value={editForm.memo} onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">투표 시작</label>
                        <input type="datetime-local" value={editForm.voteStartAt?.slice(0, 16)} onChange={(e) => setEditForm({ ...editForm, voteStartAt: e.target.value + ':00' })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">투표 종료</label>
                        <input type="datetime-local" value={editForm.voteEndAt?.slice(0, 16)} onChange={(e) => setEditForm({ ...editForm, voteEndAt: e.target.value + ':00' })} className="w-full p-2 border rounded-lg text-sm" />
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">저장</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                        vote.activityType === 'REGULAR' ? 'bg-blue-50 text-blue-600' :
                        vote.activityType === 'FLUSH' ? 'bg-purple-50 text-purple-600' :
                        'bg-green-50 text-green-600'
                    }`}>
                        {typeLabel}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{vote.title}</h2>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${status.color}`}>
                        {status.text}
                    </span>
                    <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(vote.voteId)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-[13px] sm:text-sm">
                <InfoField label="날짜" value={vote.activityDate} />
                <InfoField label="시간" value={vote.activityTime} />
                <InfoField label="장소" value={vote.location} />
                <InfoField label="참가자" value={`${vote.attendance.totalParticipants}명 (회원 ${vote.attendance.currentAttendees} + 게스트 ${vote.attendance.currentGuests})`} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-[12px] sm:text-sm text-gray-500">
                <div className="flex flex-col sm:flex-row sm:gap-x-8 gap-y-1.5">
                    <p>투표 시작: <span className="text-gray-800 font-medium">{vote.voteStartAt?.slice(0, 16)}</span></p>
                    <p>투표 종료: <span className="text-gray-800 font-medium">{vote.voteEndAt?.slice(0, 16)}</span></p>
                </div>
            </div>

            {vote.memo && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">메모</p>
                    <p className="text-[13px] sm:text-sm text-gray-600">{vote.memo}</p>
                </div>
            )}
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="font-medium text-gray-700 truncate">{value}</p>
        </div>
    );
}
