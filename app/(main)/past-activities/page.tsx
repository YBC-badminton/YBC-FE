"use client";

import React from "react";
import Link from "next/link";

// 하드코딩된 활동 데이터
const HARDCODED_ACTIVITIES = [
    {
        id: "regular", // regular (정식 복식 경기)
        subtitle: "매주 화, 토요일마다",
        title: "정기 복식 경기",
        imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop", 
        heightClass: "h-[280px] sm:h-[320px]",
    },
    {
        id: "tournament", // tournament (자체 경기)
        subtitle: "부원들끼리 실력을 판가름하는",
        title: "자체 경기",
        imageUrl: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    },
    {
        id: "cabbage-day", // cabbage-day (양배추의 날)
        subtitle: "부원들끼리 친목을 다지는",
        title: "양배추의 날",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    },
    {
        id: "party", // party (뒷풀이)
        subtitle: "종종 정기 운동이 끝나고 난 후는",
        title: "뒷풀이",
        imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    },
    {
        id: "flash", // flash (번개 운동)
        subtitle: "마음이 맞는 부원끼리",
        title: "번개 운동",
        imageUrl: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    },
];

export default function PastActivitiesPage() {
    return (
        <div className="min-h-screen bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                
                {/* 헤더 영역 */}
                <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
                    <img 
                        src='/images/Star.png' 
                        alt='star icon' 
                        className="w-12 h-12 object-contain mb-4" 
                    />
                    <h1 className="text-4xl sm:text-5xl font-black text-[#1E8A44] tracking-wider uppercase mb-3">
                        ACTIVITY
                    </h1>
                    <p className="text-[14px] sm:text-[15px] text-gray-400 font-medium">
                        양배추 부원들과 함께한 활동을 소개합니다.
                    </p>
                </div>

                {/* 활동 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {HARDCODED_ACTIVITIES.map((pastActivity, idx) => (
                        <Link
                            key={pastActivity.id} 
                            href={`/past-activities/${pastActivity.id}`}
                            className={`block group relative overflow-hidden rounded-[20px] shadow-sm cursor-pointer ${idx === 0 ? "md:col-span-2" : "col-span-1"}`}
                        >
                            <div className={`relative w-full ${pastActivity.heightClass} bg-gray-100 overflow-hidden`}>
                                
                                <img
                                    src={pastActivity.imageUrl}
                                    alt={pastActivity.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-[#1E8A44]/10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1E8A44]/90 via-[#1E8A44]/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end transform transition-transform duration-500 group-hover:-translate-y-1">
                                    
                                    {/* [수정 포인트] 카드 내부 셔틀콕 아이콘 img 태그로 변경 및 경로 수정 */}
                                    <div className="mb-2">
                                        <img 
                                            src='/images/applicants.png' 
                                            alt='셔틀콕 아이콘' 
                                            /* 검은색 아이콘이라면 흰색 글씨와 어울리도록 하얀색으로 반전(brightness-0 invert)시킬 수 있습니다.
                                               원래 색을 쓰시려면 'brightness-0 invert' 부분을 지워주세요! */
                                            className="w-10 h-10 object-contain opacity-90" 
                                        />
                                    </div>

                                    <p className="text-white/90 text-[12px] sm:text-[13px] font-bold mb-1 tracking-tight">
                                        {pastActivity.subtitle}
                                    </p>
                                    <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight">
                                        {pastActivity.title}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* [수정 포인트] 하단 장식용 셔틀콕 아이콘도 img 태그로 변경 */}
                <div className="flex justify-center items-center gap-2 mt-12 opacity-40">
                    <img 
                        src='/images/applicants.png' 
                        alt='셔틀콕 장식 좌측' 
                        className="w-10 h-10 object-contain transform" 
                    />
                    <img 
                        src='/images/applicants.png' 
                        alt='셔틀콕 장식 우측' 
                        className="w-10 h-10 object-contain transform" 
                    />
                </div>

            </div>
        </div>
    );
}