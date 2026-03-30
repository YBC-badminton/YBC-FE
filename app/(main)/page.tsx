'use client';

import React from 'react';
import Link from 'next/link';
import { Sansita } from 'next/font/google';

// 폰트 설정 (이탤릭이 기본 포함된 굵은 서체입니다)
const sansita = Sansita({ 
  weight: '800', 
  subsets: ['latin'],
  display: 'swap',
});

export default function YBCMainPage() {
  // [추가] 특정 ID로 부드럽게 이동하는 함수
  const scrollToApply = () => {
    const element = document.getElementById('apply-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white">
        <section className="relative w-full h-[calc(100vh-80px)] bg-[#F2F8E1] overflow-hidden flex items-center justify-center">
            {/* [배경] symbol.png 워터마크 패턴 */}
            <div className="absolute inset-0 opacity-[0.2] z-0 pointer-events-none">
                {/* 좌측 상단 워터마크 */}
                <img 
                    src="/images/symbol.png" 
                    alt="Background Pattern 1"
                    className="absolute top-[-5%] left-[-3%] w-[20%] max-w-[300px] opacity-[0.9] rotate-[-15deg] object-contain" 
                />
                {/* 우측 배경 큰 워터마크 (선택사항) */}
                <img 
                    src="/images/symbol.png" 
                    alt="Background Pattern 3"
                    className="absolute top-1/2 left-1/2 max-w-[700px] -translate-x-1/7 -translate-y-1/2 w-[50%] opacity-[0.9] object-contain"
                />
            </div>

            {/* 메인 콘텐츠 컨테이너 */}
            <div className="max-w-screen-xl mx-auto px-12 relative z-10 flex items-center w-full">
                
                {/* [좌측 1/3] mascot.png 캐릭터 */}
                <div className="w-1/3 flex justify-center animate-fade-in-left">
                    <img 
                        src="/images/mascot.png" 
                        alt="YBC Badminton Mascot"
                        className="w-[400px] h-auto object-contain" 
                    />
                </div>

                {/* [우측 2/3] 텍스트 및 모집 상태 */}
                <div className="w-2/3 text-center flex flex-col items-center gap-8 pl-10">
                    
                    <h1 className={`${sansita.className} text-[74px] text-[#00792D] tracking-[0.05em] leading-tight drop-shadow-sm`}>
                        YBC badminton club
                    </h1>

                    <p className="text-2xl font-medium text-green-800 tracking-tight opacity-90">
                        양질의 배드민턴 추구
                    </p>

                    {/* [변경 포인트] onClick 이벤트 추가 및 cursor-pointer로 변경 */}
                    <div 
                        onClick={scrollToApply}
                        className="bg-white px-8 py-3 rounded-full shadow-md flex items-center gap-3 border border-gray-100 mt-4 transition-transform hover:scale-105 cursor-pointer active:scale-95"
                    >
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                            모집중
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-green-800 opacity-50 cursor-pointer" onClick={scrollToApply}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </div>
        </section>

        {/* --- 동아리 소개 --- */}
        <section className="w-full bg-white py-24 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-12 flex items-center gap-20">
            <div className="w-1/2 flex flex-col gap-12">
              <h2 className="text-5xl font-black text-green-800 tracking-tight">동아리 소개</h2>
              <div className="flex flex-col gap-6 text-xl font-medium text-slate-600 tracking-tight">
                <p>어쩌고저쩌고</p><p>동아리소개글</p><p>양배추소개글</p>
              </div>
              <div className="flex gap-4 mt-8">
                <InfoCard icon={<img src="/images/Calendar.svg" alt="달력" className="w-full h-full" />} label="정기 활동" value="주 2회" />
                <InfoCard icon={<img src="/images/Users.svg" alt="유저" className="w-full h-full" />} label="부원 수" value="50+명" />
              </div>
            </div>
            <div className="w-1/2 relative flex justify-center items-center">
              <div className="absolute w-[540px] h-[400px] bg-black/5 rounded-[40px] rotate-3 translate-x-4 translate-y-4 blur-sm" />
              <div className="relative w-[540px] h-[400px] bg-[#E2EBC8] rounded-[40px] shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center overflow-hidden">
                <p className="text-green-800/20 font-black text-4xl select-none italic">YBC GALLERY</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 정기모임 --- */}
        <section className="w-full bg-white py-20 px-12 max-w-screen-2xl mx-auto">
          <h2 className="text-5xl font-black text-green-800 mb-12 tracking-tight">정기모임</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3"><span className="bg-[#4B7332] text-white text-[13px] font-bold px-3 py-1 rounded-full">오늘</span><div className="w-32 h-5 bg-[#E9ECEF] rounded-md" /></div>
              <div className="w-full h-72 bg-[#E9ECEF] rounded-[30px]" />
            </div>
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3"><span className="bg-[#4B7332] text-white text-[13px] font-bold px-3 py-1 rounded-full">오늘</span><div className="w-32 h-5 bg-[#E9ECEF] rounded-md" /></div>
              <div className="w-full h-72 bg-[#E9ECEF] rounded-[30px]" />
            </div>
          </div>
        </section>

        {/* --- 체육관 위치 --- */}
        <section className="w-full bg-white py-24 px-12 max-w-screen-2xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-green-800 tracking-tight">체육관 위치</h2>
            <p className="text-xl font-medium text-slate-500">매주 화요일, 목요일 저녁 7시에 만나요!</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white border-[1.5px] border-[#E9ECEF] rounded-[40px] shadow-sm flex flex-col items-center justify-center p-12 min-h-[480px]">
              <div className="w-20 h-20 mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <img src="/images/Location.svg" alt="위치" className="w-14 h-14" />
              </div>
              <div className="text-center space-y-3">
                <p className="text-2xl font-black text-slate-800">서울시 강남구 테헤란로 123</p>
                <p className="text-xl font-bold text-slate-400">강남 스포츠센터 2층</p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="bg-[#F2F8E1] p-10 rounded-[40px] flex-1">
                <h4 className="text-[22px] font-black text-slate-800 mb-8 tracking-tight">찾아오시는 길</h4>
                <ul className="space-y-5 text-[17px] font-bold text-slate-600">
                  <li className="flex items-start gap-3"><span className="text-green-600 mt-1">•</span>지하철 2호선 강남역 3번 출구 도보 5분</li>
                  <li className="flex items-start gap-3"><span className="text-green-600 mt-1">•</span>버스 정류장: 강남역 (간선 146, 740, 지선 3426)</li>
                  <li className="flex items-start gap-3"><span className="text-green-600 mt-1">•</span>주차장 이용 가능 (2시간 무료)</li>
                </ul>
              </div>
              <div className="bg-[#F2F8E1] p-10 rounded-[40px]">
                <h4 className="text-[22px] font-black text-slate-800 mb-8 tracking-tight">정기 활동 시간</h4>
                <div className="space-y-4 text-[17px] font-bold">
                  <div className="flex justify-between items-center"><span className="text-green-700">화요일</span><span className="text-slate-700">19:00 - 21:00</span></div>
                  <div className="flex justify-between items-center"><span className="text-green-700">목요일</span><span className="text-slate-700">19:00 - 21:00</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- [지원하기 섹션] --- */}
        {/* [변경 포인트] id="apply-section" 추가 */}
        <section id="apply-section" className="max-w-screen-2xl mx-auto px-12 py-32 flex flex-col items-center text-center gap-10">
          <h2 className="text-5xl font-black text-green-800 tracking-tight">지원하기</h2>
          <p className="text-xl font-medium text-slate-600 max-w-2xl leading-relaxed">
            YBC 배드민턴 클럽은 실력보다 열정을 가진 <br />새로운 가족을 언제나 기다리고 있습니다.
          </p>
          <Link href="/apply">
            <button className="bg-[#4B7332] text-white text-[16px] font-bold px-14 py-4 rounded-full shadow-lg hover:bg-[#3d5d28] hover:-translate-y-1 transition-all duration-300">
              지원하기
            </button>
          </Link>
        </section>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; }) {
  return (
    <div className="bg-[#E2EBC8] px-8 py-6 rounded-[24px] flex flex-col gap-2 w-56 shadow-sm border border-white/40">
      <div className="w-8 h-8 mb-2">{icon}</div>
      <p className="text-sm font-bold text-green-800/60 uppercase tracking-tighter">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}