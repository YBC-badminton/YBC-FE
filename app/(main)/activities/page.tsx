'use client';

import CreateLightningModal from '../../../components/ui/CreateLightningModal';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 1. 데이터 규격 정의
interface Activity {
    id: number;
    type: '정기모임' | '번개모임' | '대회';
    title: string;
    location: string;
    date: string;
    startTime: string; // 시작 시간 (예: "2026-03-24T18:00:00")
    endTime: string;   // 종료 시간 (예: "2026-03-24T21:00:00")
    currentParticipants: number;
    maxParticipants: number;
    }

    // 2. 예약 및 활동 시간이 포함된 더미 데이터
    const DUMMY_ACTIVITIES: Activity[] = [
    {
        id: 1,
        type: '정기모임',
        title: '1주차 화요일 정기활동',
        location: '양원나들목체육관',
        date: '26.03.24 (화)',
        startTime: '2026-03-24T16:00:00',
        endTime: '2026-03-24T18:00:00', // 현재 시간 기준 종료됨
        currentParticipants: 18,
        maxParticipants: 18,
    },
    {
        id: 2,
        type: '번개모임',
        title: '심야 번개 배드민턴',
        location: '마곡레포츠센터',
        date: '26.03.24 (화)',
        startTime: '2026-03-24T22:00:00',
        endTime: '2026-03-24T23:59:59', // 현재 시간 기준 진행 예정
        currentParticipants: 10,
        maxParticipants: 20,
    },
    {
        id: 3,
        type: '대회',
        title: '지난 주말 클럽 대항전',
        location: '강남 스포츠센터',
        date: '26.03.22 (일)',
        startTime: '2026-03-22T09:00:00',
        endTime: '2026-03-22T18:00:00', // 확실히 종료됨
        currentParticipants: 32,
        maxParticipants: 32,
    }
    ];

    export default function ActivitiesPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false); // 팝업 상태

    // 실시간 시간 업데이트 (1분 단위)
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // [핵심 로직] 시간 비교를 통한 분류
    // 1. 참여 가능 활동: 종료 시간(endTime)이 현재 시간보다 이후인 것
    const availableActivities = DUMMY_ACTIVITIES.filter(act => {
        const isNotExpired = new Date(act.endTime) > currentTime;
        const isTabMatched = activeTab === '전체' || act.type === activeTab;
        return isNotExpired && isTabMatched;
    });

    // 2. 이전 활동: 종료 시간(endTime)이 현재 시간보다 이전인 것
    const pastActivities = DUMMY_ACTIVITIES.filter(act => {
        const isExpired = new Date(act.endTime) <= currentTime;
        const isTabMatched = activeTab === '전체' || act.type === activeTab;
        return isExpired && isTabMatched;
    });

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-16">
                
                {/* 상단 탭 및 버튼 바 */}
                <div className="flex justify-between items-center">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {['전체', '정기모임', '번개모임', '대회'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab ? 'bg-[#4B7332] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab}
                    </button>
                    ))}
                </div>
                <button className="bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#1e3d1a] transition-all"
                    onClick={() => setIsModalOpen(true)}>
                    + 번개 모임 만들기
                </button>
                </div>

                {/* --- [A] 참여 가능 활동 섹션 --- */}
                <section className="space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">참여 가능 활동</h2>
                    <span className="bg-[#F2F8E1] text-[#4B7332] px-4 py-1.5 rounded-full text-xs font-black border border-[#E2EBC8]">
                    + {availableActivities.length} ACTIVITIES
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {availableActivities.length > 0 ? (
                    availableActivities.map(activity => (
                        <ActivityCard key={activity.id} data={activity} isPast={false} />
                    ))
                    ) : (
                    <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200 text-slate-400 font-bold">
                        현재 참여 가능한 활동이 없습니다.
                    </div>
                    )}
                </div>
                </section>

                {/* --- [B] 이전 활동 섹션 --- */}
                <section className="space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">이전 활동</h2>
                    <span className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-xs font-black">
                    + {pastActivities.length} ACTIVITIES
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-60 grayscale-[0.3]">
                    {pastActivities.map(activity => (
                    <ActivityCard key={activity.id} data={activity} isPast={true} />
                    ))}
                </div>
                </section>

            </div>
            {/* 팝업 컴포넌트 추가 */}
            <CreateLightningModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
    }

    /** 공용 활동 카드 컴포넌트 **/
    function ActivityCard({ data, isPast }: { data: Activity; isPast: boolean }) {
    const percentage = (data.currentParticipants / data.maxParticipants) * 100;
    
    // 시간 포맷팅 (ISO 문자열에서 시간만 추출)
    const timeString = `${new Date(data.startTime).getHours()}:00 ~ ${new Date(data.endTime).getHours()}:00`;

    return (
        <Link href={isPast ? '#' : `/activities/${data.id}`} className={isPast ? 'cursor-default' : 'cursor-pointer'}>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`w-16 h-16 rounded-xl flex-shrink-0 ${isPast ? 'bg-slate-300' : (data.type === '대회' ? 'bg-amber-500' : 'bg-[#3D6B2C]')}`} />
            
            <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">
                {data.type}
                </span>
                <h3 className="text-lg font-black text-slate-800">{data.title}</h3>
            </div>
            <div className="flex flex-col gap-1 text-sm font-bold text-slate-400">
                <p>📍 {data.location}</p>
                <p>📅 {data.date} {timeString}</p>
            </div>
            </div>

            <div className="w-48 text-right space-y-3">
            <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">참여 인원</div>
            <div className="text-2xl font-black text-slate-800">
                {data.currentParticipants} / <span className="text-slate-300">{data.maxParticipants}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                className={`h-full transition-all duration-500 ${isPast ? 'bg-slate-400' : 'bg-[#4B7332]'}`}
                style={{ width: `${percentage}%` }}
                />
            </div>
            </div>
        </div>
        </Link>
    );
}