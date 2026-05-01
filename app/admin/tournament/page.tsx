'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface Participant {
    participantId: number;
    participantType: 'MEMBER' | 'GUEST';
    name: string;
    gender: 'MALE' | 'FEMALE';
}

interface CompletedVoteAttendance {
    currentAttendees: number;
    currentGuests: number;
    totalParticipants: number;
}

interface CompletedVote {
    voteId: number;
    title: string;
    activityDay: string;
    activityDate: string;
    location: string;
    attendance: CompletedVoteAttendance;
}

interface MatchParticipant {
    name: string;
    gender: 'MALE' | 'FEMALE';
}

interface CourtMatch {
    matchNumber: number;
    team1: MatchParticipant[];
    team2: MatchParticipant[];
}

interface CourtData {
    courtNumber: number;
    courtMatches: CourtMatch[];
}

interface MatchResponse {
    voteId: number;
    matchId: number;
    courtCount: number;
    matches: CourtData[];
}

interface ParticipantsResponse {
    voteId: number;
    totalCount: number;
    participants: Participant[];
}

export default function TournamentPage() {
    const [completedVotes, setCompletedVotes] = useState<CompletedVote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVote, setSelectedVote] = useState<CompletedVote | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentCourt, setCurrentCourt] = useState('1코트');
    const [mobileStep, setMobileStep] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [existingMatchId, setExistingMatchId] = useState<number | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // GET /admin/votes?status=completed
    const fetchCompletedVotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<CompletedVote[]>('/admin/votes', { params: { status: 'completed' } });
            setCompletedVotes(res.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '투표 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompletedVotes();
    }, [fetchCompletedVotes]);

    // Court assignments & brackets
    const [assignments, setAssignments] = useState<Record<string, Participant[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    const createEmptyRow = (): (Participant | null)[] => [null, null, null, null];
    const initialBracket = () => [createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()];

    const [courtBrackets, setCourtBrackets] = useState<Record<string, (Participant | null)[][]>>({
        '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
    });

    const progress = useMemo(() => {
        const totalSlots = Object.values(courtBrackets).flat(2).length;
        if (totalSlots === 0) return 0;
        const filledSlots = Object.values(courtBrackets).flat(2).filter(n => n !== null).length;
        return Math.floor((filledSlots / totalSlots) * 100);
    }, [courtBrackets]);

    // GET /admin/votes/{voteId}/matches — fetch participants
    const handleSelectVote = async (vote: CompletedVote) => {
        setSelectedVote(vote);
        setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
        setCourtBrackets({ '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket() });
        setCurrentCourt('1코트');
        setMobileStep(1);
        setExistingMatchId(null);

        try {
            const res = await api.get<ParticipantsResponse>(`/admin/votes/${vote.voteId}/matches`);
            setParticipants(res.data.participants);
        } catch {
            setParticipants([]);
        }
    };

    const handleAssign = (person: Participant) => {
        if (currentCourt === '전체') return;
        setAssignments(prev => ({ ...prev, [currentCourt]: [...prev[currentCourt], person] }));
    };

    const handleRemoveMember = (court: string, person: Participant) => {
        setAssignments(prev => ({ ...prev, [court]: prev[court].filter(p => p.participantId !== person.participantId) }));
        setCourtBrackets(prev => {
            const updated = prev[court].map(row => row.map(cell => cell?.participantId === person.participantId ? null : cell));
            return { ...prev, [court]: updated };
        });
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

    const onDragStart = (e: React.DragEvent, person: Participant) => {
        e.dataTransfer.setData('memberData', JSON.stringify(person));
    };

    const onDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('memberData');
        if (data) {
            const person: Participant = JSON.parse(data);
            if (courtBrackets[currentCourt][row].some(cell => cell?.participantId === person.participantId)) {
                alert(`[중복] ${person.name}님은 이미 이 경기에 배치되어 있습니다.`);
                return;
            }
            setCourtBrackets(prev => {
                const newB = prev[currentCourt].map(r => [...r]);
                newB[row][col] = person;
                return { ...prev, [currentCourt]: newB };
            });
        }
    };

    const handleRandomAssign = () => {
        const currentMembers = assignments[currentCourt];
        if (currentMembers.length < 4) return alert('최소 4명의 멤버가 필요합니다.');

        const rowCount = courtBrackets[currentCourt].length;
        const newBracket: (Participant | null)[][] = [];
        let pool: Participant[] = [];

        for (let r = 0; r < rowCount; r++) {
            const currentRow: (Participant | null)[] = [null, null, null, null];
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

    // POST /admin/votes/{voteId}/matches — save tournament
    const handleSaveTournament = async () => {
        if (!selectedVote) return;

        const payload = Object.entries(courtBrackets).map(([courtName, rows], idx) => ({
            courtNumber: idx + 1,
            courtMatches: rows.map((row, mIdx) => ({
                matchNumber: mIdx + 1,
                team1: [row[0]?.participantId, row[1]?.participantId].filter(Boolean),
                team2: [row[2]?.participantId, row[3]?.participantId].filter(Boolean),
            })),
        }));

        try {
            const res = await api.post<MatchResponse>(`/admin/votes/${selectedVote.voteId}/matches`, payload);
            setExistingMatchId(res.data.matchId);
            alert('대진 정보가 저장되었습니다.');
        } catch {
            alert('대진 저장에 실패했습니다.');
        }
    };

    const unassigned = participants.filter(
        (p) => !Object.values(assignments).flat().some(a => a.participantId === p.participantId)
    );

    const genderLabel = (g: string) => g === 'MALE' ? '남' : '여';
    const genderColor = (g: string) => g === 'MALE' ? 'text-blue-400' : 'text-red-400';

    return (
        <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6 text-left pb-20">
            {!selectedVote ? (
                <div className="space-y-4 sm:space-y-6">
                    <header>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">대진 관리</h1>
                        <p className="text-sm sm:text-base text-gray-500 font-medium">참가 투표가 완료된 활동을 선택하세요.</p>
                    </header>

                    {loading && <p className="text-center py-10 text-gray-400">불러오는 중...</p>}
                    {error && <p className="text-center py-10 text-red-500">{error}</p>}

                    <div className="grid grid-cols-1 gap-4">
                        {completedVotes.map((vote) => (
                            <div key={vote.voteId} onClick={() => handleSelectVote(vote)} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:border-blue-500 cursor-pointer transition-all">
                                <h3 className="text-xl font-bold text-gray-800">{vote.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {vote.activityDay} {vote.activityDate} | 📍 {vote.location} | 참가자: {vote.attendance.totalParticipants}명
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
                        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{selectedVote.title}</h1>
                                <button onClick={() => setSelectedVote(null)} className="text-gray-400 text-sm font-bold mt-2 hover:text-gray-600">← 목록으로 돌아가기</button>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-[#dadada]">
                                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">전체 진행도</span>
                                <div className="w-24 sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#8DE45C] transition-all" style={{ width: `${progress}%` }} />
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

                        {/* 인원 선택 */}
                        {(!isMobile || (currentCourt !== '전체' && mobileStep === 1)) && (
                            <div>
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider">미배치 인원 ({unassigned.length})</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                        {unassigned.map((p) => (
                                            <button key={p.participantId} onClick={() => handleAssign(p)} className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs flex justify-between items-center hover:border-blue-500 shadow-sm transition active:scale-95">
                                                <span className="font-bold text-gray-700 truncate">{p.name}</span>
                                                <span className={`text-[10px] font-medium ml-1 ${genderColor(p.gender)}`}>{genderLabel(p.gender)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {currentCourt !== '전체' && (
                                    <div className="bg-blue-50/50 rounded-xl p-4 sm:p-6 border-2 border-dashed border-blue-100">
                                        <p className="text-xs font-bold text-blue-500 mb-4">현재 코트 배치 멤버</p>
                                        <div className="flex flex-wrap gap-2">
                                            {assignments[currentCourt].map(p => (
                                                <div key={p.participantId} draggable onDragStart={(e) => onDragStart(e, p)} className="bg-white border-2 border-blue-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-grab shadow-sm">
                                                    <span>{p.name}</span>
                                                    <span className="text-[10px] opacity-40">{genderLabel(p.gender)}</span>
                                                    <button onClick={() => handleRemoveMember(currentCourt, p)} className="text-gray-300 hover:text-red-500 font-bold ml-1">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isMobile && currentCourt !== '전체' && assignments[currentCourt].length >= 4 && (
                                    <button onClick={() => setMobileStep(2)} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                                        대진표 작성하러 가기 ({assignments[currentCourt].length}명 확정) →
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 대진표 섹션 */}
                    {currentCourt === '전체' ? (
                        <section className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-bold text-blue-600">전체 코트 대진 현황</h3>
                                <button onClick={handleSaveTournament} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">
                                    {existingMatchId ? '대진 수정 저장' : '대진 확정 및 전송'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 bg-gray-50 rounded-3xl">
                                {Object.entries(courtBrackets).map(([courtName, rows]) => (
                                    <div key={courtName} className="bg-white border border-gray-100 rounded-[24px] p-4 sm:p-6 shadow-sm">
                                        <span className="text-base font-bold text-gray-800 border-b pb-3 block mb-4">{courtName}</span>
                                        <div className="space-y-2">
                                            {rows.map((row, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-700">
                                                    <div className="flex-1 text-center">{row[0]?.name || '-'}:{row[1]?.name || '-'}</div>
                                                    <span className="text-[10px] text-gray-200 mx-2">VS</span>
                                                    <div className="flex-1 text-center">{row[2]?.name || '-'}:{row[3]?.name || '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        (!isMobile || mobileStep === 2) && (
                            <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
                                {isMobile && (
                                    <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border-2 border-dashed border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-500 mb-3 uppercase tracking-wider">배정된 멤버</p>
                                        <div className="flex flex-wrap gap-2">
                                            {assignments[currentCourt].map(p => (
                                                <div key={p.participantId} className="bg-white border border-blue-100 px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm">{p.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        {isMobile && <button onClick={() => setMobileStep(1)} className="p-2 text-gray-400 font-bold">← 뒤로</button>}
                                        <h3 className="text-base sm:text-xl font-bold text-gray-800">{currentCourt} 대진표</h3>
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                            <button onClick={() => handleMatchCount('minus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg">-</button>
                                            <span className="text-sm font-bold w-6 text-center">{courtBrackets[currentCourt].length}</span>
                                            <button onClick={() => handleMatchCount('plus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg">+</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleRandomAssign} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none hover:bg-blue-700">랜덤 배치</button>
                                        <button onClick={() => setCourtBrackets(prev => ({ ...prev, [currentCourt]: initialBracket() }))} className="bg-white border text-red-600 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex-1 sm:flex-none hover:bg-red-50">비우기</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[24px] p-4 sm:p-12 space-y-4 sm:space-y-6 shadow-md border border-gray-50">
                                    {courtBrackets[currentCourt].map((rowArr, rowIndex) => (
                                        <div key={rowIndex} className="flex items-center justify-center gap-2 sm:gap-4">
                                            <span className="text-[10px] font-bold text-gray-300 w-6 sm:w-8">G{rowIndex + 1}</span>
                                            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                    <BracketCell person={rowArr[0]} onDrop={(e) => onDrop(e, rowIndex, 0)} onClear={() => { const nb = courtBrackets[currentCourt].map(r => [...r]); nb[rowIndex][0] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                    <BracketCell person={rowArr[1]} onDrop={(e) => onDrop(e, rowIndex, 1)} onClear={() => { const nb = courtBrackets[currentCourt].map(r => [...r]); nb[rowIndex][1] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                </div>
                                                <span className="text-xl sm:text-3xl font-bold text-gray-200">:</span>
                                                <div className="flex items-center gap-2 sm:gap-4 flex-1">
                                                    <BracketCell person={rowArr[2]} onDrop={(e) => onDrop(e, rowIndex, 2)} onClear={() => { const nb = courtBrackets[currentCourt].map(r => [...r]); nb[rowIndex][2] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
                                                    <BracketCell person={rowArr[3]} onDrop={(e) => onDrop(e, rowIndex, 3)} onClear={() => { const nb = courtBrackets[currentCourt].map(r => [...r]); nb[rowIndex][3] = null; setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb })); }} />
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

function BracketCell({ person, onDrop, onClear }: { person: Participant | null; onDrop: (e: React.DragEvent) => void; onClear: () => void }) {
    const genderLabel = (g: string) => g === 'MALE' ? '남' : '여';
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`w-full sm:w-32 h-12 sm:h-14 rounded-xl border-2 flex items-center justify-center relative transition-all ${
                person ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-100 bg-gray-50 border-dashed'
            }`}
        >
            {person ? (
                <>
                    <div className="flex flex-col items-center">
                        <span className="text-xs sm:text-sm font-bold text-gray-800 truncate">{person.name}</span>
                        <span className={`text-[8px] sm:text-[9px] font-bold ${person.gender === 'MALE' ? 'text-blue-400' : 'text-red-400'}`}>{genderLabel(person.gender)}</span>
                    </div>
                    <button onClick={onClear} className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:text-red-500">✕</button>
                </>
            ) : <span className="text-[9px] sm:text-[10px] text-gray-300 font-bold uppercase">Drop</span>}
        </div>
    );
}
