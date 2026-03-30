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
  const loading = false;
  const error = null;
  const [filter, setFilter] = useState<FilterType>("all");

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">투표 예약 현황</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          예약된 투표 정보를 확인하고 관리하세요.
        </p>
      </div>

      {/* 통계 카드 - 모바일 3열 배치 최적화 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {/* 전체 투표: 첫 줄 전체 차지 */}
        <div className="col-span-3 sm:col-span-1">
            <StatCard label="전체 투표" count={stats.total} color="text-gray-800" />
        </div>
        {/* 나머지 3개: 둘째 줄 3열 배치 */}
        <StatCard
          label="대기중"
          count={stats.pending}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="진행중"
          count={stats.ongoing}
          color="text-green-500"
          bgColor="bg-green-50"
        />
        <StatCard
          label="완료"
          count={stats.completed}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.key
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 투표 카드 목록 */}
      <div className="space-y-4 sm:space-y-6">
        {loading && (
          <p className="text-center py-10 text-gray-400">
            현황을 불러오는 중입니다...
          </p>
        )}
        {error && (
          <p className="text-center py-10 text-red-500">
            데이터 로드 실패: {error}
          </p>
        )}

        {!loading &&
          filteredList?.map((vote) => <VoteCard key={vote.id} vote={vote} />)}

        {!loading && !error && filteredList?.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">
            해당하는 투표가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  color: string;
  bgColor?: string;
}) {
  return (
    <div
      className={`p-3 sm:p-5 rounded-xl border border-gray-100 shadow-sm ${bgColor ?? "bg-white"}`}
    >
      <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-medium">{label}</p>
      <p className={`text-base sm:text-2xl font-bold ${color}`}>{count}개</p>
    </div>
  );
}

function VoteCard({ vote }: { vote: VoteStatus }) {
  const isRegular = vote.type === "regular";

  const statusConfig = {
    pending: { text: "대기중", color: "bg-orange-50 text-orange-500" },
    ongoing: { text: "진행중", color: "bg-green-50 text-green-500" },
    completed: { text: "완료", color: "bg-gray-100 text-gray-400" },
  };

  const status = statusConfig[vote.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap ${
              isRegular
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {isRegular ? "정기" : "번개"}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{vote.title}</h2>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${status.color}`}
          >
            {status.text}
          </span>
          <button className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-[13px] sm:text-sm">
        <InfoField label="요일" value={vote.day} />
        <InfoField label="날짜" value={vote.date} />
        <InfoField label="장소" value={vote.location} />
        <InfoField label="참가 확인수" value={`${vote.participantCount}명`} />
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2 text-[12px] sm:text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row sm:gap-x-8 gap-y-1.5">
          <p>
            운동 시간:{" "}
            <span className="text-gray-800 font-medium">
              {vote.startTime} - {vote.endTime}
            </span>
          </p>
          <p>
            투표 시작:{" "}
            <span className="text-gray-800 font-medium">{vote.voteStart}</span>
          </p>
        </div>
        <p>
          투표 종료:{" "}
          <span className="text-gray-800 font-medium">{vote.voteEnd}</span>
        </p>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">메모</p>
        <p className="text-[13px] sm:text-sm text-gray-600">
          {vote.memo ? vote.memo : "등록된 메모가 없습니다."}
        </p>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-700 truncate">{value}</p>
    </div>
  );
}