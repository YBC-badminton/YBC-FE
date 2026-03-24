'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// 1. 서버 데이터를 대신할 더미 데이터 (데이터 구조 일원화)
const DUMMY_ACTIVITIES = [
    {
        id: 1,
        type: '정기모임' as const,
        title: '3.21(토) 정기 운동',
        location: '망원나들목체육관',
        date: '2026-03-21 (토)',
        startTime: '2026-03-21 16:00',
        endTime: '2026-03-21 18:00',
        currentParticipants: 20,
        maxParticipants: 25,
        limit: '25명 (선착순)',
        voteEnd: '2026-03-20 23:59',
        attendingList: [
        '김철수', '이영희', '박민수', '정다은', '최준호', 
        '강서연', '윤지우', '이진우', '김소윤', '박재현',
        '최유진', '한상우', '서예지', '장동우', '임지민',
        '조현우', '신지아', '고민재', '배수지', '안진우'
        ],
        absentList: ['홍길동', '성춘향'],
        guestList: [
        { name: '윤정원', detail: '최현서 / 성별:여 / 실력:D', time: '03.18 13:00' },
        { name: '김민수', detail: '박서준 / 성별:남 / 실력:C', time: '03.18 14:30' },
        { name: '이지영', detail: '정유진 / 성별:여 / 실력:B', time: '03.18 15:20' },
        ]
    }
    ];

    export default function ActivityVotePage() {
    const params = useParams();
    const [guestName, setGuestName] = useState('');
    
    // URL의 id와 일치하는 데이터 찾기
    const activityId = Number(params.id) || 1;
    const activity = DUMMY_ACTIVITIES.find((item) => item.id === activityId) || DUMMY_ACTIVITIES[0];

    // 명단 열림/닫힘 상태 관리
    const [showAttending, setShowAttending] = useState(false);
    const [showAbsent, setShowAbsent] = useState(false);

    // 참석률 계산
    const attendanceRate = Math.round((activity.currentParticipants / activity.maxParticipants) * 100);

    // 안전한 시간 포맷팅 함수
    const formatTime = (dateTimeStr: string) => {
        const parts = dateTimeStr.split(' ');
        return parts[1] || dateTimeStr; 
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans select-none relative pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
            
            {/* 상단 뒤로가기 */}
            <Link href="/activities" className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
            ← 목록으로 돌아가기
            </Link>

            {/* --- [1] 활동 요약 카드 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-center gap-2">
                <span className="bg-[#4B7332] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {activity.type}
                </span>
                <h1 className="text-3xl font-black text-slate-800">{activity.title}</h1>
            </div>
            
            <div className="bg-[#F2F8E1] p-6 rounded-2xl grid grid-cols-2 gap-y-6">
                <InfoItem icon="📍" label="장소" value={activity.location} />
                <InfoItem 
                icon="⏰" 
                label="시간" 
                value={`${formatTime(activity.startTime)} ~ ${formatTime(activity.endTime)}`} 
                />
                <InfoItem icon="👥" label="인원제한" value={activity.limit} />
            </div>
            
            {/* 투표 기간 안내 */}
            <div className="bg-white border border-gray-100 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <span>📅</span> 투표 종료: {activity.voteEnd}
                </div>
                <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                <span className="animate-pulse">⏱️</span> 투표 진행 중!
                </div>
            </div>
            </section>

            {/* --- [2] 참석/불참 현황 (명단 아코디언) --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-8 relative z-10">
            <h3 className="text-xl font-black text-slate-800">참석/불참 현황</h3>
            
            <div className="space-y-10">
                {/* 참석 섹션 */}
                <div className="space-y-4">
                <div 
                    className="flex justify-between items-end cursor-pointer group"
                    onClick={() => setShowAttending(!showAttending)}
                >
                    <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800">참석</span>
                    <span className="text-xs text-slate-400 font-bold group-hover:text-green-700 transition-colors">
                        {showAttending ? '▲ 명단 접기' : '▼ 명단 보기'}
                    </span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 transition-transform group-hover:scale-105">
                    {activity.currentParticipants}명
                    </span>
                </div>
                
                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden relative shadow-inner">
                    <div className="h-full bg-[#4B7332] transition-all duration-700" style={{ width: `${attendanceRate}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow-sm">{attendanceRate}%</span>
                </div>

                {showAttending && (
                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-inner max-h-[400px] overflow-y-auto animate-fade-in custom-scrollbar mt-6">
                    {activity.attendingList.map((name, idx) => (
                        <MemberListItem key={idx} index={idx + 1} name={name} isAttending={true} />
                    ))}
                    </div>
                )}
                </div>

                {/* 불참 섹션 */}
                <div className="space-y-4">
                <div 
                    className="flex justify-between items-end cursor-pointer group"
                    onClick={() => setShowAbsent(!showAbsent)}
                >
                    <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800">불참</span>
                    <span className="text-xs text-slate-400 font-bold group-hover:text-slate-600 transition-colors">
                        {showAbsent ? '▲ 명단 접기' : '▼ 명단 보기'}
                    </span>
                    </div>
                    <span className="text-2xl font-black text-slate-800 transition-transform group-hover:scale-105">
                    {activity.absentList.length}명
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-slate-400 w-[5%]" />
                </div>

                {showAbsent && (
                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 shadow-inner animate-fade-in mt-6">
                    {activity.absentList.map((name, idx) => (
                        <MemberListItem key={idx} index={idx + 1} name={name} isAttending={false} />
                    ))}
                    </div>
                )}
                </div>
            </div>
            </section>

            {/* --- [3] 참석 여부 선택 버튼 --- */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
            <button className="py-5 bg-white border border-gray-200 text-slate-800 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]">불참</button>
            <button className="py-5 bg-[#4B7332] text-white font-black rounded-2xl hover:bg-[#3d5d28] transition-all shadow-md active:scale-[0.98]">참석</button>
            </div>

            {/* --- [4] 게스트 신청 리스트 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
            <h3 className="text-xl font-black text-slate-800">게스트 신청</h3>
            <div className="space-y-3">
                {activity.guestList.map((guest, idx) => (
                <div key={idx} className="p-5 bg-slate-50/50 border border-gray-100 rounded-2xl flex justify-between items-start hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">{guest.name}</span>
                        <button className="text-slate-300 hover:text-red-500 transition-colors text-lg">×</button>
                    </div>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">{guest.detail}</p>
                    <p className="text-[10px] font-bold text-slate-300">{guest.time}</p>
                    </div>
                </div>
                ))}
            </div>
            </section>

            {/* --- [5] 게스트 추가 폼 --- */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6 mb-10">
            <h3 className="text-xl font-black text-slate-800">게스트 추가</h3>
            <div className="space-y-4">
                <input 
                type="text" 
                placeholder="게스트 이름" 
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                <select className="p-4 border border-gray-200 rounded-xl text-slate-400 font-bold bg-white focus:outline-none cursor-pointer">
                    <option>성별</option>
                    <option>남</option>
                    <option>여</option>
                </select>
                <select className="p-4 border border-gray-200 rounded-xl text-slate-400 font-bold bg-white focus:outline-none cursor-pointer">
                    <option>실력</option>
                    <option>A (최상)</option>
                    <option>B (상)</option>
                    <option>C (중)</option>
                    <option>D (하)</option>
                </select>
                </div>
                <button className="w-full py-5 bg-[#4B7332] text-white font-black rounded-2xl shadow-md hover:bg-[#3d5d28] transition-all active:scale-[0.98]">
                등록
                </button>
            </div>
            </section>

        </div>
        </div>
    );
    }

    /** 명단 아이템 컴포넌트 **/
    function MemberListItem({ index, name, isAttending }: { index: number; name: string; isAttending: boolean }) {
    return (
        <div className="flex items-center p-5 gap-6 transition-colors hover:bg-slate-50/50">
        <div className="w-12 text-center text-sm font-bold text-slate-300 tabular-nums">
            {index}
        </div>
        <div className={`text-[15px] font-black ${isAttending ? 'text-slate-800' : 'text-slate-500'}`}>
            {name}
        </div>
        </div>
    );
    }

    // 정보 아이템 컴포넌트
    function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
        <span className="text-lg">{icon}</span>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-[15px] font-black text-slate-700">{value}</span>
        </div>
        </div>
    );
}