'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';

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

export default function TournamentPage() {
    const params = useParams();
    const voteId = params.id;
    const [openCourt, setOpenCourt] = useState<number | null>(1);
    const [matchData, setMatchData] = useState<MatchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatch = async () => {
            setLoading(true);
            setError(null);
            try {
                // First get participants to find matchId, then get match data
                const res = await api.get<MatchResponse>(`/admin/votes/${voteId}/matches`);
                // If response has matches structure, use it directly
                if (res.data.matches) {
                    setMatchData(res.data);
                }
            } catch {
                setError('대진표 정보를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();
    }, [voteId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none">
                <div className="max-w-4xl mx-auto py-20 text-center text-slate-400 font-bold">불러오는 중...</div>
            </div>
        );
    }

    if (error || !matchData) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Link href={`/activities/${voteId}`} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors mb-4">
                        ← 목록으로 돌아가기
                    </Link>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <p className="text-slate-400 font-bold">{error || '대진표가 아직 등록되지 않았습니다.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                <Link
                    href={`/activities/${voteId}`}
                    className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors mb-4"
                >
                    ← 목록으로 돌아가기
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">▦</span>
                        <h1 className="text-3xl font-black text-slate-800">대진표</h1>
                    </div>
                    <p className="text-slate-400 font-bold text-sm ml-10">코트를 클릭하면 게임별 대진표를 확인할 수 있습니다.</p>
                </div>

                <div className="space-y-4">
                    {matchData.matches.map((court) => {
                        const allParticipants = court.courtMatches.flatMap(m => [...m.team1, ...m.team2]);
                        const uniqueNames = [...new Set(allParticipants.map(p => p.name))];

                        return (
                            <div key={court.courtNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div
                                    className="p-6 flex items-center justify-between cursor-pointer transition-colors"
                                    onClick={() => setOpenCourt(openCourt === court.courtNumber ? null : court.courtNumber)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-lg font-black text-sm ${openCourt === court.courtNumber ? 'bg-[#3D6B2C] text-white' : 'bg-slate-500 text-white'}`}>
                                            {court.courtNumber}코트
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-400 font-bold text-sm">
                                            <span>👥</span> {uniqueNames.length}명
                                        </div>
                                    </div>
                                    <span className={`text-slate-300 transition-transform duration-300 ${openCourt === court.courtNumber ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>

                                <div className="px-6 pb-6 flex flex-wrap gap-2">
                                    {uniqueNames.map((name, idx) => (
                                        <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                            {name}
                                        </span>
                                    ))}
                                </div>

                                {openCourt === court.courtNumber && court.courtMatches.length > 0 && (
                                    <div className="px-8 pb-10 pt-4 bg-[#F8F9FA]/50 border-t border-slate-50 space-y-6">
                                        {court.courtMatches.map((match) => (
                                            <div key={match.matchNumber} className="relative">
                                                <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-10 bg-slate-800 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">
                                                    {match.matchNumber}게임
                                                </div>
                                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center justify-around relative">
                                                    <div className="text-center space-y-2 w-1/3">
                                                        {match.team1.map((p, pIdx) => (
                                                            <div key={pIdx} className="flex items-center gap-2 justify-center font-black text-slate-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {p.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="font-black text-slate-800 italic text-xl">VS</div>
                                                    <div className="text-center space-y-2 w-1/3">
                                                        {match.team2.map((p, pIdx) => (
                                                            <div key={pIdx} className="flex items-center gap-2 justify-center font-black text-slate-700">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {p.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-[#F1F3F5] p-5 rounded-2xl text-center">
                    <p className="text-slate-400 text-xs font-bold italic">
                        * 운영진이 참석자 명단을 기반으로 작성한 대진표입니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
