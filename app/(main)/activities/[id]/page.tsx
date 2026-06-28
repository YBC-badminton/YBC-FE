'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import { useToast } from '../../../../components/ui/Toast';
import { useAuth } from '../../../../context/AuthContext';
import { MapPin, Clock, Calendar as CalendarIcon, Users, Trash2, X } from 'lucide-react';

// API 응답 타입
interface VoteDetail {
    voteId: number;
    name: string;
    type: 'REGULAR' | 'FLASH' | 'EVENT';
    activityDate: string;
    activityTime: string;
    location: string;
    memo: string;
    voteStartAt: string;
    voteEndAt: string;
    capacity: number;
    currentParticipantCount: number;
    openedByMemberId?: number;   // 번개 모임 개설자
    openedByNickname?: string;
}

interface AttendanceStatusResponse {
    attendanceStatus: boolean | null;
}

interface MemberShort {
    memberId: number;
    nickname: string;
    isWaiting?: boolean;
}

interface AttendeesResponse {
    totalAttendeeCount?: number;
    attendees?: MemberShort[];
}

interface AbsenteesResponse {
    totalAttendeeCount?: number;
    absentees?: MemberShort[];
    attendees?: MemberShort[];
}

interface GuestItem {
    guestId: number;
    inviterName: string;
    guestName: string;
    gender: 'MALE' | 'FEMALE';
    level: string;
    isWaiting?: boolean;
}

interface GuestsResponse {
    totalGuestCount: number;
    guests: GuestItem[];
}

const TYPE_LABEL: Record<string, string> = {
    'REGULAR': '정기모임',
    'FLASH': '번개모임',
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
    const { user } = useAuth();

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

    // 게스트 등록 확인 모달 (등록 후 수정 불가 정책 안내)
    const [showGuestConfirm, setShowGuestConfirm] = useState(false);

    // 명단 토글
    const [showAttending, setShowAttending] = useState(false);
    const [showAbsent, setShowAbsent] = useState(false);

    // 투표 진행 중 여부
    const isVoteActive = activity
        ? new Date() >= new Date(activity.voteStartAt) && new Date() <= new Date(activity.voteEndAt)
        : false;

    // 진행률 계산
    const attendanceRate = activity && activity.capacity > 0
    ? Math.min(Math.round((attendees.length / activity.capacity) * 100), 100)
    : 0;

    const absentRate = activity && activity.capacity > 0
        ? Math.round((absentees.length / activity.capacity) * 100)
        : 0;

    // --- API 호출 함수들 ---

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
            setMyAttendance(null);
        }
    }, [voteId]);

    const fetchAttendees = useCallback(async () => {
        try {
            const res = await api.get<AttendeesResponse | MemberShort[]>(`/votes/${voteId}/attendees`);
            if (Array.isArray(res.data)) {
                setAttendees(res.data);
            } else if (res.data && Array.isArray((res.data as AttendeesResponse).attendees)) {
                setAttendees((res.data as AttendeesResponse).attendees || []);
            } else {
                setAttendees([]);
            }
        } catch {
            setAttendees([]);
        }
    }, [voteId]);

    const fetchAbsentees = useCallback(async () => {
        try {
            const res = await api.get<AbsenteesResponse | MemberShort[]>(`/votes/${voteId}/absentees`);
            if (Array.isArray(res.data)) {
                setAbsentees(res.data);
            } else if (res.data) {
                const data = res.data as AbsenteesResponse;
                setAbsentees(data.absentees ?? data.attendees ?? []);
            } else {
                setAbsentees([]);
            }
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

    // --- 액션 함수들 ---

    const submitAttendance = async (attendanceStatus: boolean) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await api.put(`/votes/${voteId}/attendance`, { attendanceStatus });
            showToast(attendanceStatus ? '참석으로 제출되었습니다.' : '불참으로 제출되었습니다.', 'success');
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
            setShowGuestConfirm(false);
        }
    };

    // 등록 버튼 → 유효성 검사 후 확인 모달 열기 (등록 후 수정 불가 정책 안내)
    const openGuestConfirm = () => {
        if (!guestName.trim() || !guestGender || !guestLevel) {
            showToast('이름, 성별, 실력을 모두 입력해 주세요.', 'error');
            return;
        }
        setShowGuestConfirm(true);
    };

    const deleteGuest = async (guestId: number, name: string) => {
        if (!confirm(`게스트 "${name}"님을 취소하시겠습니까?`)) return;
        try {
            await api.delete(`/votes/${voteId}/guests/${guestId}`);
            showToast(`게스트 "${name}"님이 취소되었습니다.`, 'success');
            await fetchGuests();
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '게스트 취소 중 오류가 발생했습니다.';
            showToast(message, 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none flex items-center justify-center">
                <div className="text-center text-slate-400 font-bold">불러오는 중...</div>
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
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-24 font-sans select-none relative pb-32">
        <div className="max-w-3xl mx-auto space-y-8">

            {/* 상단 뒤로가기 */}
            <Link href="/activities" className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
            ← 목록으로 돌아가기
            </Link>

            {/* --- [1] 활동 요약 카드 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="bg-[#5b6b0f] text-white text-[11px] font-black px-2.5 py-1 rounded w-fit uppercase">
                {TYPE_LABEL[activity.type] || activity.type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 break-keep">{activity.name}</h1>
            </div>

            {/* 💡 모바일 화면 깨짐 현상 수정을 위한 그리드 반응형 및 flex 설정 변경 */}
            <div className="bg-[#F2F8E1] p-5 sm:p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-y-6 sm:gap-x-8">
                <InfoItem icon={<MapPin className="w-5 h-5 text-[#5b6b0f]" />} label="장소" value={activity.location} />
                <InfoItem icon={<Clock className="w-5 h-5 text-[#5b6b0f]" />} label="시간" value={activity.activityTime} />
                <InfoItem icon={<CalendarIcon className="w-5 h-5 text-[#5b6b0f]" />} label="활동 날짜" value={formatDate(activity.activityDate)} />
                <InfoItem icon={<Users className="w-5 h-5 text-[#5b6b0f]" />} label="인원제한" value={`${activity.capacity}명`} />
                {activity.openedByNickname && (
                    <InfoItem icon={<Users className="w-5 h-5 text-[#5b6b0f]" />} label="개설자" value={activity.openedByNickname} />
                )}
            </div>

            {activity.memo && (
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl">
                    <p className="text-sm font-medium text-slate-600 whitespace-pre-line break-keep">{activity.memo}</p>
                </div>
            )}

            {/* 투표 기간 안내 */}
            <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl space-y-2">
                <div className="flex items-start gap-2 text-slate-500 font-bold text-xs sm:text-sm">
                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="break-keep leading-relaxed">투표 기간: {formatDateTime(activity.voteStartAt)} ~ {formatDateTime(activity.voteEndAt)}</span>
                </div>
                {isVoteActive ? (
                    <div className="flex items-center gap-2 text-[#5b6b0f] font-black text-xs sm:text-sm">
                    <div className="relative flex h-3 w-3 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                    </div>
                    투표 진행 중!
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs sm:text-sm">
                    투표가 마감되었습니다.
                    </div>
                )}
            </div>
            </section>

            {/* --- [2] 참석/불참 현황 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 relative z-10">
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
                    <span className="text-xs text-slate-400 font-bold group-hover:text-[#5b6b0f] transition-colors">
                        {showAttending ? '▲ 명단 접기' : '▼ 명단 보기'}
                    </span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 transition-transform group-hover:scale-105">
                    {attendees.length}명
                    </span>
                </div>

                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="h-full bg-[#5b6b0f] transition-all duration-700" style={{ width: `${attendanceRate}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow-sm">{attendanceRate}%</span>
                </div>

                {showAttending && (
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-4 sm:p-6 mt-6 space-y-2">
                        {attendees.length === 0 ? (
                            <p className="text-sm text-slate-400 font-bold text-center">아직 참석자가 없습니다.</p>
                        ) : (
                            attendees.map((m, idx) => (
                                <div key={m.memberId} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    {/* 💡 번호와 닉네임 */}
                                    <span className="font-bold text-slate-700 text-sm">
                                        {idx + 1}. {m.nickname}
                                    </span>
                                    {/* 💡 isWaiting에 따른 뱃지 */}
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${m.isWaiting ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-[#5b6b0f]'}`}>
                                        {m.isWaiting ? '대기' : '참가'}
                                    </span>
                                </div>
                            ))
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
                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="h-full bg-slate-400 transition-all duration-700" style={{ width: `${absentRate}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow-sm">{absentRate}%</span>
                </div>

                {showAbsent && (
                    <div className="bg-slate-50 rounded-2xl border border-gray-100 p-4 sm:p-6 mt-6">
                        {absentees.length === 0 ? (
                            <p className="text-sm text-slate-400 font-bold text-center">아직 불참자가 없습니다.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {absentees.map((m) => (
                                    <li key={m.memberId} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-slate-500 shadow-sm">
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
                <div className="text-sm font-bold text-slate-500 px-1">
                    {myAttendance === true && <span className="text-[#5b6b0f]">현재 상태: 참석</span>}
                    {myAttendance === false && <span className="text-slate-600">현재 상태: 불참</span>}
                    {myAttendance === null && <span className="text-slate-400">아직 투표하지 않았습니다.</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                    onClick={() => submitAttendance(false)}
                    disabled={submitting || myAttendance === false}
                    aria-pressed={myAttendance === false}
                    className={`py-3 sm:py-3.5 font-black rounded-2xl transition-all shadow-sm active:scale-[0.98] disabled:cursor-not-allowed ${
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
                    className={`py-3 sm:py-3.5 font-black rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed ${
                        myAttendance === true
                            ? 'bg-[#46530c] text-white ring-2 ring-[#46530c] opacity-100'
                            : 'bg-[#5b6b0f] text-white hover:bg-[#46530c] disabled:opacity-50'
                    }`}
                >
                    참석{myAttendance === true && ' (선택됨)'}
                </button>
                </div>
                </div>
            )}

            {/* --- [4] 게스트 신청 리스트 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">게스트 신청</h3>
                <span className="text-sm font-bold text-slate-500">총 {totalGuestCount}명</span>
            </div>
            {guests.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border border-gray-100 p-6 text-center">
                    <p className="text-sm text-slate-400 font-bold">아직 신청된 게스트가 없습니다.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {guests.map((g) => {
                        const canManage = !!user && user.name === g.inviterName;

                        return (
                            <li key={g.guestId} className="flex justify-between items-center bg-slate-50 rounded-2xl border border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
                                <div className="flex flex-col min-w-0 mr-3">
                                    {/* 💡 수정된 부분: 이름 옆에 대기/참석 뱃지 추가 */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-800 text-[14px] sm:text-[15px] truncate">{g.guestName}</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${g.isWaiting ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-[#5b6b0f]'}`}>
                                            {g.isWaiting ? '대기' : '참석'}
                                        </span>
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-400 truncate mt-0.5">초대자: {g.inviterName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <span className="text-[11px] sm:text-xs font-black text-slate-500 px-2 sm:px-2.5 py-1 bg-white rounded-full border border-gray-200">
                                        {GENDER_LABEL[g.gender] || g.gender}
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-black text-slate-500 px-2 sm:px-2.5 py-1 bg-white rounded-full border border-gray-200">
                                        {g.level}
                                    </span>
                                    {canManage && (
                                        <button onClick={() => deleteGuest(g.guestId, g.guestName)} className="text-slate-400 hover:text-red-500 p-1" aria-label="게스트 취소">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            </section>

            {/* --- [5] 게스트 추가 폼 --- */}
            {isVoteActive && (
                <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 mb-10">
                <h3 className="text-xl font-black text-slate-800">게스트 추가</h3>
                <div className="space-y-3 sm:space-y-4">
                    <input
                    type="text"
                    placeholder="게스트 이름"
                    className="w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    disabled={guestSubmitting}
                    />
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <select
                        className="px-3.5 py-3 sm:px-4 sm:py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-700 font-bold bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        value={guestGender}
                        onChange={(e) => setGuestGender(e.target.value)}
                        disabled={guestSubmitting}
                    >
                        <option value="">성별</option>
                        <option value="MALE">남</option>
                        <option value="FEMALE">여</option>
                    </select>
                    <select
                        className="px-3.5 py-3 sm:px-4 sm:py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-700 font-bold bg-white focus:outline-none cursor-pointer disabled:opacity-50"
                        value={guestLevel}
                        onChange={(e) => setGuestLevel(e.target.value)}
                        disabled={guestSubmitting}
                    >
                        <option value="">실력</option>
                        <option value="왕초심">왕초심</option>
                        <option value="초심">초심</option>
                        <option value="D">D</option>
                        <option value="C">C</option>
                        <option value="B">B</option>
                        <option value="A">A</option>
                    </select>
                    </div>
                    <button
                        onClick={openGuestConfirm}
                        disabled={guestSubmitting}
                        className="w-full py-3 sm:py-3.5 bg-[#5b6b0f] text-white font-black rounded-2xl shadow-md hover:bg-[#46530c] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                    {guestSubmitting ? '등록 중...' : '등록'}
                    </button>
                </div>
                </section>
            )}

            {/* 게스트 등록 확인 모달 (등록 후 수정 불가 안내) */}
            {showGuestConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => !guestSubmitting && setShowGuestConfirm(false)}
                />
                <div className="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in duration-150">
                  <button
                    onClick={() => setShowGuestConfirm(false)}
                    disabled={guestSubmitting}
                    aria-label="닫기"
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-black text-slate-800">게스트 등록 확인</h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed break-keep">
                    게스트 등록 시 정보 수정이 불가능하며, 정보 수정을 원할 경우 삭제 후 다시 등록해야 합니다.
                  </p>
                  <div className="flex items-center justify-center gap-2 bg-slate-50 border border-gray-100 rounded-2xl py-3 px-4">
                    <span className="font-black text-slate-800 break-keep">{guestName.trim()}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm font-bold text-slate-600">{GENDER_LABEL[guestGender] || guestGender}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm font-bold text-slate-600">{guestLevel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowGuestConfirm(false)}
                      disabled={guestSubmitting}
                      className="py-3 font-black rounded-2xl bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={submitGuest}
                      disabled={guestSubmitting}
                      className="py-3 font-black rounded-2xl bg-[#5b6b0f] text-white hover:bg-[#46530c] disabled:opacity-50"
                    >
                      {guestSubmitting ? '등록 중...' : '등록'}
                    </button>
                  </div>
                </div>
              </div>
            )}

        </div>
        </div>
    );
}

// 정보 아이템 컴포넌트 (모바일 레이아웃 및 lucide-react 적용 완료)
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 w-full">
        <div className="shrink-0 mt-0.5 bg-white p-1.5 rounded-lg shadow-sm border border-green-100">
            {icon}
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 mb-0.5">{label}</span>
            <span className="text-[14px] sm:text-[15px] font-black text-slate-700 break-words break-keep leading-snug">{value}</span>
        </div>
        </div>
    );
}