"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// 1. 활동 기록 데이터 타입 정의
interface Activity {
    id: string;
    category: string;
    title: string;
    date: string;
    content: string;
    imageUrl: string;
    author: string;
}

// 카테고리 탭 목록
const CATEGORIES = ["전체", "정기모임", "번개모임", "대회", "행사"];

export default function PastActivitiesPage() {
    const [activeCategory, setActiveCategory] = useState("전체");
    
    // API 연동을 위한 상태 관리
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. 백엔드 API 데이터 패칭 (GET)
    useEffect(() => {
        const fetchActivities = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // TODO: 실제 백엔드 API 엔드포인트로 교체하세요. (예: axios.get('/api/activities'))
            // const response = await axios.get('/api/activities');
            // setActivities(response.data);

            // --- 테스트를 위한 임시 Mock API 통신 (실제 연결 시 아래 블록 삭제) ---
            await new Promise((resolve) => setTimeout(resolve, 800)); // 로딩 지연 시뮬레이션
            const mockData: Activity[] = [
            {
                id: "1",
                category: "정기모임",
                title: "2026년 3월 첫째 주 정기모임",
                date: "2026.03.15",
                content: "이번 정기모임에는 총 24분의 회원님들이 참석해주셨습니다. 봄을 맞이하여 새롭게 짠 복식 조로 미니 게임을 진행했는데, 다들 겨우내 갈고닦은 실력이 엄청나네요. 새로 오신 신입 회원 세 분도 금방 적응하셔서 즐겁게 운동했습니다. 다음 주에도 많은 참석 부탁드립니다!",
                imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop", // 배드민턴 코트/라켓 관련 고화질 무료 이미지
                author: "운영진",
            },
            {
                id: "2",
                category: "대회",
                title: "2026 양배추 클럽 상반기 자체 토너먼트",
                date: "2026.03.01",
                content: "치열했던 상반기 자체 토너먼트 대회가 무사히 마무리되었습니다. A조부터 C조까지 각 조별 우승자분들 모두 축하드리며, 아쉽게 탈락하신 분들도 멋진 경기력 보여주셔서 감사합니다. 대회 준비하느라 고생하신 운영진 및 후원해주신 모든 분들께 감사드립니다.",
                imageUrl: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800&auto=format&fit=crop",
                author: "운영진",
            },
            {
                id: "3",
                category: "번개모임",
                title: "주말 아침 올림픽공원 번개 ⚡",
                date: "2026.02.21",
                content: "주말 아침 일찍부터 상쾌하게 땀 흘린 번개모임이었습니다. 아침 7시 모임이라 많이 안 오실 줄 알았는데 무려 12명이나 모이셨네요! 가볍게 몸 풀고 2시간 꽉 채워서 난타 및 게임 진행했습니다. 운동 끝나고 다 같이 먹은 국밥은 정말 최고였습니다.",
                imageUrl: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?q=80&w=800&auto=format&fit=crop",
                author: "김민수",
            },
            {
                id: "4",
                category: "행사",
                title: "2026년 신입회원 환영회 및 회식",
                date: "2026.02.10",
                content: "올해 새로 가입하신 신입 회원분들을 환영하는 자리를 가졌습니다. 운동장 밖에서 사복 입고 만나니 다들 새로우시죠? 😆 맛있는 고기도 먹고, 간단한 레크리에이션도 하면서 서로 금방 친해질 수 있는 뜻깊은 시간이었습니다. 앞으로도 다치지 말고 즐턴합시다!",
                imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
                author: "운영진",
            },
            ];
            setActivities(mockData);
            // -----------------------------------------------------------------

        } catch (err) {
            console.error("활동 기록을 불러오는 중 오류 발생:", err);
            setError("데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
        };

        fetchActivities();
    }, []);

    // 카테고리 필터링 로직
    const filteredActivities = activities.filter((activity) =>
        activeCategory === "전체" ? true : activity.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-6xl mx-auto">
            
            {/* 헤더 영역 */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">지난 활동</h1>
            <p className="text-[14px] text-gray-500 mt-2 font-medium">
                동아리원들과 함께한 지난 배드민턴 활동과 추억을 확인해보세요
            </p>
            </div>

            {/* 필터 탭 */}
            <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                {CATEGORIES.map((category) => (
                <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-5 py-2.5 rounded-lg text-[14px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === category
                        ? "bg-[#5D677B] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                    {category}
                </button>
                ))}
            </div>
            </div>

            {/* 데이터 로딩, 에러, 목록 표시 영역 */}
            {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#5D677B] rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold">기록을 불러오는 중입니다...</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredActivities.map((activity) => (
                /* [핵심] 상세 페이지로 이동하는 Link 추가 */
                <Link key={activity.id} href={`/past-activities/${activity.id}`}>
                    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow cursor-pointer h-full">
                    {/* 이미지 영역 */}
                    <div className="relative w-full h-52 sm:h-64 overflow-hidden bg-gray-100">
                        <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg text-[12px] font-bold shadow-sm">
                            {activity.category}
                        </span>
                        </div>
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="p-6 sm:p-7 flex flex-col flex-1">
                        <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                        {activity.title}
                        </h2>
                        <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-3 mb-6 flex-1">
                        {activity.content}
                        </p>
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[13px] text-gray-400 font-medium mt-auto">
                        <span>{activity.author}</span>
                        <span>{activity.date}</span>
                        </div>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            )}
        </div>
    </div>
    );
}