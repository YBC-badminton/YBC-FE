"use client";

import React, { useState } from "react";

interface VoteStatus {
  id: string;
  type: "regular" | "extra";
  title: string;
  day: string;
  date: string;
  location: string;
  participantCount: number;
  guestCount: number;
  startTime: string;
  endTime: string;
  voteStart: string;
  voteEnd: string;
  status: "pending" | "ongoing" | "completed";
  memo?: string;
}

const MOCK_VOTES: VoteStatus[] = [
  {
    id: "1",
    type: "regular",
    title: "정기활동",
    day: "화요일",
    date: "2026-03-17",
    location: "올림픽공원 체육관",
    participantCount: 12,
    guestCount: 2,
    startTime: "19:00",
    endTime: "21:00",
    voteStart: "2026-03-15 13:00",
    voteEnd: "2026-03-17 23:59",
    status: "ongoing",
  },
  {
    id: "2",
    type: "extra",
    title: "번개모임",
    day: "토요일",
    date: "2026-03-20",
    location: "잠실 체육관",
    participantCount: 8,
    guestCount: 1,
    startTime: "14:00",
    endTime: "17:00",
    voteStart: "2026-03-15 09:00",
    voteEnd: "2026-03-19 23:59",
    status: "pending",
    memo: "장비 지참 필수",
  },
  {
    id: "3",
    type: "regular",
    title: "정기활동",
    day: "목요일",
    date: "2026-03-12",
    location: "강남 스포츠센터",
    participantCount: 15,
    guestCount: 0,
    startTime: "19:00",
    endTime: "21:00",
    voteStart: "2026-03-10 09:00",
    voteEnd: "2026-03-12 18:00",
    status: "completed",
  },
];

type FilterType = "all" | "pending" | "ongoing" | "completed";

export default function VoteStatusPage() {
  const voteList = MOCK_VOTES;
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredList = voteList?.filter((vote) => {
    if (filter === "all") return true;
    return vote.status === filter;
  });

  const stats = {
    total: voteList?.length ?? 0,
    pending: voteList?.filter((v) => v.status === "pending").length ?? 0,
    ongoing: voteList?.filter((v) => v.status === "ongoing").length ?? 0,
    completed: voteList?.filter((v) => v.status === "completed").length ?? 0,
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "ongoing", label: "진행 중" },
    { key: "completed", label: "종료됨" },
  ];

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left font-sans">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">투표 예약 현황</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
          예약된 투표 정보를 확인하고 관리하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
        <div className="col-span-3 sm:col-span-1">
            <StatCard label="전체 투표" count={stats.total} color="text-gray-800" />
        </div>
        <StatCard label="대기중" count={stats.pending} color="text-orange-500" />
        <StatCard label="진행중" count={stats.ongoing} color="text-green-500" />
        <StatCard label="완료" count={stats.completed} color="text-blue-500" />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide font-black">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
              filter === f.key
                ? "bg-blue-500 text-white shadow-md shadow-blue-100"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 투표 카드 목록 */}
      <div className="space-y-4 sm:space-y-6">
        {filteredList?.map((vote) => (
          <VoteCard 
            key={vote.id} 
            vote={vote} 
            isExpanded={expandedId === vote.id} 
            onToggle={() => toggleAccordion(vote.id)} 
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="p-3 sm:p-5 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
      <p className="text-[10px] sm:text-sm text-gray-400 mb-1 font-bold uppercase">{label}</p>
      <p className={`text-base sm:text-2xl font-black ${color}`}>{count}<span className="text-xs ml-0.5 opacity-50">개</span></p>
    </div>
  );
}

function VoteCard({ vote, isExpanded, onToggle }: { vote: VoteStatus, isExpanded: boolean, onToggle: () => void }) {
  const isRegular = vote.type === "regular";
  const statusConfig = {
    pending: { text: "대기중", color: "bg-orange-50 text-orange-500" },
    ongoing: { text: "진행중", color: "bg-green-50 text-green-600" },
    completed: { text: "완료", color: "bg-gray-100 text-gray-400" },
  };
  const status = statusConfig[vote.status];

  return (
    <div className="bg-white rounded-[20px] sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div 
        className="p-4 sm:p-6 cursor-pointer sm:cursor-default active:bg-gray-50 sm:active:bg-white"
        onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
      >
        {/* [수정 포인트] 타이틀 라인: 좌측 정보와 우측 화살표를 양 끝으로 배치 */}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap ${isRegular ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
              {isRegular ? "정기" : "번개"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate pr-2">{vote.title}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 데스크탑에서 보이는 상태값과 수정 버튼 */}
            <div className="hidden sm:flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                {status.text}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
            </div>
            
            {/* 모바일에서만 보이는 상태 뱃지 */}
            <span className={`sm:hidden px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.color}`}>
              {status.text}
            </span>

            {/* [핵심] 맨 오른쪽 아코디언 화살표 */}
            <svg 
              className={`w-5 h-5 text-gray-300 transition-transform duration-300 sm:hidden ${isExpanded ? "rotate-180" : ""}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* 아코디언 바디 (모바일 전용 애니메이션) */}
        <div className={`transition-all duration-300 overflow-hidden sm:max-h-none sm:opacity-100 sm:mt-5 ${isExpanded ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0 sm:max-h-none"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-[13px] sm:text-sm pt-4 border-t border-gray-50 sm:border-none">
            <InfoField label="요일" value={vote.day} />
            <InfoField label="날짜" value={vote.date} />
            <InfoField label="장소" value={vote.location} />
            <InfoField label="참가 확인수" value={`${vote.participantCount + vote.guestCount}명(참${vote.participantCount}, 게${vote.guestCount})`} />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-[12px] sm:text-sm text-gray-500 relative">
            {/* 모바일 전용 수정 버튼 (아코디언 내부 배치) */}
            <button 
              onClick={(e) => { e.stopPropagation(); }}
              className="sm:hidden absolute top-4 right-0 text-gray-400 p-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            
            <div className="flex flex-col sm:flex-row sm:gap-x-8 gap-y-1.5">
              <p>운동 시간: <span className="text-gray-800 font-bold">{vote.startTime} - {vote.endTime}</span></p>
              <p>투표 시작: <span className="text-gray-800 font-bold">{vote.voteStart}</span></p>
            </div>
            <p>투표 종료: <span className="text-gray-800 font-bold">{vote.voteEnd}</span></p>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-[10px] sm:text-xs text-gray-400 mb-1 font-bold uppercase">메모</p>
            <p className="text-[13px] sm:text-sm text-gray-600 font-medium leading-relaxed">
              {vote.memo ? vote.memo : "등록된 메모가 없습니다."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 font-bold uppercase">{label}</p>
      <p className="font-bold text-gray-700 truncate">{value}</p>
    </div>
  );
}