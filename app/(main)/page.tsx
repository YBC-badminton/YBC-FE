'use client';

import React from 'react';
import Link from 'next/link';

export default function YBCMainPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white">
        <section className="relative w-full h-[calc(100vh-80px)] bg-[#F2F8E1] overflow-hidden flex items-center justify-center">
            {/* [배경] symbol.png 워터마크 패턴 */}
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none">
                <img 
                    src="/images/symbol.png" 
                    alt="Background Pattern"
                    className="w-full h-full object-cover scale-150 rotate-[-15deg]" 
                />
            </div>

            {/* 메인 콘텐츠 컨테이너 */}
            <div className="max-w-screen-2xl mx-auto px-12 relative z-10 flex items-center w-full">
                
                {/* [좌측 1/3] mascot.png 캐릭터 */}
                <div className="w-1/3 flex justify-center animate-fade-in-left">
                    <img 
                        src="/images/mascot.png" 
                        alt="YBC Badminton Mascot"
                        className="w-[400px] h-auto object-contain" // 화면이 커진 만큼 캐릭터 크기도 살짝 키웠습니다.
                    />
                </div>

                {/* [우측 2/3] 텍스트 및 모집 상태 */}
                <div className="w-2/3 text-center flex flex-col items-center gap-8 pl-10">
                    
                    <h1 className="text-8xl font-black text-green-900 tracking-tighter leading-tight italic drop-shadow-sm">
                        YBC badminton club
                    </h1>

                    <p className="text-2xl font-medium text-green-800 tracking-tight opacity-90">
                        양질의 배드민턴 추구
                    </p>

                    <div className="bg-white px-8 py-3 rounded-full shadow-md flex items-center gap-3 border border-gray-100 mt-4 transition-transform hover:scale-105 cursor-default">
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
            {/* [스크롤 유도 화살표] 화면이 꽉 찼을 때 아래로 더 내용이 있음을 알려줍니다. */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-green-800 opacity-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </div>
        </section>
        <section className="w-full bg-white py-24 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-12 flex items-center gap-20">
            
            {/* [좌측] 텍스트 및 정보 카드 섹션 */}
            <div className="w-1/2 flex flex-col gap-12">
              {/* 타이틀 */}
              <h2 className="text-5xl font-black text-green-800 tracking-tight">
                동아리 소개
              </h2>

              {/* 소개글 영역 */}
              <div className="flex flex-col gap-6 text-xl font-medium text-slate-600 tracking-tight">
                <p>어쩌고저쩌고</p>
                <p>동아리소개글</p>
                <p>양배추소개글</p>
              </div>

              {/* 하단 요약 정보 카드 */}
              <div className="flex gap-4 mt-8">
                <InfoCard 
                  icon={<img 
                          src="/images/Calendar.svg" 
                          alt="달력 아이콘" 
                          className="w-full h-full object-contain" 
                        />} 
                  label="정기 활동" 
                  value="주 2회" 
                />
                <InfoCard 
                  icon={<img 
                          src="/images/Users.svg" 
                          alt="유저 그룹 아이콘" 
                          className="w-full h-full object-contain" 
                        />} 
                  label="부원 수" 
                  value="50+명" 
                />
              </div>
            </div>

            {/* [우측] 기울어진 이미지/포인트 박스 섹션 */}
            <div className="w-1/2 relative flex justify-center items-center">
              {/* 그림자 효과용 배경 레이어 */}
              <div className="absolute w-[540px] h-[400px] bg-black/5 rounded-[40px] rotate-3 translate-x-4 translate-y-4 blur-sm" />
              
              {/* 메인 포인트 박스 (시안의 연두색 박스) */}
              <div className="relative w-[540px] h-[400px] bg-[#E2EBC8] rounded-[40px] shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out border border-white/50 flex items-center justify-center overflow-hidden">
                {/* 여기에 동아리 단체 사진 등을 넣으시면 됩니다. */}
                <p className="text-green-800/20 font-black text-4xl select-none italic">YBC GALLERY</p>
              </div>
            </div>

          </div>
        </section>
        {/* --- [1] 정기모임 섹션 --- */}
        <section className="w-full bg-white py-20 px-12 max-w-screen-2xl mx-auto">
          {/* 섹션 타이틀 */}
          <h2 className="text-5xl font-black text-green-800 tracking-tight mb-12">
            정기모임
          </h2>

          {/* 카드 그리드 레이아웃 (2열 구성) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* 카드 1 */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                {/* '오늘' 뱃지 */}
                <span className="bg-[#4B7332] text-white text-[13px] font-bold px-3 py-1 rounded-full">
                  오늘
                </span>
                {/* 상단 회색 바 */}
                <div className="w-32 h-5 bg-[#E9ECEF] rounded-md" />
              </div>
              {/* 메인 회색 영역 (추후 사진이 들어갈 공간) */}
              <div className="w-full h-72 bg-[#E9ECEF] rounded-[30px]" />
            </div>

            {/* 카드 2 */}
            <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#4B7332] text-white text-[13px] font-bold px-3 py-1 rounded-full">
                  오늘
                </span>
                <div className="w-32 h-5 bg-[#E9ECEF] rounded-md" />
              </div>
              <div className="w-full h-72 bg-[#E9ECEF] rounded-[30px]" />
            </div>

          </div>
        </section>

        {/* --- [2] 체육관 위치 섹션 --- */}
        <section className="w-full bg-white py-24 px-12 max-w-screen-2xl mx-auto space-y-16">
          {/* 섹션 헤더 */}
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-green-800 tracking-tight">
              체육관 위치
            </h2>
            <p className="text-xl font-medium text-slate-500 tracking-tight">
              매주 화요일, 목요일 저녁 7시에 만나요!
            </p>
          </div>

          {/* 메인 레이아웃: 지도 카드와 정보 박스 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* [좌측] 지도 카드 영역 */}
            <div className="bg-white border-[1.5px] border-[#E9ECEF] rounded-[40px] shadow-sm flex flex-col items-center justify-center p-12 min-h-[480px]">
              {/* 위치 아이콘 - img 태그로 직접 구현 */}
              <div className="w-20 h-20 mb-8 flex items-center justify-center bg-green-50 rounded-full">
                <img 
                  src="/images/Location.svg" 
                  alt="위치 아이콘"
                  className="w-14 h-14 object-contain" 
                />
              </div>
              {/* 주소 정보 */}
              <div className="text-center space-y-3">
                <p className="text-2xl font-black text-slate-800 tracking-tight">
                  서울시 강남구 테헤란로 123
                </p>
                <p className="text-xl font-bold text-slate-400 tracking-tight">
                  강남 스포츠센터 2층
                </p>
              </div>
            </div>

            {/* [우측] 상세 정보 박스들 */}
            <div className="flex flex-col gap-6">
              
              {/* 찾아오시는 길 박스 */}
              <div className="bg-[#F2F8E1] p-10 rounded-[40px] flex-1">
                <h4 className="text-[22px] font-black text-slate-800 mb-8 tracking-tight">
                  찾아오시는 길
                </h4>
                <ul className="space-y-5 text-[17px] font-bold text-slate-600 tracking-tight">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    지하철 2호선 강남역 3번 출구 도보 5분
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    버스 정류장: 강남역 (간선 146, 740, 지선 3426)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    주차장 이용 가능 (2시간 무료)
                  </li>
                </ul>
              </div>

              {/* 정기 활동 시간 박스 */}
              <div className="bg-[#F2F8E1] p-10 rounded-[40px]">
                <h4 className="text-[22px] font-black text-slate-800 mb-8 tracking-tight">
                  정기 활동 시간
                </h4>
                <div className="space-y-4 text-[17px] font-bold tracking-tight">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">화요일</span>
                    <span className="text-slate-700">19:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">목요일</span>
                    <span className="text-slate-700">19:00 - 21:00</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* --- [1] 지원하기 섹션 --- */}
        <section className="max-w-screen-2xl mx-auto px-12 py-24 flex flex-col items-center text-center gap-10">
          <h2 className="text-5xl font-black text-green-800 tracking-tight">
            지원하기
          </h2>
          
          <p className="text-xl font-medium text-slate-600 tracking-tight max-w-2xl leading-relaxed">
            YBC 배드민턴 클럽은 실력보다 열정을 가진 <br />
            새로운 가족을 언제나 기다리고 있습니다.
          </p>

          {/* [변경 포인트] Link 태그로 감싸서 /apply 경로로 이동하게 만듭니다. */}
          <Link href="/apply">
            <button className="bg-[#4B7332] text-white text-[16px] font-bold px-14 py-4 rounded-full shadow-lg hover:bg-[#3d5d28] hover:-translate-y-1 transition-all duration-300">
              지원하기
            </button>
          </Link>
        </section>
    </div>
  );
}

// 정보 카드 컴포넌트
function InfoCard({ icon, label, value }: { 
  icon: React.ReactNode; // string 대신 React.ReactNode로 변경!
  label: string; 
  value: string; 
}) {
  return (
    <div className="bg-[#E2EBC8] px-8 py-6 rounded-[24px] flex flex-col gap-2 w-56 shadow-sm border border-white/40">
      {/* 이제 <img /> 태그가 이 자리에 정상적으로 들어갈 수 있습니다. */}
      <div className="w-8 h-8 mb-2">
        {icon}
      </div>
      <p className="text-sm font-bold text-green-800/60 uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}