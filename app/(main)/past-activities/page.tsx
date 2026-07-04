"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Calendar } from 'lucide-react';

// 하드코딩된 활동 데이터
const HARDCODED_ACTIVITIES = [
    {
        id: "regular", // regular (정기 운동)
        subtitle: "매주 화, 토요일마다",
        title: "정기운동",
        imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop", 
        heightClass: "h-[280px] sm:h-[320px]",
    },
    {
        id: "event", // event (이벤트)
        subtitle: "부원들끼리 실력을 판가름하는",
        title: "이벤트",
        imageUrl: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    },
    {
        id: "party", // party (뒷풀이)
        subtitle: "종종 정기 운동이 끝나고 난 후는",
        title: "뒷풀이",
        imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop",
        heightClass: "h-[240px] sm:h-[260px]",
    }
];

/* ── 공용 아이콘 (Figma: tabler / solar 세트) ─────────────── */
function PinIcon({ className = "" }: { className?: string }) {
    return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        >
        <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.36 11.43 6.63 11.69a1.25 1.25 0 0 0 1.74 0c.27-.26 6.63-6.44 6.63-11.69C19.5 5.36 16.14 2 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z" />
        </svg>
    );
}
function CalendarIcon({ className = "" }: { className?: string }) {
  return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        >
        <rect x="3" y="4.5" width="18" height="17" rx="3" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
        </svg>
    );
}
function PeopleIcon({ className = "" }: { className?: string }) {
    return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        >
        <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-2a4 4 0 0 0-3-3.87M16 2.13A4 4 0 0 1 16 9.87" />
        </svg>
    );
}
function ArrowUpRight({ className = "" }: { className?: string }) {
    return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        >
        <path d="M7 17 17 7M9 7h8v8" />
        </svg>
    );
}

function MailIcon({ className = "" }: { className?: string }) {
    return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function InstagramIcon({ className = "" }: { className?: string }) {
    return (
        <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

export default function PastActivitiesPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans select-none bg-white">
            <section className="relative w-full -top-[96px] min-h-[700px] bg-gradient-to-b from-[#FDFFEE] to-[#E3EDA9] overflow-hidden flex flex-col items-center">

                {/* 1. 메인 히어로 텍스트 및 캐릭터 영역 */}
                <div className="relative z-10 flex flex-col items-center text-center mt-48 px-4 w-full max-w-4xl">
                    
                    {/* 메인 타이틀 */}
                    <h1 className="text-3xl md:text-[42px] font-black text-[#445028] mb-6 tracking-tight">
                        양배추의 지난 활동을 소개합니다!
                    </h1>
                    
                    {/* 서브 텍스트 & 캐릭터 컨테이너 */}
                    <div className="relative flex justify-center w-full mt-2">
                        <p className="text-[#5b663b] font-medium leading-[1.8] text-[14px] md:text-[15px]">
                            매주 만나는 정기운동부터,<br className="block md:hidden" /> 함께 겨루고 즐거움을 나누는 이벤트,<br className="block" />
                            그리고 운동 뒤의 뒷풀이까지.<br className="block" />
                            양배추의 모든 활동을 한눈에 담았어요.
                        </p>

                        {/* 캐릭터 이미지 (절대 좌표로 우측에 자연스럽게 배치) */}
                        {/* 실제 프로젝트에 맞게 src 경로를 "/cabbage-character.png" 등으로 수정해주세요 */}
                        <div className="absolute top-[80%] md:-top-8 md:translate-y-0 right-0 md:-right-8 w-40 md:w-60 z-20 pointer-events-none">
                            <img 
                                src="images/character-left-re.svg" 
                                alt="양배추 캐릭터" 
                                className="w-full h-auto object-contain drop-shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. 하단 곡선 물결 (Wave SVG) */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg
                        className="relative block w-full h-[60px] md:h-[120px]"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C6.18,3.58,12.43,6.86,18.84,9.85,115.86,55.43,212.57,75.92,321.39,56.44Z"
                            className="fill-white"
                        ></path>
                    </svg>
                </div>
                
            </section>

            <section className="w-full bg-white py-20 flex flex-col items-center overflow-hidden">
            
                {/* =========================================
                    ACTIVITY 01: 정기모임
                ========================================= */}
                <div className="w-full max-w-5xl flex flex-col items-center mb-32 px-4 sm:px-6">
                    <span className="bg-[#93C54B] text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest mb-10 shadow-sm">
                        ACTIVITY 01
                    </span>
                    
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 sm:gap-0">
                        <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">정기모임</h2>
                        <p className="text-left sm:text-right text-[13px] sm:text-sm text-gray-500 font-medium leading-relaxed pt-8">
                            매주 두 번, 화요일과 토요일에 만나요<br />
                            꾸준함이 실력이 되는 양배추의 기본 루틴이에요.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 화요 운동 카드 */}
                        <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_20px_rgb(0,0,0,0.13)] border border-gray-50 transition-transform hover:-translate-y-1 duration-300">
                            <div className="w-full h-[200px] bg-gray-50 rounded-[24px] mb-6">
                                {/* 실제 이미지 사용 시 아래 img 태그 활용 */}
                                {/* <img src="/image-path.jpg" alt="화요 운동" className="w-full h-full object-cover rounded-[24px]" /> */}
                            </div>
                            <div className="px-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">화요 운동</h3>
                                <div className="space-y-2">
                                    <p className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
                                        <MapPin className="w-4 h-4 text-gray-400" /> 마포구민체육센터
                                    </p>
                                    <p className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" /> 매주 화요일 19:30 - 22:00
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 토요 운동 카드 */}
                        <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_20px_rgb(0,0,0,0.13)] border border-gray-50 transition-transform hover:-translate-y-1 duration-300">
                            <div className="w-full h-[200px] bg-gray-50 rounded-[24px] mb-6"></div>
                            <div className="px-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">토요 운동</h3>
                                <div className="space-y-2">
                                    <p className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
                                        <MapPin className="w-4 h-4 text-gray-400" /> 마곡 실내배드민턴장
                                    </p>
                                    <p className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-400" /> 매주 토요일 14:00 - 18:00
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    ACTIVITY 02: 이벤트
                ========================================= */}
                <div className="w-full max-w-5xl flex flex-col items-center mb-32 px-4 sm:px-6">
                    <span className="bg-[#93C54B] text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest mb-10 shadow-sm">
                        ACTIVITY 02
                    </span>
                    
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 sm:gap-0">
                        <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">이벤트</h2>
                        <p className="text-left sm:text-right text-[13px] sm:text-sm text-gray-500 font-medium leading-relaxed pt-8">
                            코트 위 진검승부부터 코트 밖 1박 2일까지.<br />
                            함께라서 더 특별한 순간들.
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 자체 대회 카드 */}
                        <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_20px_rgb(0,0,0,0.13)] border border-gray-50 transition-transform hover:-translate-y-1 duration-300">
                            <div className="w-full h-[200px] bg-gray-50 rounded-[24px] mb-6"></div>
                            <div className="px-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">양배추 자체 대회</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed ">
                                    실력보다 즐기는 마음이 먼저!<br />
                                    팀을 나눠 토너먼트로 겨루고, 시상까지 이어지는 양배추의 축제예요.
                                </p>
                            </div>
                        </div>

                        {/* MT 카드 */}
                        <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_20px_rgb(0,0,0,0.13)] border border-gray-50 transition-transform hover:-translate-y-1 duration-300">
                            <div className="w-full h-[200px] bg-gray-50 rounded-[24px] mb-6"></div>
                            <div className="px-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">단합 MT</h3>
                                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                                    라켓을 잠시 내려놓고 떠나는 1박 2일.<br />
                                    코트 밖에서 더 가까워지는, 양배추다운 단합의 시간이에요.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    ACTIVITY 03: 뒷풀이
                ========================================= */}
                <div className="w-full max-w-5xl flex flex-col items-center px-4 sm:px-6 relative">
                    <span className="bg-[#93C54B] text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest mb-10 shadow-sm">
                        ACTIVITY 03
                    </span>
                    
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 sm:gap-0">
                        <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">뒷풀이</h2>
                        <p className="text-left sm:text-right text-[13px] sm:text-sm text-gray-500 font-medium leading-relaxed pt-8">
                            운동이 끝나고 모여요!<br />
                            땀 흘린 뒤 다 같이 모이는 즐거운 시간.
                        </p>
                    </div>

                    <div className="w-full flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        {/* 좌측: 비정형 이미지 도형 (Blob) */}
                        <div className="w-full md:w-[500px] flex justify-center">
                            <div className="w-full max-w-[400px] max-h-[300px] aspect-square bg-[#F8FAF3] rounded-[77%_23%_70%_30%/22%_28%_72%_78%] overflow-hidden flex items-center justify-center shadow-inner">
                                {/* 실제 사진이 들어갈 경우 */}
                                {/* <img src="/afterparty.jpg" alt="뒷풀이 사진" className="w-full h-full object-cover" /> */}
                            </div>
                        </div>

                        {/* 우측: 텍스트 및 캐릭터 */}
                        <div className="flex-1 relative pb-20 md:pb-0">
                            <div className="space-y-6">
                                <p className="text-[15px] sm:text-base text-gray-800 font-bold leading-[1.8]">
                                    시원한 한 잔과 함께 나누는 오늘의 명장면들.<br />
                                    부담 없이 모여 이야기하다 보면<br />
                                    어느새 더 끈끈해진 양배추를 만나게 돼요.
                                </p>
                                <p className="text-[13px] sm:text-sm text-gray-600 font-medium leading-[1.8]">
                                    참석은 필수가 아니에요.<br />
                                    자유롭게 이야기를 나누며<br />
                                    부원들과 함께해요.
                                </p>
                            </div>
                            
                            {/* 캐릭터 이미지 (우측 하단 절대 좌표 배치) */}
                            <div className="absolute -bottom-8 right-0 md:-bottom-20 md:-right-10 w-28 md:w-60 z-10">
                                {/* 프로젝트 내 캐릭터 경로로 수정 */}
                                <img 
                                    src="images/character-map.svg" 
                                    alt="양배추 캐릭터" 
                                    className="w-full h-auto drop-shadow-md hidden md:block"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
            </section>

            {/* ── 지원하기 및 푸터 ─────────────────────────────────────── */}
            <section
                id="apply-section"
                className="relative w-full mt-10 pt-20 sm:pt-28 pb-6 overflow-hidden bg-gradient-to-b from-[#E3EDA9] to-[#F8FAF3] sm:rounded-t-[36px] md:rounded-t-[48px]"
            >
                {/* 0. 상단 파도치는 디자인 (SVG Shape Divider) */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative block w-full h-[40px] sm:h-[60px] md:h-[80px]"
                >
                    <path
                    d="M0,0V56.28C108.54,95.78,241.6,104.75,372,93c121.2-10.92,233.15-46.61,353.4-60.8C857,16.8,989.46,25,1200,60V0Z"
                    fill="#ffffff"
                    ></path>
                </svg>
                </div>

                {/* 1. 뒷배경 코트 이미지 */}
                {/* 모바일에서는 복잡성을 줄이기 위해 투명도를 더 낮추거나 숨기고, 데스크톱에서 선명하게 보이도록 조정 */}
                <div className="absolute inset-0 z-0 pointer-events-none flex justify-end">
                <img
                    src="/images/court-bg.svg"
                    alt="배드민턴 코트 배경"
                    className="w-full md:w-[60%] object-contain object-right-top opacity-30 md:opacity-90"
                />
                </div>

                {/* 2. 지원하기 좌측 텍스트 콘텐츠 */}
                <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-16 flex flex-col justify-start min-h-[200px] md:min-h-[300px] mt-4">
                <h2 className="text-[28px] sm:text-[34px] font-black text-gray-900 tracking-tight mb-4 sm:mb-5">
                    지원하기
                </h2>
                <p className="text-[14px] sm:text-[15px] font-bold text-gray-600 leading-relaxed mb-6 sm:mb-8">
                    YBC 배드민턴 클럽은 실력보다 열정을 가진 <br />
                    새로운 가족을 언제나 기다리고 있습니다.
                </p>
                <Link href="/apply" className="w-fit">
                    <button className="flex items-center justify-center gap-2 bg-[#A3C668] text-white text-[15px] font-bold px-8 py-3.5 sm:py-3 rounded-full shadow-sm hover:bg-[#93C54B] active:scale-95 transition-all duration-200">
                    지원하기 <ArrowUpRight className="w-4 h-4" />
                    </button>
                </Link>
                </div>

                {/* 3. 하단 반투명 푸터 박스 (모바일 반응형 완벽 적용) */}
                <div className="relative z-20 w-full max-w-screen-4xl mx-auto px-4 sm:px-6 mt-12 md:mt-16">
                <div className="bg-[#F8FAF3]/85 backdrop-blur-md rounded-[28px] sm:rounded-[36px] p-7 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-white/50">
                    {/* 좌측(모바일 상단) 정보 영역 */}
                    <div className="flex flex-col gap-6 w-full md:w-auto">
                    {/* 로고 & 모바일 전용 인스타그램 아이콘 */}
                    <div className="flex justify-between items-center w-full">
                        <img
                        src="/images/logo.png"
                        alt="YBC Logo"
                        className="h-6 sm:h-7 object-contain"
                        />

                        {/* 모바일 화면에서만 우측에 나타나는 인스타그램 버튼 */}
                        <a
                        href="https://www.instagram.com/ybc_badmintonclub/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YBC 인스타그램"
                        className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm"
                        >
                        <InstagramIcon className="w-4.5 h-4.5" />
                        </a>
                    </div>

                    {/* 연락처 정보 */}
                    <div className="flex flex-col gap-2.5 text-[14px] font-bold text-gray-500">
                        <a
                        href="mailto:ybc.since240120@gmail.com"
                        className="flex items-center gap-2.5 hover:text-gray-700 transition-colors"
                        >
                        <MailIcon className="w-4.5 h-4.5 text-gray-600" />
                        ybc.since240120@gmail.com
                        </a>
                    </div>
                    </div>

                    {/* 우측(모바일 하단) 약관 및 저작권 영역 */}
                    <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
                    {/* 데스크톱 화면에서만 우측 상단에 나타나는 인스타그램 버튼 */}
                    <a
                        href="https://www.instagram.com/ybc_badmintonclub/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YBC 인스타그램"
                        className="hidden md:flex w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] items-center justify-center text-white hover:opacity-85 transition-opacity shadow-sm"
                    >
                        <InstagramIcon className="w-4.5 h-4.5" />
                    </a>

                    {/* 하단 텍스트 (모바일: 좌측 정렬 / 데스크톱: 우측 정렬) */}
                    <div className="flex flex-col items-start md:items-end gap-2 text-[13px] font-bold text-gray-400 w-full">
                        <a
                        href="#"
                        className="text-gray-900 font-black text-[14px] hover:text-gray-700 transition-colors"
                        >
                        개인정보 처리방침
                        </a>
                        <p className="text-left md:text-right leading-relaxed">
                        Copyright c 2026 YBC Badminton Club.{" "}
                        <br className="block md:hidden" />
                        All Rights Reserved
                        </p>
                    </div>
                    </div>
                </div>
                </div>

                {/* 4. 코트를 바라보는 뒷모습 캐릭터 (모바일에서는 숨김 처리) */}
                <div className="absolute left-[50%] sm:left-[45%] bottom-[160px] sm:bottom-[180px] w-[160px] sm:w-[350px] z-30 pointer-events-none transform -translate-x-1/2 drop-shadow-lg hidden md:block">
                <img
                    src="/images/character-back.svg"
                    alt="코트를 바라보는 캐릭터"
                    className="w-full h-auto object-contain"
                />
                </div>

                {/* 5. 우측 하단 플로팅 지원하기 버튼 (FAB, 스크롤 시 화면 고정) */}
                <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 block">
                <Link
                    href="/apply"
                    className="relative group flex flex-col items-center"
                >
                    {/* 셔틀콕 데코레이션 */}
                    <div className="absolute -top-6 right-2 w-10 h-10 pointer-events-none drop-shadow-sm group-hover:-translate-y-1.5 transition-transform duration-300">
                    <img
                        src="/images/shuttlecock2.svg"
                        alt="셔틀콕 데코레이션"
                        className="w-full h-full object-contain"
                    />
                    </div>
                    {/* 동그란 버튼 본체 */}
                    <button
                    style={{ borderRadius: "70% 31% 60% 50% / 35% 30% 60% 70%" }}
                    className="bg-[#93C54B] text-white text-[13px] font-black w-[68px] h-[68px] rounded-full shadow-lg border-[3px] border-white flex items-center justify-center hover:bg-[#81b23c] active:scale-95 transition-all"
                    >
                    지원하기
                    </button>
                </Link>
                </div>
            </section>
        </div>
    );
}