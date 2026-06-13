'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import { Calendar, MapPin } from 'lucide-react';

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
    matchRegistered: boolean; // 💡 명세서 명세 반영
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
    matchId?: number;
    totalCount: number;
    participants: Participant[];
    matches?: CourtMatchGroup[];
}

interface LocalParticipant {
    participantId: number;
    name: string;
    gender: '남' | '여';
    participantType: 'MEMBER' | 'GUEST';
}

type BracketRow = (LocalParticipant | null)[];

export default function TournamentPage() {
    const { showToast } = useToast();
    const [activities, setActivities] = useState<AdminActivity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<AdminActivity | null>(null);
    const [participantsPool, setParticipantsPool] = useState<LocalParticipant[]>([]);
    const [matchId, setMatchId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    
    // 💡 클릭 배치를 위한 상태
    const [selectedMember, setSelectedMember] = useState<LocalParticipant | null>(null);
    
    const [currentCourt, setCurrentCourt] = useState('1코트');
    const [loading, setLoading] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState(false);

    const [assignments, setAssignments] = useState<Record<string, LocalParticipant[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    const createEmptyRow = (): BracketRow => [null, null, null, null];
    const initialBracket = (): BracketRow[] => [createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()];
    
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
            const response = await api.get<AdminActivity[]>('/admin/votes?status=completed');
            setActivities(response.data || []);
        } catch (err) {
            console.error(err);
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

    const handleSelectActivity = async (activity: AdminActivity) => {
        setLoading(true);
        try {
            setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
            setCourtBrackets({ '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket() });
            
            const response = await api.get<TournamentDetailResponse>(`/admin/votes/${activity.voteId}/matches`);
            const data = response.data;
            const participants: LocalParticipant[] = (data.participants || []).map(p => ({
                participantId: p.participantId, name: p.name, gender: p.gender === 'MALE' ? '남' : '여', participantType: p.participantType
            }));
            
            setParticipantsPool(participants);
            setSelectedActivity(activity);
            setMatchId(data.matchId || activity.voteId);

            if (activity.matchRegistered && data.matches) {
                setIsEditMode(true);
                const newBrackets: Record<string, BracketRow[]> = { '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket() };
                const newAssignments: Record<string, LocalParticipant[]> = { '1코트': [], '2코트': [], '3코트': [], '4코트': [] };

                data.matches.forEach((m) => {
                    const courtKey = `${m.courtNumber}코트`;
                    if (newBrackets[courtKey]) {
                        newBrackets[courtKey] = m.courtMatches.map((match) => {
                            const row: BracketRow = [null, null, null, null];
                            [...match.team1, ...match.team2].forEach((member, idx) => {
                                const pData = participants.find(p => p.participantId === member.participantId);
                                if (pData) {
                                    row[idx] = pData;
                                    if (!newAssignments[courtKey].some(a => a.participantId === pData.participantId)) newAssignments[courtKey].push(pData);
                                }
                            });
                            return row;
                        });
                        while (newBrackets[courtKey].length < 4) newBrackets[courtKey].push(createEmptyRow());
                    }
                });
                setCourtBrackets(newBrackets);
                setAssignments(newAssignments);
            } else {
                setIsEditMode(false);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleSelectMember = (member: LocalParticipant) => {
        setSelectedMember(member);
        showToast(`${member.name}님을 배치할 코트 자리를 클릭하세요.`, 'info');
    };

    const handlePlaceMember = (court: string, rowIdx: number, colIdx: number) => {
        if (!selectedMember) return;
        if (courtBrackets[court].some(row => row.includes(selectedMember))) {
            showToast('이미 배치된 멤버입니다.', 'error');
            return;
        }
        setCourtBrackets(prev => {
            const newB = [...prev[court].map(r => [...r])];
            newB[rowIdx][colIdx] = selectedMember;
            return { ...prev, [court]: newB };
        });
        setSelectedMember(null);
        showToast('배치 완료!', 'success');
    };

    const handleRemoveMember = (court: string, rowIdx: number, colIdx: number) => {
        setCourtBrackets(prev => {
            const newB = [...prev[court].map(r => [...r])];
            newB[rowIdx][colIdx] = null;
            return { ...prev, [court]: newB };
        });
    };

    const handleSaveTournament = async () => {
        if (!selectedActivity) return;
        setLoading(true);
        try {
            const payload = Object.entries(courtBrackets).map(([courtName, rows]) => ({
                courtNumber: parseInt(courtName.replace(/[^0-9]/g, ''), 10) || 1,
                courtMatches: rows.map((row, index) => ({
                    matchNumber: index + 1,
                    team1: row.slice(0, 2).filter(Boolean).map(p => ({ participantType: p!.participantType, participantId: p!.participantId })),
                    team2: row.slice(2, 4).filter(Boolean).map(p => ({ participantType: p!.participantType, participantId: p!.participantId }))
                }))
            }));
            if (isEditMode && matchId) await api.patch(`/admin/matches/${matchId}`, payload);
            else await api.post(`/admin/votes/${selectedActivity.voteId}/matches`, payload);
            showToast('대진 정보가 저장되었습니다.', 'success');
            setSelectedActivity(null);
        } catch (err) { showToast('저장 실패', 'error'); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 pb-20">
            {!selectedActivity ? (
                <div className="grid grid-cols-1 gap-4">
                    {activities.map((a) => (
                        <div key={a.voteId} onClick={() => handleSelectActivity(a)} className="bg-white p-6 rounded-2xl border shadow-sm cursor-pointer hover:border-blue-500 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-lg">{a.title}</h3>
                                {a.matchRegistered && <span className="text-green-600 text-xs font-black">● 대진 완료</span>}
                            </div>
                            <button className="text-sm font-bold bg-gray-100 px-4 py-2 rounded-lg">
                                {a.matchRegistered ? '대진 수정' : '대진 작성'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <button onClick={() => setSelectedActivity(null)} className="text-gray-400 font-bold">← 목록으로</button>
                    
                    {selectedMember && (
                        <div className="fixed top-4 left-0 right-0 z-[1000] flex justify-center">
                            <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl font-black animate-bounce">
                                {selectedMember.name} 배치할 자리를 클릭하세요!
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {assignments[currentCourt].map(p => (
                            <button key={p.participantId} onClick={() => handleSelectMember(p)} className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedMember?.participantId === p.participantId ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                                {p.name}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-[24px] border shadow-md space-y-4">
                        {courtBrackets[currentCourt].map((row, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-center gap-2">
                                {[0, 1].map(cIdx => <BracketCell key={cIdx} person={row[cIdx]} onClick={() => handlePlaceMember(currentCourt, rIdx, cIdx)} onClear={() => handleRemoveMember(currentCourt, rIdx, cIdx)} />)}
                                <span className="font-black px-2">:</span>
                                {[2, 3].map(cIdx => <BracketCell key={cIdx} person={row[cIdx]} onClick={() => handlePlaceMember(currentCourt, rIdx, cIdx)} onClear={() => handleRemoveMember(currentCourt, rIdx, cIdx)} />)}
                            </div>
                        ))}
                    </div>

                    <button onClick={handleSaveTournament} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl">{isEditMode ? '대진 수정 완료' : '대진 저장'}</button>
                </div>
            )}
        </div>
    );
}

function BracketCell({ person, onClick, onClear }: any) {
    return (
        <div onClick={onClick} className={`w-24 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer relative ${person ? 'border-green-400 bg-green-50' : 'border-dashed bg-gray-50'}`}>
            {person ? (
                <>{person.name} <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute -top-1 -right-1 bg-white border rounded-full w-4 h-4 text-[10px]">✕</button></>
            ) : <span className="text-[10px] text-gray-300">선택</span>}
        </div>
    );
}