'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. 임포트 추가
import CreateLightningModal from '../../../components/ui/CreateLightningModal';

// 1. 데이터 규격 정의
interface Activity {
    id: number;
    type: '정기모임' | '번개모임' | '대회';
    title: string;
    location: string;
    date: string;
    startTime: string; 
    endTime: string;   
    currentParticipants: number;
    maxParticipants: number;
}

// 2. 더미 데이터
const DUMMY_ACTIVITIES: Activity[] = [
    {
        id: 1,
        type: '정기모임',
        title: '1주차 화요일 정기활동',
        location: '망원나들목체육관',
        date: '26.03.31 (화)',
        startTime: '2026-03-23T16:00:00',
        endTime: '2026-03-31T18:00:00',
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
        endTime: '2026-03-24T23:59:59',
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
        endTime: '2026-03-22T18:00:00',
        currentParticipants: 32,
        maxParticipants: 32,
    },
    {
        id: 4,
        type: '정기모임',
        title: '활동 2',
        location: '망원나들목체육관',
        date: '26.03.30 (월)',
        startTime: '2026-03-30T10:00:00',
        endTime: '2026-03-30T22:00:00',
        currentParticipants: 16,
        maxParticipants: 18,
    }
];

export default function ActivitiesPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const availableActivities = DUMMY_ACTIVITIES.filter(act => {
        const isNotExpired = new Date(act.endTime) > currentTime;
        const isTabMatched = activeTab === '전체' || act.type === activeTab;
        return isNotExpired && isTabMatched;
    });

    const pastActivities = DUMMY_ACTIVITIES.filter(act => {
        const isExpired = new Date(act.endTime) <= currentTime;
        const isTabMatched = activeTab === '전체' || act.type === activeTab;
        return isExpired && isTabMatched;
    });

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-10 sm:space-y-16">

                {/* 상단 탭 및 버튼 바 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                        {['전체', '정기모임', '번개모임', '대회'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'bg-[#4B7332] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="bg-[#2D5A27] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:bg-[#1e3d1a] transition-all text-sm sm:text-base"
                        onClick={() => setIsModalOpen(true)}>
                        + 번개 모임 만들기
                    </button>
                </div>

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
            <CreateLightningModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}

/** 공용 활동 카드 컴포넌트 **/
function ActivityCard({ data, isPast }: { data: Activity; isPast: boolean }) {
    const router = useRouter(); // 라우터 선언
    const percentage = (data.currentParticipants / data.maxParticipants) * 100;
    const timeString = `${new Date(data.startTime).getHours()}:00 ~ ${new Date(data.endTime).getHours()}:00`;

    // 카드 전체 클릭 핸들러
    const handleCardClick = () => {
        if (!isPast) {
            router.push(`/activities/${data.id}`);
        }
    };

    return (
        <div className="relative group">
            <div
                onClick={handleCardClick}
                className={`bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-all relative ${isPast ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5'}`}
            >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 ${isPast ? 'bg-slate-300' : (data.type === '대회' ? 'bg-amber-500' : 'bg-[#3D6B2C]')}`} />

                <div className="flex-grow space-y-2 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase">
                            {data.type}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-800">{data.title}</h3>

                        {!isPast && (
                            <Link
                                href={`/activities/${data.id}/tournament`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                className="bg-[#4B7332] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap drop-shadow-sm hover:bg-[#3d5d28] transition-colors z-20"
                            >
                                대진
                            </Link>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm font-bold text-slate-400">
                        <p>📍 {data.location}</p>
                        <p>📅 {data.date} {timeString}</p>
                    </div>
                </div>

                <div className="w-full sm:w-48 sm:text-right space-y-2 sm:space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex-shrink-0">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">참여 인원</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-800">
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
        </div>
    );
}