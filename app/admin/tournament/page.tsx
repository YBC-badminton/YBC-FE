'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';

// ============================================================================
// 1. 타입 정의 (Types)
// ============================================================================
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
    matchRegistered: boolean;
}

interface TeamMember {
    participantType: 'MEMBER' | 'GUEST';
    participantId: number;
    name?: string;
    gender?: string;
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
    matchId?: number;
    totalCount: number;
    participants?: Participant[];
    matches?: CourtMatchGroup[];
}

interface LocalParticipant {
    participantId: number;
    name: string;
    gender: '남' | '여';
    participantType: 'MEMBER' | 'GUEST';
}

type BracketRow = (LocalParticipant | null)[];

// ============================================================================
// 2. 헬퍼 함수 (Helpers)
// ============================================================================
const createEmptyRow = (): BracketRow => [null, null, null, null];
const initialBracket = (): BracketRow[] => [
    createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()
];

// ============================================================================
// 3. 커스텀 훅 (비즈니스 로직 및 상태 관리)
// ============================================================================
function useTournamentManager() {
    const { showToast } = useToast();
    
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null);
    const [participantsPool, setParticipantsPool] = useState<LocalParticipant[]>([]);
    const [matchId, setMatchId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    
    const [currentCourt, setCurrentCourt] = useState('1코트');
    const [completedActivityIds, setCompletedActivityIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [mobileStep, setMobileStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    const [assignments, setAssignments] = useState<Record<string, LocalParticipant[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    const [selectedMember, setSelectedMember] = useState<LocalParticipant | null>(null);
    const [courtBrackets, setCourtBrackets] = useState<Record<string, BracketRow[]>>({
        '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchAdminActivities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<any>('/admin/votes?status=completed');
            const data = response.data?.data || response.data?.votes || response.data;
            setActivities(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ [Fetch Admin Activities Error]:', err);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAdminActivities(); }, [fetchAdminActivities]);

    const progress = useMemo(() => {
        const totalSlots = Object.values(courtBrackets).flat(2).length;
        if (totalSlots === 0) return 0;
        const filledSlots = Object.values(courtBrackets).flat(2).filter(n => n !== null).length;
        return Math.floor((filledSlots / totalSlots) * 100);
    }, [courtBrackets]);

    const unassigned = useMemo(() => {
        return participantsPool.filter(
            (p) => !Object.values(assignments).flat().some(a => a.participantId === p.participantId)
        );
    }, [participantsPool, assignments]);

    // 💡 [핵심] 초강력 데이터 복구 (Hydration) 로직
    const hydrateTournament = (responseData: any) => {
        const data = responseData.data?.data || responseData.data || responseData.result || responseData;

        if (!data) {
            showToast('데이터를 불러올 수 없습니다.', 'error');
            return;
        }

        // 1. 이름(name)을 Key로 사용하여 중복 없는 참가자 풀을 완벽하게 재구성합니다.
        const uniqueParticipantsMap = new Map<string, LocalParticipant>();
        
        // 서버에서 전체 참가자 목록을 줬다면 먼저 담습니다.
        const rawParticipants = data.participants || data.participantList || [];
        rawParticipants.forEach((p: any) => {
            if (p.name) {
                uniqueParticipantsMap.set(p.name, {
                    participantId: p.participantId || p.id || p.memberId,
                    name: p.name,
                    gender: (p.gender === 'MALE' || p.gender === '남') ? '남' : '여',
                    participantType: p.participantType || 'MEMBER'
                });
            }
        });

        // 만약 전체 참가자 목록이 비어있더라도 대진표(matches)를 뒤져서 사람들을 강제로 찾아냅니다.
        const matchGroups = data.matches || data.matchGroups || data.courtMatchGroups || data.courtMatches || [];
        let tempId = -9000;

        matchGroups.forEach((mg: any) => {
            (mg.courtMatches || []).forEach((cm: any) => {
                const teams = [...(cm.team1 || []), ...(cm.team2 || [])];
                teams.forEach((t: any) => {
                    if (t && t.name && !uniqueParticipantsMap.has(t.name)) {
                        uniqueParticipantsMap.set(t.name, {
                            participantId: t.participantId || tempId--, // ID가 없으면 임시 ID 부여
                            name: t.name,
                            gender: (t.gender === 'MALE' || t.gender === '남') ? '남' : '여',
                            participantType: t.participantType || 'MEMBER'
                        });
                    }
                });
            });
        });

        const participants = Array.from(uniqueParticipantsMap.values());
        setParticipantsPool(participants);

        // 2. 대진표 데이터(Bracket) 화면 반영
        if (matchGroups.length > 0) {
            const newBrackets: Record<string, BracketRow[]> = {
                '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket()
            };
            const newAssignments: Record<string, LocalParticipant[]> = { 
                '1코트': [], '2코트': [], '3코트': [], '4코트': [] 
            };

            matchGroups.forEach((mg: any, cIdx: number) => {
                const courtNumStr = String(mg.courtNumber || mg.courtId || (cIdx + 1)).replace(/[^0-9]/g, '');
                const courtKey = `${courtNumStr || (cIdx + 1)}코트`;
                
                if (!newBrackets[courtKey]) {
                    newBrackets[courtKey] = initialBracket();
                    newAssignments[courtKey] = [];
                }

                const cMatches = mg.courtMatches || mg.matches || [];
                cMatches.forEach((match: any, mIdx: number) => {
                    const matchIdx = match.matchNumber ? match.matchNumber - 1 : mIdx;
                    
                    while (newBrackets[courtKey].length <= matchIdx) {
                        newBrackets[courtKey].push(createEmptyRow());
                    }
                    
                    const row = newBrackets[courtKey][matchIdx];
                    
                    // 💡 무조건 '이름(name)'을 기준으로 맵에서 사람을 찾아 배치합니다.
                    const assignToRow = (member: any, index: number) => {
                        if (!member || !member.name) return;
                        const pData = participants.find(p => p.name === member.name);
                        if (pData) {
                            row[index] = pData;
                            if (!newAssignments[courtKey].some(a => a.participantId === pData.participantId)) {
                                newAssignments[courtKey].push(pData);
                            }
                        }
                    };

                    const t1 = Array.isArray(match.team1) ? match.team1 : [];
                    const t2 = Array.isArray(match.team2) ? match.team2 : [];

                    if (t1.length > 0) assignToRow(t1[0], 0);
                    if (t1.length > 1) assignToRow(t1[1], 1);
                    if (t2.length > 0) assignToRow(t2[0], 2);
                    if (t2.length > 1) assignToRow(t2[1], 3);
                });
            });

            setAssignments(newAssignments);
            setCourtBrackets(newBrackets);
            setMatchId(data.matchId || data.id || null);
            setIsEditMode(true);
            
            // 💡 [개선] 전체 뷰를 건너뛰고, 데이터가 배치된 '첫 번째 코트' 화면으로 즉시 진입
            const firstActiveCourt = Object.keys(newAssignments).find(key => newAssignments[key].length > 0) || '1코트';
            setCurrentCourt(firstActiveCourt);
            
        } else {
            setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
            setCourtBrackets({ '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket() });
            setIsEditMode(false);
            setMatchId(null);
            setCurrentCourt('1코트');
            setMobileStep(1);
        }
    };

    const handleSelectActivity = async (activity: AdminActivity) => {
        setLoading(true);
        try {
            setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
            setCourtBrackets({ '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket() });
            setCurrentCourt('1코트');
            setMobileStep(1);

            // API 호출: 대진 정보 가져오기
            const response = await api.get(`/admin/votes/${activity.voteId}/matches`);
            console.log(`GET /admin/votes/${activity.voteId}/matches 응답 데이터:`, response.data);
            setSelectedActivity(activity);
            
            // 데이터 화면 반영
            hydrateTournament(response.data);
            
        } catch (err) {
            console.error('❌ [Load Tournament Error]:', err);
            showToast('대진 정보를 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

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

    const handleAssign = (person: LocalParticipant) => {
        if (currentCourt === '전체') return;
        if (assignments[currentCourt].some(p => p.participantId === person.participantId)) return;
        setAssignments(prev => ({ ...prev, [currentCourt]: [...prev[currentCourt], person] }));
    };

    const handleRemoveMember = (court: string, person: LocalParticipant) => {
        setAssignments(prev => ({ ...prev, [court]: prev[court].filter(p => p.participantId !== person.participantId) }));
        setCourtBrackets(prev => {
            const updated = prev[court].map(row => row.map(cell => cell?.participantId === person.participantId ? null : cell));
            return { ...prev, [court]: updated };
        });
    };

    const onDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('memberData');
        if (data) {
            const person: LocalParticipant = JSON.parse(data);
            if (courtBrackets[currentCourt][row].some(cell => cell?.participantId === person.participantId)) {
                showToast(`${person.name}님은 이미 이 경기에 배치되어 있습니다.`, 'error');
                return;
            }
            setCourtBrackets(prev => {
                const newB = [...prev[currentCourt].map(r => [...r])];
                newB[row][col] = person;
                return { ...prev, [currentCourt]: newB };
            });
        }
    };

    const handleRandomAssign = () => {
        const currentMembers = assignments[currentCourt];
        if (currentMembers.length < 4) {
            showToast('최소 4명의 멤버가 필요합니다.', 'error');
            return;
        }
        
        const rowCount = courtBrackets[currentCourt].length;
        const newBracket: BracketRow[] = [];
        let pool: LocalParticipant[] = [];

        for (let r = 0; r < rowCount; r++) {
            const currentRow: BracketRow = [null, null, null, null];
            for (let c = 0; c < 4; c++) {
                if (pool.length === 0) pool = [...currentMembers].sort(() => Math.random() - 0.5);
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

    const handleSelectMember = (member: LocalParticipant) => {
        setSelectedMember(member);
        showToast(`${member.name} 선택됨. 배치할 자리를 클릭하세요.`, 'info');
    };

    const handlePlaceMember = (row: number, col: number) => {
        if (!selectedMember) return;
        if (courtBrackets[currentCourt][row].some(cell => cell?.participantId === selectedMember.participantId)) {
            showToast(`${selectedMember.name}님은 이미 이 경기에 있습니다.`, 'error');
            return;
        }
        setCourtBrackets(prev => {
            const newB = [...prev[currentCourt].map(r => [...r])];
            newB[row][col] = selectedMember;
            return { ...prev, [currentCourt]: newB };
        });
        setSelectedMember(null);
        showToast('배치 완료!', 'success');
    };

    const handleServerGenerate = async () => {
        if (!selectedActivity) return;

        const courtAssignments = Object.entries(assignments)
            .filter(([, members]) => members.length > 0)
            .map(([courtName, members]) => ({
                courtNumber: parseInt(courtName.replace(/[^0-9]/g, ''), 10) || 1,
                participants: members.map(m => ({ participantType: m.participantType, participantId: m.participantId })),
            }));

        if (courtAssignments.length === 0) {
            showToast('코트에 배정된 인원이 없습니다.', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post<any>(`/admin/votes/${selectedActivity.voteId}/matches/generate`, {
                courtCount: courtAssignments.length,
                courtAssignments,
            });
            console.log(`POST /admin/votes/${selectedActivity.voteId}/matches/generate 응답 데이터:`, res.data);
            showToast('서버에서 대진이 랜덤 생성되었습니다.', 'success');
            
            const resData = res.data?.data || res.data;
            if (resData && (resData.matches || resData.matchGroups) && (resData.matches || resData.matchGroups).length > 0) {
                hydrateTournament(resData);
            } else {
                await handleSelectActivity(selectedActivity);
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '대진 랜덤 생성 중 오류가 발생했습니다.';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTournament = async () => {
        if (!selectedActivity) return;
        setLoading(true);
        try {
            const payload: CourtMatchGroup[] = Object.entries(courtBrackets)
                .filter(([, rows]) => rows.some(row => row.some(cell => cell !== null)))
                .map(([courtName, rows]) => {
                const courtNumber = parseInt(courtName.replace(/[^0-9]/g, ''), 10) || 1;
                const courtMatches: ServerMatch[] = rows.map((row, index) => {
                    const getMember = (p: LocalParticipant | null): TeamMember | null => p ? { participantType: p.participantType, participantId: p.participantId } : null;
                    const team1: TeamMember[] = [];
                    if (row[0]) team1.push(getMember(row[0]) as TeamMember);
                    if (row[1]) team1.push(getMember(row[1]) as TeamMember);
                    const team2: TeamMember[] = [];
                    if (row[2]) team2.push(getMember(row[2]) as TeamMember);
                    if (row[3]) team2.push(getMember(row[3]) as TeamMember);

                    return { matchNumber: index + 1, team1, team2 };
                });
                return { courtNumber, courtMatches };
            });

            if (isEditMode && matchId) {
                const response = await api.patch(`/admin/matches/${matchId}`, payload);
                console.log(`PATCH /admin/matches/${matchId} 응답 데이터:`, response.data);
                if (response.status === 200 || response.status === 204) showToast('대진 정보가 수정되었습니다.', 'success');
            } else {
                const response = await api.post(`/admin/votes/${selectedActivity.voteId}/matches`, payload);
                console.log(`POST /admin/votes/${selectedActivity.voteId}/matches 응답 데이터:`, response.data);
                if (response.status === 200 || response.status === 201 || response.status === 204) showToast('대진 정보가 저장되었습니다.', 'success');
            }

            setCompletedActivityIds(prev => [...prev, selectedActivity.voteId]);
            setSelectedActivity(null);

        } catch (err) {
            console.error('❌ [Save Tournament Error]:', err);
            showToast('대진 정보를 전송하는 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        activities, selectedActivity, setSelectedActivity, participantsPool, isEditMode,
        currentCourt, setCurrentCourt, completedActivityIds, loading, mobileStep, setMobileStep, isMobile,
        assignments, selectedMember, courtBrackets, setCourtBrackets, progress, unassigned,
        handleSelectActivity, handleMatchCount, handleAssign, handleRemoveMember, onDrop,
        handleRandomAssign, handleSelectMember, handlePlaceMember, handleServerGenerate, handleSaveTournament
    };
}
type TournamentManager = ReturnType<typeof useTournamentManager>;

// ============================================================================
// 4. UI 컴포넌트 분리 (Sub-Components)
// ============================================================================

const ActivityListView = ({ m }: { m: TournamentManager }) => (
    <div className="space-y-4 sm:space-y-6">
        <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">대진 관리</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">참가 투표가 완료된 활동을 선택하세요.</p>
        </header>
        <div className="grid grid-cols-1 gap-4">
            {m.activities.length > 0 ? (
                m.activities.map((activity) => (
                    <div key={activity.voteId} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm transition-all relative group flex flex-col gap-4">
                        {activity.matchRegistered ? (
                            <span className="absolute top-4 right-6 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">대진 완료</span>
                        ) : m.completedActivityIds.includes(activity.voteId) && (
                            <span className="absolute top-4 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">완료</span>
                        )}
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">{activity.title}</h3>
                        <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 shrink-0" /> 날짜: {activity.activityDate} ({activity.activityDay}) 
                            <span className="text-gray-300">|</span> 
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> 장소: {activity.location}
                        </p>
                        <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">회원 {activity.attendance.currentAttendees}명</span>
                                <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">게스트 {activity.attendance.currentGuests}명</span>
                            </div>
                            
                            {/* 💡 대진표 수정하기 버튼 */}
                            <button 
                                onClick={() => m.handleSelectActivity(activity)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 ${
                                    activity.matchRegistered 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                {activity.matchRegistered ? '대진표 수정하기 ✏️' : '대진 작성하기 📝'}
                            </button>
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
);

const TournamentHeader = ({ m }: { m: TournamentManager }) => (
    <>
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {m.selectedActivity!.title}
                    {m.isEditMode && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[11px] font-black">수정 모드</span>}
                </h1>
                <button onClick={() => m.setSelectedActivity(null)} className="text-gray-400 text-sm font-bold mt-2 hover:text-gray-600 transition-colors flex items-center gap-1">← 목록으로 돌아가기</button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-[#dadada]">
                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">전체 진행도</span>
                <div className="w-24 sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden flex items-center">
                    <div className="h-full bg-[#8DE45C] transition-all duration-300" style={{ width: `${m.progress}%` }} />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800 w-12">{m.progress}%</span>
            </div>
        </header>

        <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-fit mb-6 sm:mb-8 overflow-x-auto gap-1">
            {['1코트', '2코트', '3코트', '4코트', '전체'].map(c => (
                <button key={c} onClick={() => { m.setCurrentCourt(c); m.setMobileStep(1); }} className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${m.currentCourt === c ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                    {c}
                </button>
            ))}
        </div>
    </>
);

const OverallView = ({ m }: { m: TournamentManager }) => (
    <section className="animate-in fade-in duration-500 space-y-4">
        <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-blue-600">전체 코트 대진 현황</h3>
            <button onClick={m.handleSaveTournament} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-colors">
                {m.isEditMode ? '대진 수정 및 전송' : '대진 확정 및 전송'}
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 bg-gray-50 rounded-3xl">
            {Object.entries(m.courtBrackets).map(([courtName, rows]) => (
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
);

const CourtDetailView = ({ m }: { m: TournamentManager }) => (
    <>
        {(!m.isMobile || m.mobileStep === 1) && (
            <div className="animate-in fade-in mb-8">
                <div className="mb-6 sm:mb-8">
                    <h3 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">미배치 인원 ({m.unassigned.length})</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                        {m.unassigned.map((p) => (
                            <button key={p.participantId} onClick={() => m.handleAssign(p)} className="bg-white border border-gray-100 px-3 py-2 rounded-xl text-xs flex justify-between items-center hover:border-blue-500 shadow-sm transition active:scale-95">
                                <span className="font-bold text-gray-700 truncate">{p.name}</span>
                                <span className={`text-[10px] font-black ml-1 ${p.gender === '남' ? 'text-blue-500' : 'text-red-500'}`}>{p.gender === '남' ? '♂' : '♀'}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 sm:p-6 border-2 border-dashed border-blue-100">
                    <p className="text-xs font-bold text-blue-500 mb-4">현재 코트 배치 멤버 (대진표 작성용)</p>
                    <div className="flex flex-wrap gap-2">
                        {m.assignments[m.currentCourt].map(p => (
                            <div 
                                key={p.participantId} draggable onDragStart={(e) => e.dataTransfer.setData('memberData', JSON.stringify(p))} onClick={() => m.handleSelectMember(p)}
                                className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 border-2 ${
                                    m.selectedMember?.participantId === p.participantId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-100'
                                }`}
                            >
                                {p.name}
                                <button onClick={(e) => { e.stopPropagation(); m.handleRemoveMember(m.currentCourt, p); }} className="text-gray-300 hover:text-red-500 font-bold ml-2">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
                
                {m.isMobile && m.assignments[m.currentCourt].length >= 4 && (
                    <button onClick={() => m.setMobileStep(2)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition">
                        대진표 작성하러 가기 ({m.assignments[m.currentCourt].length}명 확정) →
                    </button>
                )}
            </div>
        )}

        {(!m.isMobile || m.mobileStep === 2) && (
            <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8 animate-in slide-in-from-right-4">
                {m.isMobile && (
                    <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border-2 border-dashed border-blue-100">
                        <p className="text-[10px] font-bold text-blue-500 mb-3 uppercase tracking-wider">배정된 멤버 (아래 칸으로 드래그)</p>
                        <div className="flex flex-wrap gap-2">
                            {m.assignments[m.currentCourt].map(p => (
                                <div key={p.participantId} className="bg-white border border-blue-100 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm">{p.name}</div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        {m.isMobile && <button onClick={() => m.setMobileStep(1)} className="p-2 text-gray-400 font-bold">← 뒤로</button>}
                        <h3 className="text-base sm:text-xl font-bold text-gray-800">{m.currentCourt} 대진표</h3>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <button onClick={() => m.handleMatchCount('minus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg font-black hover:bg-gray-100 transition-colors">-</button>
                            <span className="text-sm font-bold w-6 text-center">{m.courtBrackets[m.currentCourt].length}</span>
                            <button onClick={() => m.handleMatchCount('plus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg font-black hover:bg-gray-100 transition-colors">+</button>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={m.handleRandomAssign} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none transition hover:bg-blue-700 shadow-sm">랜덤 배치</button>
                        <button onClick={m.handleServerGenerate} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none transition hover:bg-indigo-700 shadow-sm">서버 랜덤 배치</button>
                        <button onClick={() => m.setCourtBrackets(prev => ({ ...prev, [m.currentCourt]: initialBracket() }))} className="bg-white border text-red-600 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none hover:bg-red-50 transition shadow-sm">비우기</button>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-4 sm:p-12 space-y-4 sm:space-y-6 shadow-md border border-gray-50">
                    {m.courtBrackets[m.currentCourt].map((rowArr, rowIndex) => (
                        <div key={rowIndex} className="flex items-center justify-center gap-2 sm:gap-4 animate-in slide-in-from-top-2">
                            <span className="text-[11px] font-black text-gray-300 w-6 sm:w-8 uppercase tracking-tighter">G{rowIndex + 1}</span>
                            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                    <BracketCell person={rowArr[0]} onDrop={(e: any) => m.onDrop(e, rowIndex, 0)} onClick={() => m.handlePlaceMember(rowIndex, 0)} onClear={() => { const nb = [...m.courtBrackets[m.currentCourt].map(r => [...r])]; nb[rowIndex][0] = null; m.setCourtBrackets(prev => ({ ...prev, [m.currentCourt]: nb })); }} />
                                    <BracketCell person={rowArr[1]} onDrop={(e: any) => m.onDrop(e, rowIndex, 1)} onClick={() => m.handlePlaceMember(rowIndex, 1)} onClear={() => { const nb = [...m.courtBrackets[m.currentCourt].map(r => [...r])]; nb[rowIndex][1] = null; m.setCourtBrackets(prev => ({ ...prev, [m.currentCourt]: nb })); }} />
                                </div>
                                <span className="text-xl sm:text-3xl font-black text-gray-200">:</span>
                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                    <BracketCell person={rowArr[2]} onDrop={(e: any) => m.onDrop(e, rowIndex, 2)} onClick={() => m.handlePlaceMember(rowIndex, 2)} onClear={() => { const nb = [...m.courtBrackets[m.currentCourt].map(r => [...r])]; nb[rowIndex][2] = null; m.setCourtBrackets(prev => ({ ...prev, [m.currentCourt]: nb })); }} />
                                    <BracketCell person={rowArr[3]} onDrop={(e: any) => m.onDrop(e, rowIndex, 3)} onClick={() => m.handlePlaceMember(rowIndex, 3)} onClear={() => { const nb = [...m.courtBrackets[m.currentCourt].map(r => [...r])]; nb[rowIndex][3] = null; m.setCourtBrackets(prev => ({ ...prev, [m.currentCourt]: nb })); }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {m.isMobile && (
                    <div className="mt-8 flex gap-3">
                        <button onClick={() => m.setMobileStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold">인원 수정</button>
                        <button onClick={() => m.setCurrentCourt('전체')} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold">전체 코트 확인</button>
                    </div>
                )}
            </section>
        )}
    </>
);

const BracketCell = ({ person, onDrop, onClick, onClear }: any) => (
    <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={onClick}
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

// ============================================================================
// 5. 메인 컴포넌트 (오직 조립만 수행)
// ============================================================================
export default function TournamentPage() {
    const manager = useTournamentManager();

    return (
        <div className="max-w-6xl mx-auto p-3 sm:p-4 text-left pb-20 select-none">
            {manager.loading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[999] flex items-center justify-center font-bold text-gray-500 text-sm">
                    데이터 동기화 중...
                </div>
            )}

            {!manager.selectedActivity ? (
                <ActivityListView m={manager} />
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
                        <TournamentHeader m={manager} />
                        {manager.currentCourt !== '전체' && <CourtDetailView m={manager} />}
                    </section>
                    {manager.currentCourt === '전체' && <OverallView m={manager} />}
                </div>
            )}
        </div>
    );
}