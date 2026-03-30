'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// 1. 대진표 데이터 규격
interface Match {
    team1: string[];
    team2: string[];
    }

    interface CourtData {
    id: number;
    courtName: string;
    participants: string[];
    matches: Match[];
    }

    // 2. 시안 기반 더미 데이터
    const TOURNAMENT_DATA: CourtData[] = [
    {
        id: 1,
        courtName: "1코트",
        participants: ["최우정", "윤지원", "장영호", "김영현", "주서영", "정유진"],
        matches: [
        { team1: ["최우정", "윤지원"], team2: ["장영호", "김영현"] },
        { team1: ["최우정", "정유진"], team2: ["김영현", "주서영"] },
        { team1: ["윤지원", "정유진"], team2: ["장영호", "주서영"] },
        ]
    },
    {
        id: 2,
        courtName: "2코트",
        participants: ["김종원", "권현성", "김해선", "최민성", "조은길", "이채영", "박성재"],
        matches: [] // 시안상 닫혀있는 상태
    },
    {
        id: 3,
        courtName: "3코트",
        participants: ["신호선", "강민지", "최민서", "케이카인", "황윤주", "황지현"],
        matches: []
    },
    {
        id: 4,
        courtName: "4코트",
        participants: ["강대겸", "손하준", "김동환", "윤정원", "임성주", "이현명"],
        matches: []
    }
    ];

    export default function TournamentPage() {
    const params = useParams();
    const [openCourt, setOpenCourt] = useState<number | null>(1); // 기본으로 1코트 열림

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
            
            {/* 상단 뒤로가기 */}
            <Link 
            href={`/activities/${params.id}`} 
            className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors mb-4"
            >
            ← 목록으로 돌아가기
            </Link>

            {/* --- [1] 헤더 카드 --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-2">
            <div className="flex items-center gap-3">
                <span className="text-3xl">▦</span>
                <h1 className="text-3xl font-black text-slate-800">3.21(토) 정기 운동 - 대진표</h1>
            </div>
            <p className="text-slate-400 font-bold text-sm ml-10">코트를 클릭하면 게임별 대진표를 확인할 수 있습니다.</p>
            </div>

            {/* --- [2] 코트별 리스트 (아코디언) --- */}
            <div className="space-y-4">
            {TOURNAMENT_DATA.map((court) => (
                <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 코트 헤더 */}
                <div 
                    className="p-6 flex items-center justify-between cursor-pointer transition-colors"
                    onClick={() => setOpenCourt(openCourt === court.id ? null : court.id)}
                >
                    <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-lg font-black text-sm ${openCourt === court.id ? 'bg-[#3D6B2C] text-white' : 'bg-slate-500 text-white'}`}>
                        {court.courtName}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-sm">
                        <span>👥</span> {court.participants.length}명
                    </div>
                    </div>
                    <span className={`text-slate-300 transition-transform duration-300 ${openCourt === court.id ? 'rotate-180' : ''}`}>
                    ▼
                    </span>
                </div>

                {/* 참가자 명단 칩 (항상 표시 또는 열렸을 때만 표시 - 시안상 항상 표시 느낌) */}
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                    {court.participants.map((name, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                        {name}
                    </span>
                    ))}
                </div>

                {/* [핵심] 게임별 대진 상세 (아코디언 내용) */}
                {openCourt === court.id && court.matches.length > 0 && (
                    <div className="px-8 pb-10 pt-4 bg-[#F8F9FA]/50 border-t border-slate-50 space-y-6 animate-fade-in">
                    {court.matches.map((match, mIdx) => (
                        <div key={mIdx} className="relative">
                        {/* 게임 라벨 */}
                        <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-10 bg-slate-800 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">
                            {mIdx + 1}게임
                        </div>
                        
                        {/* 대진 카드 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center justify-around relative">
                            <div className="text-center space-y-2 w-1/3">
                            {match.team1.map((p, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-2 justify-center font-black text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {p}
                                </div>
                            ))}
                            </div>
                            
                            <div className="font-black text-slate-800 italic text-xl">VS</div>
                            
                            <div className="text-center space-y-2 w-1/3">
                            {match.team2.map((p, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-2 justify-center font-black text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {p}
                                </div>
                            ))}
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            ))}
            </div>

            {/* --- [3] 하단 안내 문구 --- */}
            <div className="bg-[#F1F3F5] p-5 rounded-2xl text-center">
            <p className="text-slate-400 text-xs font-bold italic">
                * 운영진이 참석자 명단을 기반으로 작성한 대진표입니다.
            </p>
            </div>

        </div>
        </div>
    );
}