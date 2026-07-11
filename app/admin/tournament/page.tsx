'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, MapPin, CheckCircle2, UserPlus, Users, X, RefreshCw, Save, ArrowLeft, Edit3 } from 'lucide-react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';

// ============================================================================
// 1. 타입 정의 (Types)
// ============================================================================
interface Participant {
    participantId: number;
    name: string;
    gender: 'MALE' | 'FEMALE';
    participantType: 'MEMBER' | 'GUEST';
}

interface AdminActivity {
    voteId: number;
    matchId?: number; // 리스트에서 넘겨받은 matchId
    title: string;
    activityDay: string;
    activityDate: string;
    location: string;
    matchRegistered: boolean;
    attendance: { currentAttendees: number; currentGuests: number; totalParticipants: number };
}

// 💡 수정됨: 백엔드 명세에 맞게 team1, team2는 숫자(ID) 배열만 받습니다.
interface ServerMatch {
    matchNumber: number;
    team1: number[];
    team2: number[];
}

interface CourtMatchGroup {
    courtNumber: number;
    courtMatches: ServerMatch[];
}

type BracketRow = (number | null)[];

// ============================================================================
// 2. 헬퍼 함수
// ============================================================================
const createEmptyRow = (): BracketRow => [null, null, null, null];

// ============================================================================
// 3. 메인 컴포넌트
// ============================================================================
export default function TournamentPage() {
    const { showToast } = useToast();

    // --- 앱 전체 상태 ---
    const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<AdminActivity[]>([]);

    // --- 에디터 전용 상태 ---
    const [activeVoteId, setActiveVoteId] = useState<number | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<number | null>(null); // PATCH 대상 matchId
    const [isEditMode, setIsEditMode] = useState(false); // 편성 완료 활동 수정 여부 (matchRegistered 기준)
    const [activityTitle, setActivityTitle] = useState('');
    const [activeCourt, setActiveCourt] = useState<number>(1);
    
    // 전체 참가자 풀
    const [participants, setParticipants] = useState<Participant[]>([]);
    
    // 코트별 명단
    const [rosters, setRosters] = useState<Record<number, number[]>>({ 1: [], 2: [], 3: [], 4: [] });
    
    // 코트별 대진표
    const [brackets, setBrackets] = useState<Record<number, BracketRow[]>>({
        1: [createEmptyRow(), createEmptyRow()],
        2: [createEmptyRow(), createEmptyRow()],
        3: [createEmptyRow(), createEmptyRow()],
        4: [createEmptyRow(), createEmptyRow()]
    });

    // 터치 배치용 ID
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // ============================================================================
    // 데이터 로드
    // ============================================================================
    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/votes?status=completed');
            const data = res.data?.data || res.data?.votes || res.data || [];
            setActivities(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast('목록을 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchActivities(); }, [fetchActivities]);

    // 대진 조회 및 에디터 진입
    const handleOpenEditor = async (activity: AdminActivity) => {
        setLoading(true);
        try {
            const endpoint = activity.matchId 
                ? `/admin/matches/${activity.matchId}` 
                : `/admin/votes/${activity.voteId}/matches`;
                
            const res = await api.get(endpoint);
            const data = res.data?.data || res.data;

            console.log("🎯 [대진 조회 API 응답 데이터]:", data);

            if (!data) throw new Error('대진 데이터 응답이 없습니다.');

            setActiveVoteId(activity.voteId);
            setActivityTitle(activity.title);
            // 편성 완료 활동을 여는 것은 곧 "수정"이다 → 목록의 matchRegistered를 신뢰
            setIsEditMode(!!activity.matchRegistered);

            // 1. 응답 데이터 형태 정규화
            const rawMatchGroups = data.matches || data.matchGroups || data.courtMatches || [];

            // PATCH 대상 matchId를 응답의 여러 위치에서 최대한 찾아본다
            const firstGroup = Array.isArray(rawMatchGroups) ? rawMatchGroups[0] : undefined;
            const resolvedMatchId =
                data.matchId ?? data.id ?? data.match?.matchId ?? data.match?.id ??
                firstGroup?.matchId ?? firstGroup?.id ?? activity.matchId ?? null;
            setActiveMatchId(resolvedMatchId !== null ? Number(resolvedMatchId) : null);

            const allMatches: any[] = [];

            rawMatchGroups.forEach((item: any, index: number) => {
                if (item.team1 || item.team2) {
                    let cNum = item.courtNumber;
                    if (cNum === undefined || cNum === null) {
                        cNum = Math.floor(index / 2) + 1;
                    }
                    allMatches.push({
                        courtNumber: cNum,
                        matchNumber: item.matchNumber,
                        team1: item.team1,
                        team2: item.team2
                    });
                } else if (item.courtMatches || item.matches) {
                    const cNum = item.courtNumber || item.courtId || (index + 1);
                    const nestedMatches = item.courtMatches || item.matches || [];
                    nestedMatches.forEach((m: any, mIdx: number) => {
                        allMatches.push({
                            courtNumber: cNum,
                            matchNumber: m.matchNumber || mIdx + 1,
                            team1: m.team1,
                            team2: m.team2
                        });
                    });
                }
            });

            // 2. 전체 참가자 추출
            const uniqueParticipants = new Map<number, Participant>();
            const rawParticipants = data.participants || data.participantList || [];
            
            rawParticipants.forEach((p: any) => {
                const id = p.participantId ?? p.id ?? p.memberId;
                if (id !== undefined && id !== null) {
                    uniqueParticipants.set(Number(id), {
                        participantId: Number(id),
                        name: p.name,
                        gender: (p.gender === 'FEMALE' || p.gender === '여') ? 'FEMALE' : 'MALE',
                        participantType: p.participantType || 'MEMBER'
                    });
                }
            });

            let tempId = -1000;
            allMatches.forEach((match: any) => {
                const teams = [...(Array.isArray(match.team1) ? match.team1 : []), ...(Array.isArray(match.team2) ? match.team2 : [])];
                teams.forEach((t: any) => {
                    if (t && t.name) {
                        const exists = Array.from(uniqueParticipants.values()).find(p => p.name === t.name);
                        if (!exists) {
                            const newId = t.participantId ?? t.id ?? tempId--;
                            uniqueParticipants.set(Number(newId), {
                                participantId: Number(newId),
                                name: t.name,
                                gender: (t.gender === 'FEMALE' || t.gender === '여') ? 'FEMALE' : 'MALE',
                                participantType: t.participantType || 'MEMBER'
                            });
                        }
                    }
                });
            });

            const finalParticipants = Array.from(uniqueParticipants.values());
            setParticipants(finalParticipants);

            // 3. 대진표 및 로스터 화면 반영
            const newRosters: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
            const newBrackets: Record<number, BracketRow[]> = { 1: [], 2: [], 3: [], 4: [] };

            const resolveId = (member: any) => {
                if (!member) return null;
                // 백엔드가 객체를 줬을 경우
                if (typeof member === 'object') {
                    if (member.participantId !== undefined && member.participantId !== null) return Number(member.participantId);
                    if (member.id !== undefined && member.id !== null) return Number(member.id);
                    if (member.name) {
                        const found = finalParticipants.find(p => p.name === member.name);
                        if (found) return found.participantId;
                    }
                } else {
                    // 백엔드가 그냥 숫자 ID를 줬을 경우
                    return Number(member);
                }
                return null;
            };

            allMatches.forEach((match: any) => {
                const cNum = match.courtNumber;
                if (!newBrackets[cNum]) {
                    newBrackets[cNum] = [];
                    newRosters[cNum] = [];
                }

                const row: BracketRow = createEmptyRow();
                const t1 = Array.isArray(match.team1) ? match.team1 : [];
                const t2 = Array.isArray(match.team2) ? match.team2 : [];

                row[0] = resolveId(t1[0]);
                row[1] = resolveId(t1[1]);
                row[2] = resolveId(t2[0]);
                row[3] = resolveId(t2[1]);

                const targetIdx = match.matchNumber ? match.matchNumber - 1 : newBrackets[cNum].length;
                while (newBrackets[cNum].length <= targetIdx) {
                    newBrackets[cNum].push(createEmptyRow());
                }
                newBrackets[cNum][targetIdx] = row;

                row.forEach(id => {
                    if (id !== null && !newRosters[cNum].includes(id)) {
                        newRosters[cNum].push(id);
                    }
                });
            });

            [1, 2, 3, 4].forEach(cNum => {
                if (!newBrackets[cNum] || newBrackets[cNum].length === 0) {
                    newBrackets[cNum] = [createEmptyRow(), createEmptyRow()];
                }
            });

            setRosters(newRosters);
            setBrackets(newBrackets);
            
            const firstActive = Object.keys(newRosters).find(k => newRosters[Number(k)].length > 0);
            setActiveCourt(firstActive ? Number(firstActive) : 1);
            
            setView('EDITOR');
            setSelectedId(null);
        } catch (error) {
            console.error(error);
            showToast('대진표를 열 수 없습니다. 콘솔의 에러를 확인하세요.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // 에디터 핵심 제어 로직
    // ============================================================================

    const unassignedPool = useMemo(() => {
        const assignedIds = new Set(Object.values(rosters).flat());
        return participants.filter(p => !assignedIds.has(p.participantId));
    }, [participants, rosters]);

    const moveToCourt = (pId: number) => {
        setRosters(prev => ({ ...prev, [activeCourt]: [...prev[activeCourt], pId] }));
    };

    const removeFromCourt = (pId: number) => {
        if (selectedId === pId) setSelectedId(null);
        setRosters(prev => ({ ...prev, [activeCourt]: prev[activeCourt].filter(id => id !== pId) }));
        setBrackets(prev => {
            const updatedCourt = prev[activeCourt].map(row => row.map(id => id === pId ? null : id));
            return { ...prev, [activeCourt]: updatedCourt };
        });
    };

    const handleCellClick = (matchIndex: number, slotIndex: number, currentOccupantId: number | null) => {
        if (selectedId) {
            setBrackets(prev => {
                const newB = [...prev[activeCourt].map(r => [...r])];
                const currentRow = newB[matchIndex];

                for (let c = 0; c < 4; c++) {
                    if (currentRow[c] === selectedId) {
                        currentRow[c] = null;
                    }
                }

                currentRow[slotIndex] = selectedId;
                return { ...prev, [activeCourt]: newB };
            });
            setSelectedId(null); 
        } else if (currentOccupantId) {
            setBrackets(prev => {
                const newB = [...prev[activeCourt].map(r => [...r])];
                newB[matchIndex][slotIndex] = null;
                return { ...prev, [activeCourt]: newB };
            });
        }
    };

    const adjustMatchCount = (delta: 1 | -1) => {
        setBrackets(prev => {
            const current = [...prev[activeCourt]];
            if (delta === 1 && current.length < 15) current.push(createEmptyRow());
            if (delta === -1 && current.length > 1) current.pop();
            return { ...prev, [activeCourt]: current };
        });
    };

    const randomizeCourt = () => {
        const pool = [...rosters[activeCourt]];
        if (pool.length < 4) return showToast('코트에 최소 4명이 필요합니다.', 'error');

        setBrackets(prev => {
            const newMatches = prev[activeCourt].map(() => [null, null, null, null] as BracketRow);
            newMatches.forEach(row => {
                const shuffled = [...pool].sort(() => Math.random() - 0.5);
                row[0] = shuffled[0] || null;
                row[1] = shuffled[1] || null;
                row[2] = shuffled[2] || null;
                row[3] = shuffled[3] || null;
            });
            return { ...prev, [activeCourt]: newMatches };
        });
        setSelectedId(null);
    };

    // 💡 [핵심] 500 에러를 해결한 깔끔한 숫자 배열 Payload 생성 로직
    const handleSave = async () => {
        setLoading(true);
        try {
            const payload: CourtMatchGroup[] = [];
            
            Object.entries(brackets).forEach(([courtStr, rows]) => {
                const courtNumber = Number(courtStr);
                if (!rows.some(r => r.some(id => id !== null))) return;

                const courtMatches: ServerMatch[] = rows.map((row, idx) => {
                    return { 
                        matchNumber: idx + 1, 
                        // 배열 안의 널(null) 값을 쏙 빼고, 남은 순수 ID 숫자만 전송합니다.
                        team1: [row[0], row[1]].filter((id): id is number => id !== null), 
                        team2: [row[2], row[3]].filter((id): id is number => id !== null) 
                    };
                });
                
                payload.push({ courtNumber, courtMatches });
            });

            console.log("📤 [API 전송 데이터]:", payload);

            if (isEditMode && activeMatchId) {
                // 수정: matchId가 확보된 경우 PATCH
                await api.patch(`/admin/matches/${activeMatchId}`, payload);
                showToast('대진표가 성공적으로 수정되었습니다.', 'success');
            } else if (isEditMode) {
                // 편성 완료 활동이지만 matchId를 못 찾은 경우 → voteId 기준 재편성(업서트)로 저장
                await api.post(`/admin/votes/${activeVoteId}/matches`, payload);
                showToast('대진표가 저장되었습니다.', 'success');
            } else {
                // 신규 편성
                await api.post(`/admin/votes/${activeVoteId}/matches`, payload);
                showToast('대진표가 성공적으로 저장되었습니다.', 'success');
            }

            await fetchActivities();
            setView('LIST');
        } catch (error) {
            console.error(error);
            showToast('저장 중 오류가 발생했습니다. 콘솔을 확인하세요.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getParticipant = (id: number | null) => participants.find(p => p.participantId === id);

    // ============================================================================
    // 렌더링 영역
    // ============================================================================
    return (
        <div className="min-h-screen bg-[#F8FAF3] pb-24 sm:pb-12 text-gray-800">
            {loading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[999] flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#93C54B] mb-4" />
                    <span className="font-bold text-gray-600">데이터 처리 중...</span>
                </div>
            )}

            {/* --- 뷰 1: 활동 목록 --- */}
            {view === 'LIST' && (
                <div className="max-w-4xl mx-auto p-4 sm:p-8 pt-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">대진표 관리</h1>
                        <p className="text-gray-500 font-medium mt-2">투표가 마감된 활동의 대진표를 편성하고 수정하세요.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activities.map(act => (
                            <div key={act.voteId} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">{act.title}</h3>
                                    {act.matchRegistered ? (
                                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                            <CheckCircle2 className="w-3 h-3" /> 편성 완료
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                            미편성
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5 text-sm font-medium text-gray-500 flex-1">
                                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {act.activityDate} ({act.activityDay})</p>
                                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {act.location}</p>
                                    <p className="flex items-center gap-2 mt-2"><Users className="w-4 h-4 text-[#93C54B]" /> 총 {act.attendance.totalParticipants}명 참석</p>
                                </div>
                                <button
                                    onClick={() => handleOpenEditor(act)}
                                    className={`w-full mt-6 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                        act.matchRegistered 
                                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                                        : 'bg-[#93C54B] text-white hover:bg-[#81b23c] shadow-lg shadow-[#93C54B]/20'
                                    }`}
                                >
                                    {act.matchRegistered ? '대진표 수정하기' : '새 대진표 작성하기'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 뷰 2: 에디터 --- */}
            {view === 'EDITOR' && (
                <div className="max-w-6xl mx-auto flex flex-col h-[100dvh] sm:h-auto sm:p-8">
                    {/* 상단 헤더 바 */}
                    <div className="bg-white px-4 py-4 sm:rounded-t-3xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('LIST')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-black text-gray-900">{activityTitle}</h2>
                                    {isEditMode && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-[6px] text-[10px] font-black tracking-wide">
                                            수정 모드
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-gray-400 mt-0.5">명단을 누르고, 빈칸을 눌러 바로 배치하세요.</p>
                            </div>
                        </div>
                        
                        <button onClick={handleSave} className={`flex items-center gap-1.5 text-white px-5 py-2.5 sm:px-6 rounded-xl text-sm font-bold active:scale-95 shadow-md transition-colors ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                            {isEditMode ? <Edit3 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {isEditMode ? '수정하기' : '저장하기'}
                        </button>
                    </div>

                    {/* 코트 탭 */}
                    <div className="bg-white px-4 py-3 flex gap-2 border-b border-gray-100 overflow-x-auto hide-scrollbar shrink-0">
                        {[1, 2, 3, 4].map(cNum => (
                            <button
                                key={cNum}
                                onClick={() => { setActiveCourt(cNum); setSelectedId(null); }}
                                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                                    activeCourt === cNum 
                                    ? 'bg-[#93C54B] text-white shadow-sm' 
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {cNum}코트 <span className="ml-1 text-[11px] opacity-70">({rosters[cNum].length}명)</span>
                            </button>
                        ))}
                    </div>

                    {/* 콘텐츠 영역 (스크롤 가능) */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:bg-white sm:rounded-b-3xl sm:border sm:border-t-0 sm:border-gray-100 space-y-6">
                        
                        {/* 1. 미배치 풀 */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-800 mb-3 flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4 text-gray-400" /> 대기석 (미배치 인원)
                            </h3>
                            {unassignedPool.length === 0 ? (
                                <p className="text-[11px] text-gray-400 font-medium">모든 인원이 코트에 배치되었습니다.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {unassignedPool.map(p => (
                                        <button 
                                            key={p.participantId} 
                                            onClick={() => moveToCourt(p.participantId)}
                                            className="bg-white border border-gray-200 hover:border-[#93C54B] hover:text-[#93C54B] px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                        >
                                            {p.name} <span className={p.gender === 'MALE' ? 'text-blue-500' : 'text-red-400'}>{p.gender === 'MALE' ? 'M' : 'W'}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. 현재 코트 로스터 */}
                        <div className={`rounded-2xl p-4 shadow-sm border-2 transition-colors ${selectedId ? 'border-[#93C54B] bg-[#93C54B]/5' : 'border-[#93C54B]/20 bg-[#93C54B]/5'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-[#6d9434] flex items-center gap-1.5">
                                    <Users className="w-4 h-4" /> {activeCourt}코트 명단 
                                    <span className="text-gray-500 opacity-60 ml-1 font-medium">(터치하여 선택 후 아래 빈칸에 넣으세요)</span>
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {rosters[activeCourt].map(pId => {
                                    const p = getParticipant(pId);
                                    if (!p) return null;
                                    const isSelected = selectedId === pId;
                                    return (
                                        <div 
                                            key={pId}
                                            onClick={() => setSelectedId(isSelected ? null : pId)}
                                            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm border-2 ${
                                                isSelected 
                                                ? 'bg-[#93C54B] text-white border-[#93C54B] scale-105 shadow-md' 
                                                : 'bg-white border-white text-gray-700 hover:border-[#93C54B]/30'
                                            }`}
                                        >
                                            <span>{p.name}</span>
                                            <span className={`text-[10px] ${isSelected ? 'text-white/80' : (p.gender === 'MALE' ? 'text-blue-500' : 'text-red-400')}`}>
                                                {p.gender === 'MALE' ? 'M' : 'W'}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFromCourt(pId); }} 
                                                className={`ml-1 w-4 h-4 flex items-center justify-center rounded-full ${isSelected ? 'bg-black/20 hover:bg-black/40' : 'bg-gray-100 hover:bg-red-100 hover:text-red-500'} transition-colors`}
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. 대진표 (Bracket) */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    <button onClick={() => adjustMatchCount(-1)} className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-500 font-black shadow-sm">-</button>
                                    <span className="w-8 text-center text-xs font-bold">{brackets[activeCourt].length} G</span>
                                    <button onClick={() => adjustMatchCount(1)} className="w-7 h-7 bg-white rounded flex items-center justify-center text-gray-500 font-black shadow-sm">+</button>
                                </div>
                                <button onClick={randomizeCourt} className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                    🔀 랜덤 배치
                                </button>
                            </div>

                            <div className="space-y-3">
                                {brackets[activeCourt].map((row, matchIdx) => (
                                    <div key={matchIdx} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <div className="text-[10px] font-black text-gray-300 w-full sm:w-6 text-center">G{matchIdx + 1}</div>
                                        
                                        {/* TEAM 1 */}
                                        <div className="flex gap-2 w-full sm:flex-1">
                                            {[0, 1].map(slotIdx => {
                                                const pId = row[slotIdx];
                                                const p = getParticipant(pId);
                                                return (
                                                    <div 
                                                        key={slotIdx}
                                                        onClick={() => handleCellClick(matchIdx, slotIdx, pId)}
                                                        className={`flex-1 h-12 flex flex-col items-center justify-center rounded-lg border-2 text-[11px] font-bold cursor-pointer transition-all ${
                                                            pId 
                                                            ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' 
                                                            : (selectedId ? 'border-dashed border-[#93C54B] bg-[#93C54B]/10 animate-pulse' : 'border-dashed border-gray-200 bg-white text-gray-300')
                                                        }`}
                                                    >
                                                        {p ? (
                                                            <>
                                                                <span>{p.name}</span>
                                                                <span className="text-[9px] opacity-60 font-medium">{p.participantType === 'GUEST' ? '게스트' : '회원'}</span>
                                                            </>
                                                        ) : (selectedId ? '여기에 놓기' : '빈 자리')}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="text-xs font-black text-gray-300">VS</div>

                                        {/* TEAM 2 */}
                                        <div className="flex gap-2 w-full sm:flex-1">
                                            {[2, 3].map(slotIdx => {
                                                const pId = row[slotIdx];
                                                const p = getParticipant(pId);
                                                return (
                                                    <div 
                                                        key={slotIdx}
                                                        onClick={() => handleCellClick(matchIdx, slotIdx, pId)}
                                                        className={`flex-1 h-12 flex flex-col items-center justify-center rounded-lg border-2 text-[11px] font-bold cursor-pointer transition-all ${
                                                            pId 
                                                            ? 'bg-red-50 border-red-200 text-red-900 shadow-sm' 
                                                            : (selectedId ? 'border-dashed border-[#93C54B] bg-[#93C54B]/10 animate-pulse' : 'border-dashed border-gray-200 bg-white text-gray-300')
                                                        }`}
                                                    >
                                                        {p ? (
                                                            <>
                                                                <span>{p.name}</span>
                                                                <span className="text-[9px] opacity-60 font-medium">{p.participantType === 'GUEST' ? '게스트' : '회원'}</span>
                                                            </>
                                                        ) : (selectedId ? '여기에 놓기' : '빈 자리')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
