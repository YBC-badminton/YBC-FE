"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// 상세 페이지용 모의 데이터 (사진 여러 장 포함)
const MOCK_DETAIL = {
    id: "1",
    category: "정기모임",
    title: "2026년 3월 첫째 주 정기모임",
    date: "2026.03.15",
    author: "운영진",
    content: `이번 정기모임에는 총 24분의 회원님들이 참석해주셨습니다. 봄을 맞이하여 새롭게 짠 복식 조로 미니 게임을 진행했는데, 다들 겨우내 갈고닦은 실력이 엄청나네요. 
    
    새로 오신 신입 회원 세 분도 금방 적응하셔서 즐겁게 운동했습니다. 특히 A조 결승전은 듀스까지 가는 접전 끝에 정말 명경기가 나왔습니다. 

    운동이 끝난 후에는 근처 식당에서 가볍게 치맥을 하며 친목을 다졌습니다. 다음 주 정기모임에도 많은 참석 부탁드립니다! 다치지 말고 즐턴합시다 🏸`,
    images: [
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?q=80&w=1200&auto=format&fit=crop",
    ],
};

export default function ActivityDetailPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false); // 마우스 호버 시 슬라이드 일시정지용

    const images = MOCK_DETAIL.images;

    // 1. 자동 슬라이드 로직 (4초마다 다음 사진으로)
    useEffect(() => {
        if (isPaused) return; // 사용자가 마우스를 올리고 있으면 멈춤

        const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4000);

        return () => clearInterval(timer);
    }, [images.length, isPaused]);

    // 2. 좌우 조작 버튼 핸들러
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            
            {/* 상단 네비게이션 */}
            <Link 
            href="/past-activities" 
            className="inline-flex items-center text-[14px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
            </Link>

            {/* 본문 컨테이너 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* 헤더 (제목, 카테고리, 날짜 등) */}
            <div className="p-6 sm:p-10 border-b border-gray-100 space-y-4">
                <span className="inline-block px-3 py-1 bg-[#5D677B] text-white rounded-lg text-[12px] font-bold shadow-sm">
                {MOCK_DETAIL.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {MOCK_DETAIL.title}
                </h1>
                <div className="flex items-center gap-4 text-[14px] text-gray-400 font-medium pt-2">
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {MOCK_DETAIL.author}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {MOCK_DETAIL.date}
                </span>
                </div>
            </div>

            {/* 사진 슬라이더 (Carousel) 영역 */}
            <div 
                className="relative w-full aspect-[4/3] sm:aspect-video bg-gray-900 group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* 이미지 */}
                <img
                src={images[currentIndex]}
                alt={`활동 사진 ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-500"
                />

                {/* 좌우 조작 버튼 (데스크탑: 호버 시 표시, 모바일: 항상 표시) */}
                {images.length > 1 && (
                <>
                    <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/90 backdrop-blur-sm text-white hover:text-gray-900 rounded-full transition-all sm:opacity-0 sm:group-hover:opacity-100"
                    >
                    <svg className="w-6 h-6 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/30 hover:bg-white/90 backdrop-blur-sm text-white hover:text-gray-900 rounded-full transition-all sm:opacity-0 sm:group-hover:opacity-100"
                    >
                    <svg className="w-6 h-6 pl-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7-7" /></svg>
                    </button>
                </>
                )}

                {/* 하단 인디케이터 (점) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                    <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                        currentIndex === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                    }`}
                    />
                ))}
                </div>
            </div>

            {/* 텍스트 본문 영역 */}
            <div className="p-6 sm:p-10 bg-white">
                <p className="text-[15px] sm:text-[16px] text-gray-700 leading-loose whitespace-pre-wrap font-medium">
                {MOCK_DETAIL.content}
                </p>
            </div>
            
            </div>
        </div>
        </div>
    );
}