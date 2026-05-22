'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import api from '../../../lib/axios';

// --- 명세서 Success Response 기반 데이터 인터페이스 정의 ---
interface Participant {
    participantId: number;
    participantType: 'MEMBER' | 'GUEST';
    name: string;
    gender: 'MALE' | 'FEMALE';
}

interface AttendanceSummary {
    currentAttendees: number;
    currentGuests: number;
    totalParticipants: number;
}

interface AdminActivity {
    voteId: number;
    title: string;
    activityDay: string;
    activityDate: string;
    location: string;
    attendance: AttendanceSummary;
}

interface TeamMember {
    participantType: 'MEMBER' | 'GUEST';
    participantId: number;
}

interface ServerMatch {
    matchNumber: number;
    team1: TeamMember[];
    team2: TeamMember[];
}

interface CourtMatchGroup {
    courtNumber: number;
    courtMatches: ServerMatch[];
}

interface TournamentDetailResponse {
    voteId: number;
    totalCount: number;
    participants: Participant[];
}

// 대진표 셀 한 칸에 들어갈 로컬 가독성용 타입
interface LocalParticipant {
    participantId: number;
    name: string;
    gender: '남' | '여';
    participantType: 'MEMBER' | 'GUEST';
}

type BracketRow = (LocalParticipant | null)[];

export default function TournamentPage() {
    // API 통신 상태 제어
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null);
    const [participantsPool, setParticipantsPool] = useState<LocalParticipant[]>([]);
    const [matchId, setMatchId] = useState<number | null>(null); // 명세서상의 matchId 보관
    
    const [currentCourt, setCurrentCourt] = useState('1코트');
    const [completedActivityIds, setCompletedActivityIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [mobileStep, setMobileStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // 코트별 담겨있는 인원 명단 상태 (대진 폼 상단 박스용)
    const [assignments, setAssignments] = useState<Record<string, LocalParticipant[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    const createEmptyRow = (): BracketRow => [null, null, null, null];
    const initialBracket = (): BracketRow[] => [
        createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()
    ];
    
    // 핵심 대진표 그리드 매트릭스 상태
    const [courtBrackets, setCourtBrackets] = useState<Record<string, BracketRow[]>>({
        '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
    });

    // 화면 크기 체크 (모바일 가드)
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // [API 1] 투표 완료된 전체 활동 목록 로드
    const fetchAdminActivities = useCallback(async () => {
        setLoading(true);
        try {
            // 명세서에 표시된 엔드포인트 /admin/votes?status=completed 호환 맵핑
            const response = await api.get<AdminActivity[]>('/admin/votes', {
                params: { status: 'completed' }
            });
            if (Array.isArray(response.data)) {
                setActivities(response.data);
            }
        } catch (err) {
            console.error('Fetch Admin Activities Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminActivities();
    }, [fetchAdminActivities]);

    // 전체 진도율 계산 유틸
    const progress = useMemo(() => {
        const totalSlots = Object.values(courtBrackets).flat(2).length;
        if (totalSlots === 0) return 0;
        const filledSlots = Object.values(courtBrackets).flat(2).filter(n => n !== null).length;
        return Math.floor((filledSlots / totalSlots) * 100);
    }, [courtBrackets]);

    // [API 2] 특정 모임 선택 시 참여 부원 명단 및 기존 매치 상세 정보 로드
    const handleSelectActivity = async (activity: AdminActivity) => {
        setLoading(true);
        try {
            // 1. 기존 상태값 완전 초기화
            setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
            setCourtBrackets({ 
                '1코트': initialBracket(), '2코트': initialBracket(), 
                '3코트': initialBracket(), '4코트': initialBracket() 
            });
            setCurrentCourt('1코트');
            setMobileStep(1);

            // 2. 명세서에 표기된 엔드포인트인 /admin/votes/{voteId}/matches 호출 실행
            const response = await api.get<TournamentDetailResponse>(`/admin/votes/${activity.voteId}/matches`);
            
            if (response.data) {
                // 서버 성별 이늄(MALE/FEMALE)을 클라이언트용(남/여) 규격으로 치환 파싱
                const parsedParticipants: LocalParticipant[] = (response.data.participants || []).map(p => ({
                    participantId: p.participantId,
                    name: p.name,
                    gender: p.gender === 'MALE' ? '남' : '여',
                    participantType: p.participantType
                }));
                
                setParticipantsPool(parsedParticipants);
                setSelectedActivity(activity);
                
                // 만약 서버에서 기존에 저장해둔 대진표 데이터가 있다면 matchId를 함께 셋업합니다.
                if ((response.data as any).matchId) {
                    setMatchId((response.data as any).matchId);
                } else {
                    setMatchId(activity.voteId); // 폴백 키 가드
                }
            }
        } catch (err) {
            console.error('Fetch Tournament Details Error:', err);
            alert('대진 세부 정보 및 참가자 명단을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 게임 수 조절 핸들러 (+ / -)
    const handleMatchCount = (type: 'plus' | 'minus') => {
        if (currentCourt === '전체') return;
        setCourtBrackets(prev => {
            const currentRows = [...prev[currentCourt]];
            if (type === 'plus') {
                if (currentRows.length >= 10) return prev;
                return { ...prev, [currentCourt]: [...currentRows, createEmptyRow()] };
            } else {
                if (currentRows.length <= 1) return prev;
                return { ...prev, [currentCourt]: currentRows.slice(0, -1) };
            }
        });
    };

    // 상단 코트 배치 박스 배정 핸들러
    const handleAssign = (person: LocalParticipant) => {
        if (currentCourt === '전체') return;
        if (assignments[currentCourt].some(p => p.participantId === person.participantId)) return;
        setAssignments(prev => ({ ...prev, [currentCourt]: [...prev[currentCourt], person] }));
    };

    // 배정 인원 취소 및 셀 내용 클리어 핸들러
    const handleRemoveMember = (court: string, person: LocalParticipant) => {
        setAssignments(prev => ({ ...prev, [court]: prev[court].filter(p => p.participantId !== person.participantId) }));
        setCourtBrackets(prev => {
            const updated = prev[court].map(row => row.map(cell => cell?.participantId === person.participantId ? null : cell));
            return { ...prev, [court]: updated };
        });
    };

    // 드롭존 배치 핸들러
    const onDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('memberData');
        if (data) {
            const person: LocalParticipant = JSON.parse(data);
            if (courtBrackets[currentCourt][row].some(cell => cell?.participantId === person.participantId)) {
                alert(`[중복] ${person.name}님은 이미 이 경기에 배치되어 있습니다.`);
                return;
            }
            setCourtBrackets(prev => {
                const newB = [...prev[currentCourt].map(r => [...r])];
                newB[row][col] = person;
                return { ...prev, [currentCourt]: newB };
            });
        }
    };

    // 랜덤 배치 엔진 로직
    const handleRandomAssign = () => {
        const currentMembers = assignments[currentCourt];
        if (currentMembers.length < 4) return alert('최소 4명의 멤버가 필요합니다.');
        
        const rowCount = courtBrackets[currentCourt].length;
        const newBracket: BracketRow[] = [];
        let pool: LocalParticipant[] = [];

        for (let r = 0; r < rowCount; r++) {
            const currentRow: BracketRow = [null, null, null, null];
            for (let c = 0; c < 4; c++) {
                if (pool.length === 0) {
                    pool = [...currentMembers].sort(() => Math.random() - 0.5);
                }
                let candidateIdx = pool.findIndex(p => !currentRow.some(cell => cell?.participantId === p.participantId));
                if (candidateIdx === -1) {
                    pool = [...currentMembers].sort(() => Math.random() - 0.5);
                    candidateIdx = 0;
                }
                currentRow[c] = pool.splice(candidateIdx, 1)[0];
            }
            newBracket.push(currentRow);
        }
        setCourtBrackets(prev => ({ ...prev, [currentCourt]: newBracket }));
    };

    // [API 3] 대진 확정 저장 및 전체 전송 (PUT /admin/matches/{matchId})
    const handleSaveTournament = async () => {
        if (!selectedActivity) return;
        
        setLoading(true);
        try {
            // 명세서 Request Body 구조에 맞춰 다차원 JSON 객체 직렬화 빌드
            const payload: CourtMatchGroup[] = Object.entries(courtBrackets).map(([courtName, rows]) => {
                // '1코트', '2코트' 문자열에서 순수 숫자형 추출
                const courtNumber = parseInt(courtName.replace(/[^0-9]/g, ''), 10) || 1;
                
                const courtMatches: ServerMatch[] = rows.map((row, index) => {
                    // team1 구성 (셀 0, 셀 1)
                    const team1: TeamMember[] = [];
                    if (row[0]) team1.push({ participantType: row[0].participantType, participantId: row[0].participantId });
                    if (row[1]) team1.push({ participantType: row[1].participantType, participantId: row[1].participantId });
                    
                    // team2 구성 (셀 2, 셀 3)
                    const team2: TeamMember[] = [];
                    if (row[2]) team2.push({ participantType: row[2].participantType, participantId: row[2].participantId });
                    if (row[3]) team2.push({ participantType: row[3].participantType, participantId: row[3].participantId });

                    return {
                        matchNumber: index + 1,
                        team1,
                        team2
                    };
                });

                return {
                    courtNumber,
                    courtMatches
                };
            });

            const targetMatchId = matchId || selectedActivity.voteId;
            
            // 명세서 상의 PUT /admin/matches/{matchId} 스펙 결속 통신
            const response = await api.put(`/admin/matches/${targetMatchId}`, payload);

            if (response.status === 200 || response.status === 204) {
                alert('대진 정보가 서버에 최종 저장 및 확정 전송되었습니다.');
                setCompletedActivityIds(prev => [...prev, selectedActivity.voteId]);
                setSelectedActivity(null);
            }
        } catch (err) {
            console.error('Save Tournament Error:', err);
            alert('대진 정보를 전송하는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 어떤 코트에도 아직 지정되지 않은 잔여 인원 필터링 계산
    const unassigned = useMemo(() => {
        return participantsPool.filter(
            (p) => !Object.values(assignments).flat().some(a => a.participantId === p.participantId)
        );
    }, [participantsPool, assignments]);

    return (
        <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6 text-left pb-20 select-none">
            {loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[999] flex items-center justify-center font-bold text-gray-500 text-sm">
                    데이터 동기화 중...
                </div>
            )}

            {!selectedActivity ? (
                <div className="space-y-4 sm:space-y-6">
                    <header>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">대진 관리</h1>
                        <p className="text-sm sm:text-base text-gray-500 font-medium">참가 투표가 완료된 활동을 선택하세요.</p>
                    </header>
                    <div className="grid grid-cols-1 gap-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.voteId} onClick={() => handleSelectActivity(activity)} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:border-blue-500 cursor-pointer transition-all relative group">
                                    {completedActivityIds.includes(activity.voteId) && (
                                        <span className="absolute top-4 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">완료</span>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{activity.title}</h3>
                                    <p className="text-sm text-gray-400 mt-2 font-medium">
                                        📅 날짜: {activity.activityDate} ({activity.activityDay}) | 📍 장소: {activity.location}
                                    </p>
                                    <div className="mt-3 flex items-center gap-3 text-xs font-bold text-gray-500">
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">회원 {activity.attendance.currentAttendees}명</span>
                                        <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">게스트 {activity.attendance.currentGuests}명</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-700">총 {activity.attendance.totalParticipants}명 참여 투표 완료</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-gray-200 text-gray-400 font-bold text-sm">
                                현재 대진표 작성이 필요한 완료 모임이 존재하지 않습니다.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
                        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedActivity.title}</h1>
                                <button onClick={() => setSelectedActivity(null)} className="text-gray-400 text-sm font-bold mt-2 hover:text-gray-600 transition-colors flex items-center gap-1">← 목록으로 돌아가기</button>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-[#dadada]">
                                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">전체 진행도</span>
                                <div className="w-24 sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden flex items-center">
                                    <div className="h-full bg-[#8DE45C] transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-base sm:text-lg font-bold text-gray-800 w-12">{progress}%</span>
                            </div>
                        </header>

                        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-fit mb-6 sm:mb-8 overflow-x-auto gap-1">
                            {['1코트', '2코트', '3코트', '4코트', '전체'].map(c => (
                                <button key={c} onClick={() => { setCurrentCourt(c); setMobileStep(1); }} className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${currentCourt === c ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        {(!isMobile || (currentCourt !== '전체' && mobileStep === 1)) && (
                            <div className="animate-in fade-in">
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">미배치 인원 ({unassigned.length})</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {unassigned.map((p) => (
                                            <button key={p.participantId} onClick={() => handleAssign(p)} className="bg-white border border-gray-100 px-3 py-2 rounded-xl text-xs flex justify-between items-center hover:border-blue-500 shadow-sm transition active:scale-95">
                                                <span className="font-bold text-gray-700 truncate">{p.name}</span>
                                                <span className={`text-[10px] font-black ml-1 ${p.gender === '남' ? 'text-blue-500' : 'text-red-500'}`}>
                                                    {p.gender === '남' ? '♂' : '♀'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {currentCourt !== '전체' && (
                                    <div className="bg-blue-50/50 rounded-xl p-4 sm:p-6 border-2 border-dashed border-blue-100">
                                        <p className="text-xs font-bold text-blue-500 mb-4">현재 코트 배치 멤버 (대진표 작성용)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {assignments[currentCourt].map(p => (
                                                <div 
                                                    key={p.participantId} 
                                                    draggable 
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('memberData', JSON.stringify(p));
                                                    }} 
                                                    className="bg-white border-2 border-blue-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-grab shadow-sm transition active:scale-95"
                                                >
                                                    <span>{p.name}</span>
                                                    <span className="text-[10px] opacity-40 font-medium">{p.gender}</span>
                                                    <button onClick={() => handleRemoveMember(currentCourt, p)} className="text-gray-300 hover:text-red-500 font-bold ml-1">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {isMobile && currentCourt !== '전체' && assignments[currentCourt].length >= 4 && (
                                    <button onClick={() => setMobileStep(2)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition">
                                        대진표 작성하러 가기 ({assignments[currentCourt].length}명 확정) →
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {currentCourt === '전체' ? (
                        <section className="animate-in fade-in duration-500 space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-bold text-blue-600">전체 코트 대진 현황</h3>
                                <button onClick={handleSaveTournament} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors">
                                    대진 확정 및 전송
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 bg-gray-50 rounded-3xl">
                                {Object.entries(courtBrackets).map(([courtName, rows]) => (
                                    <div key={courtName} className="bg-white border border-gray-100 rounded-[24px] p-4 sm:p-6 shadow-sm">
                                        <span className="text-base font-bold text-gray-800 border-b pb-3 block mb-4">{courtName}</span>
                                        <div className="space-y-2">
                                            {rows.map((row, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-[12px] font-bold text-gray-700 border border-gray-100">
                                                    <div className="flex-1 text-center truncate">{row[0]?.name || '-'}:{row[1]?.name || '-'}</div>
                                                    <span className="text-[10px] text-gray-300 mx-2 font-black">VS</span>
                                                    <div className="flex-1 text-center truncate">{row[2]?.name || '-'}:{row[3]?.name || '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        (!isMobile || mobileStep === 2) && (
                            <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 animate-in slide-in-from-right-4">
                                {isMobile && (
                                    <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border-2 border-dashed border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-500 mb-3 uppercase tracking-wider">배정된 멤버 (아래 칸으로 드래그)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {assignments[currentCourt].map(p => (
                                                <div key={p.participantId} className="bg-white border border-blue-100 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm">
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        {isMobile && <button onClick={() => setMobileStep(1)} className="p-2 text-gray-400 font-bold">← 뒤로</button>}
                                        <h3 className="text-base sm:text-xl font-bold text-gray-800">{currentCourt} 대진표</h3>
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                            <button onClick={() => handleMatchCount('minus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg font-black hover:bg-gray-100 transition-colors">-</button>
                                            <span className="text-sm font-bold w-6 text-center">{courtBrackets[currentCourt].length}</span>
                                            <button onClick={() => handleMatchCount('plus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg font-black hover:bg-gray-100 transition-colors">+</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleRandomAssign} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none transition hover:bg-blue-700 shadow-sm">랜덤 배치</button>
                                        <button onClick={() => setCourtBrackets(prev => ({ ...prev, [currentCourt]: initialBracket() }))} className="bg-white border text-red-600 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none hover:bg-red-50 transition shadow-sm">비우기</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[24px] p-4 sm:p-12 space-y-4 sm:space-y-6 shadow-md border border-gray-50">
                                    {courtBrackets[currentCourt].map((rowArr, rowIndex) => (
                                        <div key={rowIndex} className="flex items-center justify-center gap-2 sm:gap-4 animate-in slide-in-from-top-2">
                                            <span className="text-[11px] font-black text-gray-300 w-6 sm:w-8 uppercase tracking-tighter">G{rowIndex + 1}</span>
                                            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                    <BracketCell person={rowArr[0]} onDrop={(e: any) => onDrop(e, rowIndex, 0)} onClear={() => { const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][0] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                    <BracketCell person={rowArr[1]} onDrop={(e: any) => onDrop(e, rowIndex, 1)} onClear={() => { const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][1] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                </div>
                                                <span className="text-xl sm:text-3xl font-black text-gray-200">:</span>
                                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                    <BracketCell person={rowArr[2]} onDrop={(e: any) => onDrop(e, rowIndex, 2)} onClear={() => { const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][2] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                    <BracketCell person={rowArr[3]} onDrop={(e: any) => onDrop(e, rowIndex, 3)} onClear={() => { const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][3] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {isMobile && (
                                    <div className="mt-8 flex gap-3">
                                        <button onClick={() => setMobileStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold">인원 수정</button>
                                        <button onClick={() => setCurrentCourt('전체')} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold">전체 코트 확인</button>
                                    </div>
                                )}
                            </section>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

function BracketCell({ person, onDrop, onClear }: any) {
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`w-full sm:w-32 h-12 sm:h-14 rounded-xl border-2 flex items-center justify-center relative transition-all ${
                person ? 'border-green-400 bg-green-50/70 shadow-sm' : 'border-gray-100 bg-gray-50 border-dashed'
            }`}
        >
            {person ? (
                <>
                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm font-black text-gray-800 truncate px-1 max-w-[80px] sm:max-w-none">{person.name}</span>
                        <span className={`text-[8px] sm:text-[9px] font-bold ${person.gender === '남' ? 'text-blue-500' : 'text-red-500'}`}>
                            {person.gender} ({person.participantType === 'GUEST' ? '게스트' : '회원'})
                        </span>
                    </div>
                    <button onClick={onClear} className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:text-red-500 transition-colors font-black">✕</button>
                </>
            ) : <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase tracking-wider">Drop</span>}
        </div>
    );
}