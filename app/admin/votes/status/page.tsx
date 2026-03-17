'use client';

import React from 'react';
import { useAxios } from '@/hooks/useAxios';

// 투표 상세 데이터 타입 정의
interface VoteStatus {
    id: string;
    type: 'regular' | 'extra';
    title: string;
    day: string;
    date: string;
    location: string;
    participantCount: number;
    startTime: string;
    endTime: string;
    voteStart: string;
    voteEnd: string;
    status: 'pending' | 'ongoing' | 'completed';
}

export default function VoteStatusPage() {
    // 1. 서버에서 투표 현황 데이터 가져오기
    const { data: voteList, loading, error } = useAxios<VoteStatus[]>('/api/admin/votes/status');

    // 2. 서버에서 가져온 데이터를 기반으로 통계 계산
    const stats = {
        total: voteList ? voteList.length : 0,
        pending: voteList ? voteList.filter(vote => vote.status === 'pending').length : 0,
        ongoing: voteList ? voteList.filter(vote => vote.status === 'ongoing').length : 0,
        completed: voteList ? voteList.filter(vote => vote.status === 'completed').length : 0,
    };

    return (
        <div className="max-w-6xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">투표 예약 현황</h1>
            <p className="text-gray-500">예약된 투표 정보를 확인하고 관리하세요.</p>
        </div>

        {/* 상단 요약 카드 섹션 */}
        <div className="grid grid-cols-4 gap-4 mb-10">
            <StatCard label="전체 투표" count={stats.total} color="text-gray-800" />
            <StatCard label="대기중" count={stats.pending} color="text-orange-500" />
            <StatCard label="진행중" count={stats.ongoing} color="text-green-500" />
            <StatCard label="완료" count={stats.completed} color="text-blue-500" />
        </div>

        {/* 투표 리스트 필터 섹션 [전체, 대기중, 진행중, 완료]*/}
        <div className="flex gap-4 mb-6">
            <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">전체</button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">대기중</button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">진행중</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">완료</button>
        </div>

        {/* 투표 리스트 섹션 */}
        <div className="space-y-6">
            {loading && <p className="text-center py-10 text-gray-400">현황을 불러오는 중입니다...</p>}
            {error && <p className="text-center py-10 text-red-500">데이터 로드 실패: {error}</p>}
            
            {!loading && voteList?.map((vote) => (
            <VoteDetailCard key={vote.id} vote={vote} />
            ))}
        </div>
        </div>
    );
    }

    // 상단 통계 카드 컴포넌트
    function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{count}개</p>
        </div>
    );
    }

    // 투표 상세 카드 컴포넌트 (디자인 핵심)
    function VoteDetailCard({ vote }: { vote: VoteStatus }) {
    const isRegular = vote.type === 'regular';
    const statusLabels = {
        pending: { text: '대기중', color: 'bg-orange-50 text-orange-500' },
        ongoing: { text: '진행중', color: 'bg-green-50 text-green-500' },
        completed: { text: '완료', color: 'bg-gray-50 text-gray-400' },
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative hover:shadow-md transition-shadow">
        {/* 카드 상단: 타입 배지 및 상태 */}
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-bold ${isRegular ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {isRegular ? '정기활동' : '번개'}
            </span>
            <h2 className="text-xl font-bold text-gray-800">{vote.title}</h2>
            </div>
            <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusLabels[vote.status].color}`}>
                {statusLabels[vote.status].text}
            </span>
            <button className="text-blue-500 hover:bg-blue-50 p-1 rounded transition">✏️</button>
            </div>
        </div>

        {/* 카드 중단: 주요 정보 그리드 */}
        <div className="grid grid-cols-4 gap-6 mb-8 text-sm text-gray-600">
            <div>
            <p className="text-gray-400 text-xs mb-1">요일</p>
            <p className="font-medium">📅 {vote.day}</p>
            </div>
            <div>
            <p className="text-gray-400 text-xs mb-1">날짜</p>
            <p className="font-medium">📅 {vote.date}</p>
            </div>
            <div>
            <p className="text-gray-400 text-xs mb-1">장소</p>
            <p className="font-medium">📍 {vote.location}</p>
            </div>
            <div>
            <p className="text-gray-400 text-xs mb-1">참가 인원</p>
            <p className="font-medium">👥 {vote.participantCount}명</p>
            </div>
        </div>

        {/* 카드 하단: 시간 정보 */}
        <div className="flex justify-between items-end pt-6 border-t border-gray-50 text-sm text-gray-500">
            <div className="space-y-1">
            <p>운동 시간: <span className="text-gray-800 font-medium">{vote.startTime} - {vote.endTime}</span></p>
            <p>투표 시작: {vote.voteStart}</p>
            </div>
            <div className="text-right">
            <p>투표 종료: {vote.voteEnd}</p>
            </div>
        </div>
        </div>
    );
}