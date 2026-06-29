'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, MapPin, CheckCircle2, UserPlus, Users, X, RefreshCw, Save, ArrowLeft } from 'lucide-react';
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
    title: string;
    activityDay: string;
    activityDate: string;
    location: string;
    matchRegistered: boolean;
    attendance: { currentAttendees: number; currentGuests: number; totalParticipants: number };
}

// ============================================================================
// 2. 메인 컴포넌트
// ============================================================================
export default function TournamentPage() {
    const { showToast } = useToast();

    // --- 앱 전체 상태 ---
    const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<AdminActivity[]>([]);

    // --- 에디터 전용 상태 ---
    const [activeVoteId, setActiveVoteId] = useState<number | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<number | null>(null); // 수정 모드 판별용
    const [activityTitle, setActivityTitle] = useState('');
    const [activeCourt, setActiveCourt] = useState<number>(1); // 1, 2, 3, 4
    const [participants, setParticipants] = useState<Participant[]>([]);
    
    // 코트별 명단: Record<코트번호, participantId[]>
    const [rosters, setRosters] = useState<Record<number, number[]>>({ 1: [], 2: [], 3: [], 4: [] });
    // 코트별 대진표: Record<코트번호, 매치배열[팀1_1, 팀1_2, 팀2_1, 팀2_2]> (ID 저장, null은 빈칸)
    const [brackets, setBrackets] = useState<Record<number, (number | null)[][]>>({
        1: [[null, null, null, null], [null, null, null, null]],
        2: [[null, null, null, null], [null, null, null, null]],
        3: [[null, null, null, null], [null, null, null, null]],
        4: [[null, null, null, null], [null, null, null, null]]
    });

    // 클릭 배치용 선택된 유저 ID
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // ============================================================================
    // 데이터 로드: 리스트 및 상세
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

    // 대진 상세 조회 및 화면 복구 (Hydration)
    const handleOpenEditor = async (activity: AdminActivity) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/votes/${activity.voteId}/matches`);
            const data = res.data?.data || res.data;

            if (!data || !data.participants) throw new Error('참가자 데이터가 없습니다.');

            setActiveVoteId(activity.voteId);
            setActivityTitle(activity.title);
            setActiveMatchId(data.matchId || null);

            // 참가자 전체 풀 저장
            setParticipants(data.participants);

            // 구조 초기화
            const newRosters: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [] };
            const newBrackets: Record<number, (number | null)[][]> = {
                1: [[null, null, null, null]], 2: [[null, null, null, null]],
                3: [[null, null, null, null]], 4: [[null, null, null, null]]
            };

            const matchGroups = data.matches || [];
            matchGroups.forEach((mg: any) => {
                const cNum = mg.courtNumber || 1;
                const cMatches = mg.courtMatches || [];
                newBrackets[cNum] = [];

                cMatches.forEach((match: any, idx: number) => {
                    const row: (number | null)[] = [null, null, null, null];
                    
                    const t1 = Array.isArray(match.team1) ? match.team1 : [];
                    const t2 = Array.isArray(match.team2) ? match.team2 : [];

                    if (t1[0]?.participantId) row[0] = t1[0].participantId;
                    if (t1[1]?.participantId) row[1] = t1[1].participantId;
                    if (t2[0]?.participantId) row[2] = t2[0].participantId;
                    if (t2[1]?.participantId) row[3] = t2[1].participantId;

                    newBrackets[cNum].push(row);

                    // 로스터(코트 명단) 채우기
                    row.forEach(id => {
                        if (id && !newRosters[cNum].includes(id)) newRosters[cNum].push(id);
                    });
                });
                
                // 빈 게임이 없으면 최소 1개는 생성
                if (newBrackets[cNum].length === 0) newBrackets[cNum].push([null, null, null, null]);
            });

            setRosters(newRosters);
            setBrackets(newBrackets);
            
            // 데이터가 존재하는 첫 번째 코트로 이동, 없으면 1코트
            const firstActive = Object.keys(newRosters).find(k => newRosters[Number(k)].length > 0);
            setActiveCourt(firstActive ? Number(firstActive) : 1);
            
            setView('EDITOR');
        } catch (error) {
            console.error(error);
            showToast('대진표를 열 수 없습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // 에디터 핵심 로직 (배치 및 제어)
    // ============================================================================

    // 1. 전체 풀에서 미배치 인원 도출
    const unassignedPool = useMemo(() => {
        const assignedIds = new Set(Object.values(rosters).flat());
        return participants.filter(p => !assignedIds.has(p.participantId));
    }, [participants, rosters]);

    // 2. 미배치 인원 -> 현재 코트로 이동
    const moveToCourt = (pId: number) => {
        setRosters(prev => ({ ...prev, [activeCourt]: [...prev[activeCourt], pId] }));
    };

    // 3. 코트 로스터 -> 미배치로 복귀 (대진표에서도 삭제)
    const removeFromCourt = (pId: number) => {
        if (selectedId === pId) setSelectedId(null);
        
        setRosters(prev => ({ ...prev, [activeCourt]: prev[activeCourt].filter(id => id !== pId) }));
        setBrackets(prev => {
            const updatedCourt = prev[activeCourt].map(row => row.map(id => id === pId ? null : id));
            return { ...prev, [activeCourt]: updatedCourt };
        });
    };

    // 4. 대진표 셀 클릭 시 (선택된 멤버 배치 or 배치 해제)
    const handleCellClick = (matchIndex: number, slotIndex: number, currentOccupantId: number | null) => {
        // 경우 1: 칸에 사람이 있고, 현재 선택한 사람이 없을 때 -> 사람 빼기
        if (currentOccupantId && !selectedId) {
            setBrackets(prev => {
                const newB = [...prev[activeCourt].map(r => [...r])];
                newB[matchIndex][slotIndex] = null;
                return { ...prev, [activeCourt]: newB };
            });
            return;
        }

        // 경우 2: 사람을 선택한 상태에서 칸을 클릭 -> 사람 넣기
        if (selectedId) {
            // 이미 다른 칸에 들어있는지 확인 후 이동 처리
            setBrackets(prev => {
                const newB = [...prev[activeCourt].map(r => [...r])];
                // 기존 위치 지우기
                for (let r = 0; r < newB.length; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (newB[r][c] === selectedId) newB[r][c] = null;
                    }
                }
                // 새 위치에 할당
                newB[matchIndex][slotIndex] = selectedId;
                return { ...prev, [activeCourt]: newB };
            });
            setSelectedId(null); // 선택 해제
        }
    };

    // 5. 경기(Match) 추가 / 삭제
    const adjustMatchCount = (delta: 1 | -1) => {
        setBrackets(prev => {
            const current = [...prev[activeCourt]];
            if (delta === 1 && current.length < 10) current.push([null, null, null, null]);
            if (delta === -1 && current.length > 1) current.pop();
            return { ...prev, [activeCourt]: current };
        });
    };

    // 6. 코트 내 랜덤 배치 (로스터 인원들을 대진표에 무작위로 뿌림)
    const randomizeCourt = () => {
        const pool = [...rosters[activeCourt]];
        if (pool.length < 4) return showToast('코트에 최소 4명이 필요합니다.', 'error');

        setBrackets(prev => {
            const newMatches = prev[activeCourt].map(() => [null, null, null, null] as (number | null)[]);
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

    // 7. 서버 저장 (POST / PATCH)
    const handleSave = async () => {
        setLoading(true);
        try {
            const payload: any[] = [];
            
            Object.entries(brackets).forEach(([courtStr, rows]) => {
                const courtNumber = Number(courtStr);
                // 완전히 빈 대진표는 전송 생략
                if (!rows.some(r => r.some(id => id !== null))) return;

                const courtMatches = rows.map((row, idx) => {
                    const getP = (id: number | null) => {
                        if (!id) return null;
                        const p = participants.find(x => x.participantId === id);
                        return p ? { participantType: p.participantType, participantId: p.participantId } : null;
                    };
                    
                    const team1 = [getP(row[0]), getP(row[1])].filter(Boolean);
                    const team2 = [getP(row[2]), getP(row[3])].filter(Boolean);
                    
                    return { matchNumber: idx + 1, team1, team2 };
                });

                payload.push({ courtNumber, courtMatches });
            });

            if (activeMatchId) {
                await api.patch(`/admin/matches/${activeMatchId}`, payload);
                showToast('대진표가 성공적으로 수정되었습니다.', 'success');
            } else {
                await api.post(`/admin/votes/${activeVoteId}/matches`, payload);
                showToast('대진표가 성공적으로 저장되었습니다.', 'success');
            }

            // 목록 새로고침 후 리스트 뷰로 이동
            await fetchActivities();
            setView('LIST');
        } catch (error) {
            showToast('저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // UI Helper: ID로 사람 이름/성별 찾기
    const getParticipant = (id: number | null) => participants.find(p => p.participantId === id);

    // ============================================================================
    // 렌더링 영역
    // ============================================================================
    return (
        <div className="min-h-screen bg-[#F8FAF3] pb-24 sm:pb-12 text-gray-800">
            {loading && (
                <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[999] flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#93C54B] mb-4" />
                    <span className="font-bold text-gray-600">데이터 동기화 중...</span>
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
                                <h2 className="text-lg font-black">{activityTitle}</h2>
                                <p className="text-[11px] font-bold text-gray-400">터치하여 명단을 코트에 넣고, 대진표 빈칸에 배치하세요.</p>
                            </div>
                        </div>
                        <button onClick={handleSave} className="flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-sm font-bold active:scale-95 shadow-md">
                            <Save className="w-4 h-4" /> 저장
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
                        
                        {/* 1. 미배치 풀 -> 코트로 영입 */}
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

                        {/* 2. 현재 코트 로스터 (여기서 사람을 눌러 선택) */}
                        <div className={`rounded-2xl p-4 shadow-sm border-2 transition-colors ${selectedId ? 'border-[#93C54B] bg-[#93C54B]/5' : 'border-[#93C54B]/20 bg-[#93C54B]/5'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-[#6d9434] flex items-center gap-1.5">
                                    <Users className="w-4 h-4" /> {activeCourt}코트 명단 
                                    <span className="text-gray-500 opacity-60 ml-1 font-medium">(터치하여 선택 후 아래 대진표 빈칸에 넣으세요)</span>
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
                                    🔀 랜덤 섞기
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
