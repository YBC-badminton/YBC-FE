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

// TODO: API 연동 시 useAxios로 교체
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
    { key: "all", label: "전체 활동" },
    { key: "ongoing", label: "진행 중인 투표" },
    { key: "completed", label: "종료된 투표" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">투표 예약 현황</h1>
        <p className="text-gray-500 text-sm mt-1">
          예약된 투표 정보를 확인하고 관리하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="전체 투표" count={stats.total} color="text-gray-800" />
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
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="space-y-6">
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
          <p className="text-center py-10 text-gray-400">
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
      className={`p-5 rounded-xl border border-gray-100 shadow-sm ${bgColor ?? "bg-white"}`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{count}개</p>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* 상단: 타입 배지 + 제목 + 상태 */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              isRegular
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {isRegular ? "정기활동" : "번개모임"}
          </span>
          <h2 className="text-lg font-bold text-gray-800">{vote.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
          >
            {status.text}
          </span>
          <button className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
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

      {/* 정보 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-sm">
        <InfoField label="요일" value={vote.day} />
        <InfoField label="날짜" value={vote.date} />
        <InfoField label="장소" value={vote.location} />
        <InfoField label="참가 확인수" value={`${vote.participantCount}명`} />
      </div>

      {/* 시간 정보 */}
      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-500">
        <div className="flex flex-wrap gap-x-8 gap-y-1">
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

      {/* 메모 */}
      {vote.memo && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs text-gray-400 mb-1">메모</p>
          <p className="text-sm text-gray-600">{vote.memo}</p>
        </div>
      )}
      {!vote.memo && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs text-gray-400">메모</p>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-700">{value}</p>
    </div>
  );
}
