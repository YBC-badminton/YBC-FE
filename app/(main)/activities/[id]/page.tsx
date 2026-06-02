'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import { useToast } from '../../../../components/ui/Toast';

// API 응답 타입
interface VoteDetail {
    voteId: number;
    name: string;
    type: 'REGULAR' | 'FLUSH' | 'EVENT';
    activityDate: string;
    activityTime: string;
    location: string;
    memo: string;
    voteStartAt: string;
    voteEndAt: string;
    capacity: number;
    currentParticipantCount: number;
}

interface AttendanceStatusResponse {
    attendanceStatus: boolean | null;
}

interface MemberShort {
    memberId: number;
    nickname: string;
}

interface AttendeesResponse {
    totalAttendeeCount: number;
    attendees: MemberShort[];
}

interface AbsenteesResponse {
    totalAttendeeCount: number;
    // BE는 현재 /absentees 응답에서도 키를 `attendees`로 내려보내므로 둘 다 허용
    absentees?: MemberShort[];
    attendees?: MemberShort[];
}

interface GuestItem {
    guestId: number;
    inviterName: string;
    guestName: string;
    gender: 'MALE' | 'FEMALE';
    level: string;
}

interface GuestsResponse {
    totalGuestCount: number;
    guests: GuestItem[];
}

const TYPE_LABEL: Record<string, string> = {
    'REGULAR': '정기모임',
    'FLUSH': '번개모임',
    'EVENT': '이벤트',
};

const GENDER_LABEL: Record<string, string> = {
    'MALE': '남',
    'FEMALE': '여',
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
    const { showToast } = useToast();

    const [activity, setActivity] = useState<VoteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [myAttendance, setMyAttendance] = useState<boolean | null>(null);
    const [attendees, setAttendees] = useState<MemberShort[]>([]);
    const [absentees, setAbsentees] = useState<MemberShort[]>([]);
    const [guests, setGuests] = useState<GuestItem[]>([]);
    const [totalGuestCount, setTotalGuestCount] = useState(0);

    // 게스트 폼 상태
    const [guestName, setGuestName] = useState('');
    const [guestGender, setGuestGender] = useState('');
    const [guestLevel, setGuestLevel] = useState('');
    const [guestSubmitting, setGuestSubmitting] = useState(false);
    const [showAttending, setShowAttending] = useState(false);
    const [showAbsent, setShowAbsent] = useState(false);

    // 투표 진행 중 여부
    const isVoteActive = activity
        ? new Date() >= new Date(activity.voteStartAt) && new Date() <= new Date(activity.voteEndAt)
        : false;

    const attendanceRate = activity && activity.capacity > 0
        ? Math.round((activity.currentParticipantCount / activity.capacity) * 100)
        : 0;

    const absentRate = activity && activity.capacity > 0
        ? Math.round((absentees.length / activity.capacity) * 100)
        : 0;

    const fetchDetail = useCallback(async () => {
        try {
            const res = await api.get<VoteDetail>(`/votes/${voteId}`);
            setActivity(res.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '활동 정보를 불러오는 중 오류가 발생했습니다.';
            setError(message);
        }
    }, [voteId]);

    const fetchMyAttendance = useCallback(async () => {
        try {
            const res = await api.get<AttendanceStatusResponse>(`/votes/${voteId}/attendance`);
            setMyAttendance(res.data.attendanceStatus);
        } catch {
            // 미참여 상태로 유지
        }
    }, [voteId]);

    const fetchAttendees = useCallback(async () => {
        try {
            const res = await api.get<AttendeesResponse>(`/votes/${voteId}/attendees`);
            setAttendees(res.data.attendees ?? []);
        } catch {
            setAttendees([]);
        }
    }, [voteId]);

    const fetchAbsentees = useCallback(async () => {
        try {
            const res = await api.get<AbsenteesResponse>(`/votes/${voteId}/absentees`);
            setAbsentees(res.data.absentees ?? res.data.attendees ?? []);
        } catch {
            setAbsentees([]);
        }
    }, [voteId]);

    const fetchGuests = useCallback(async () => {
        try {
            const res = await api.get<GuestsResponse>(`/votes/${voteId}/guests`);
            setGuests(res.data.guests ?? []);
            setTotalGuestCount(res.data.totalGuestCount ?? 0);
        } catch {
            setGuests([]);
            setTotalGuestCount(0);
        }
    }, [voteId]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            fetchDetail(),
            fetchMyAttendance(),
            fetchAttendees(),
            fetchAbsentees(),
            fetchGuests(),
        ]).finally(() => setLoading(false));
    }, [fetchDetail, fetchMyAttendance, fetchAttendees, fetchAbsentees, fetchGuests]);

    const submitAttendance = async (attendanceStatus: boolean) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await api.put(`/votes/${voteId}/attendance`, { attendanceStatus });
            showToast(attendanceStatus ? '참석으로 제출되었습니다.' : '불참으로 제출되었습니다.', 'success');
            // 참석/불참 명단 및 내 상태 갱신
            await Promise.all([
                fetchDetail(),
                fetchMyAttendance(),
                fetchAttendees(),
                fetchAbsentees(),
            ]);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '참여 여부 제출 중 오류가 발생했습니다.';
            showToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const submitGuest = async () => {
        if (guestSubmitting) return;
        if (!guestName.trim() || !guestGender || !guestLevel) {
            showToast('이름, 성별, 실력을 모두 입력해 주세요.', 'error');
            return;
        }
        setGuestSubmitting(true);
        try {
            await api.post(`/votes/${voteId}/guests`, {
                name: guestName.trim(),
                gender: guestGender,
                level: guestLevel,
            });
            showToast(`게스트 "${guestName.trim()}"님이 등록되었습니다.`, 'success');
            setGuestName('');
            setGuestGender('');
            setGuestLevel('');
            await fetchGuests();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '게스트 등록 중 오류가 발생했습니다.';
            showToast(message, 'error');
        } finally {
            setGuestSubmitting(false);
        }
    };

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

            {/* --- [1] 활동 요약 카드 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-[#4B7332] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {TYPE_LABEL[activity.type] || activity.type}
                </span>
                <h1 className="text-3xl font-black text-slate-800">{activity.name}</h1>
            </div>

            <div className="bg-[#F2F8E1] p-6 rounded-2xl grid grid-cols-2 gap-x-4 gap-y-6">
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

            {/* --- [2] 참석/불참 현황 --- */}
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
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 mt-6">
                        {attendees.length === 0 ? (
                            <p className="text-sm text-slate-400 font-bold text-center">아직 참석자가 없습니다.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {attendees.map((m) => (
                                    <li key={m.memberId} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-slate-700">
                                        {m.nickname}
                                    </li>
                                ))}
                            </ul>
                        )}
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
                    <span className="text-2xl font-black text-slate-800 transition-transform group-hover:scale-105">
                    {absentees.length}명
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-slate-400 transition-all duration-700" style={{ width: `${absentRate}%` }} />
                </div>

                {showAbsent && (
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 mt-6">
                        {absentees.length === 0 ? (
                            <p className="text-sm text-slate-400 font-bold text-center">아직 불참자가 없습니다.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {absentees.map((m) => (
                                    <li key={m.memberId} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-slate-500">
                                        {m.nickname}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                </div>
            </div>
            </section>

            {/* --- [3] 참석 여부 선택 버튼 --- */}
            {isVoteActive && (
                <div className="space-y-3 relative z-10">
                <div className="text-sm font-bold text-slate-500">
                    {myAttendance === true && <span className="text-green-700">현재 상태: 참석</span>}
                    {myAttendance === false && <span className="text-slate-600">현재 상태: 불참</span>}
                    {myAttendance === null && <span className="text-slate-400">아직 투표하지 않았습니다.</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => submitAttendance(false)}
                    disabled={submitting || myAttendance === false}
                    aria-pressed={myAttendance === false}
                    className={`py-5 font-black rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed ${
                        myAttendance === false
                            ? 'bg-slate-800 text-white ring-2 ring-slate-800 opacity-100'
                            : 'bg-white border border-gray-200 text-slate-800 hover:bg-slate-50 disabled:opacity-50'
                    }`}
                >
                    불참{myAttendance === false && ' (선택됨)'}
                </button>
                <button
                    onClick={() => submitAttendance(true)}
                    disabled={submitting || myAttendance === true}
                    aria-pressed={myAttendance === true}
                    className={`py-5 font-black rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed ${
                        myAttendance === true
                            ? 'bg-[#3d5d28] text-white ring-2 ring-[#3d5d28] opacity-100'
                            : 'bg-[#4B7332] text-white hover:bg-[#3d5d28] disabled:opacity-50'
                    }`}
                >
                    참석{myAttendance === true && ' (선택됨)'}
                </button>
                </div>
                </div>
            )}

            {/* --- [4] 게스트 신청 리스트 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">게스트 신청</h3>
                <span className="text-sm font-bold text-slate-500">총 {totalGuestCount}명</span>
            </div>
            {guests.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 text-center">
                    <p className="text-sm text-slate-400 font-bold">아직 신청된 게스트가 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {guests.map((g) => (
                        <li key={g.guestId} className="flex justify-between items-center bg-slate-50 rounded-2xl border border-gray-100 px-5 py-3">
                            <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-[15px]">{g.guestName}</span>
                                <span className="text-xs font-bold text-slate-400">초대자: {g.inviterName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-500 px-2 py-0.5 bg-white rounded-full border border-gray-200">
                                    {GENDER_LABEL[g.gender] || g.gender}
                                </span>
                                <span className="text-xs font-black text-slate-500 px-2 py-0.5 bg-white rounded-full border border-gray-200">
                                    {g.level}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            </section>

            {/* --- [5] 게스트 추가 폼 --- */}
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
                    disabled={guestSubmitting}
                    />
                    <div className="grid grid-cols-2 gap-4">
                    <select
                        className="p-4 border border-gray-200 rounded-xl text-slate-700 font-bold bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        value={guestGender}
                        onChange={(e) => setGuestGender(e.target.value)}
                        disabled={guestSubmitting}
                    >
                        <option value="">성별</option>
                        <option value="MALE">남</option>
                        <option value="FEMALE">여</option>
                    </select>
                    <select
                        className="p-4 border border-gray-200 rounded-xl text-slate-700 font-bold bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        value={guestLevel}
                        onChange={(e) => setGuestLevel(e.target.value)}
                        disabled={guestSubmitting}
                    >
                        <option value="">실력</option>
                        <option value="A">A (최상)</option>
                        <option value="B">B (상)</option>
                        <option value="C">C (중)</option>
                        <option value="D">D (하)</option>
                    </select>
                    </div>
                    <button
                        onClick={submitGuest}
                        disabled={guestSubmitting}
                        className="w-full py-5 bg-[#4B7332] text-white font-black rounded-2xl shadow-md hover:bg-[#3d5d28] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {guestSubmitting ? '등록 중...' : '등록'}
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
        <span className="text-lg w-6 text-center shrink-0 leading-7">{icon}</span>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-[15px] font-black text-slate-700">{value}</span>
        </div>
        </div>
    );
}
