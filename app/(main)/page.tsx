"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sansita } from "next/font/google";
import api from "../../lib/axios"; // API 호출을 위한 axios 임포트 추가

// 폰트 설정 (이탤릭이 기본 포함된 굵은 서체입니다)
const sansita = Sansita({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

// 서버에서 넘어올 정기모임 투표 데이터 인터페이스 추가
interface VoteData {
  voteId: number;
  name?: string;
  title?: string;
  activityDate: string;
  activityTime?: string;
  location: string;
  capacity?: number;
  currentParticipantCount?: number;
  attendance?: {
    currentAttendees: number;
    totalParticipants: number;
  };
}

export default function YBCMainPage() {
  // 정기모임 데이터 상태 추가
  const [recentVotes, setRecentVotes] = useState<VoteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 진행 중인 정기모임 데이터 로드 로직 추가
  useEffect(() => {
    const fetchActiveVotes = async () => {
      try {
        const response = await api.get("/votes?status=VOTING");
        
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.votes)) {
          data = response.data.votes;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        // 최신 2개만 추출
        setRecentVotes(data.slice(0, 2));
      } catch (error) {
        console.warn("진행 중인 투표를 불러오지 못했습니다. 기본 활성 데이터를 노출합니다.", error);
        setRecentVotes([
          {
            voteId: 998,
            name: "이번 주 화요 정기 운동",
            activityDate: "2026-06-09",
            activityTime: "19:00",
            location: "마곡실내배드민턴장",
            currentParticipantCount: 15,
            capacity: 20,
          },
          {
            voteId: 999,
            name: "이번 주 토요 정기 운동",
            activityDate: "2026-06-13",
            activityTime: "13:30",
            location: "망원나들목체육관",
            currentParticipantCount: 18,
            capacity: 20,
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveVotes();
  }, []);

  // 특정 ID로 부드럽게 이동하는 함수
  const scrollToApply = () => {
    const element = document.getElementById("apply-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white">
      <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F2F8E1] overflow-hidden flex items-center justify-center py-16 sm:py-0">
        {/* [배경] symbol.png 워터마크 패턴 */}
        <div className="absolute inset-0 opacity-[0.2] z-0 pointer-events-none">
          <img
            src="/images/symbol.png"
            alt="Background Pattern 1"
            className="absolute top-[-5%] left-[-3%] w-[30%] sm:w-[20%] max-w-[300px] opacity-[0.9] rotate-[-15deg] object-contain"
          />
          <img
            src="/images/symbol.png"
            alt="Background Pattern 3"
            className="absolute top-1/2 left-1/2 max-w-[700px] -translate-x-1/7 -translate-y-1/2 w-[70%] sm:w-[50%] opacity-[0.9] object-contain"
          />
        </div>

        {/* 메인 콘텐츠 컨테이너 */}
        <div className="max-w-screen-xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col lg:flex-row items-center w-full gap-8 lg:gap-0">
          {/* [좌측] mascot.png 캐릭터 */}
          <div className="w-full lg:w-1/3 flex justify-center animate-fade-in-left">
            <img
              src="/images/mascot.png"
              alt="YBC Badminton Mascot"
              className="w-[200px] sm:w-[300px] lg:w-[400px] h-auto object-contain"
            />
          </div>

          {/* [우측] 텍스트 및 모집 상태 */}
          <div className="w-full lg:w-2/3 text-center flex flex-col items-center gap-5 sm:gap-8 lg:pl-10">
            <h1
              className={`${sansita.className} text-4xl sm:text-6xl lg:text-[74px] text-[#00792D] tracking-[0.05em] leading-tight drop-shadow-sm`}
            >
              YBC badminton club
            </h1>

            <p className="text-lg sm:text-2xl font-medium text-green-800 tracking-tight opacity-90">
              양질의 배드민턴 추구
            </p>

            <div
              onClick={scrollToApply}
              className="bg-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-md flex items-center gap-3 border border-gray-100 mt-2 sm:mt-4 transition-transform hover:scale-105 cursor-pointer active:scale-95"
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                모집중
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-green-800 opacity-50 cursor-pointer"
          onClick={scrollToApply}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            ></path>
          </svg>
        </div>
      </section>

      {/* --- 동아리 소개 --- */}
      <section className="w-full bg-white py-16 sm:py-24 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:gap-12">
            <h2 className="text-3xl sm:text-5xl font-black text-green-800 tracking-tight">
              동아리 소개
            </h2>
            <div className="flex flex-col gap-4 sm:gap-6 text-base sm:text-xl font-medium text-slate-600 tracking-tight">
              <p>어쩌고저쩌고</p>
              <p>동아리소개글</p>
              <p>양배추소개글</p>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-8">
              <InfoCard
                icon={
                  <img
                    src="/images/Calendar.svg"
                    alt="달력"
                    className="w-full h-full"
                  />
                }
                label="정기 활동"
                value="주 2회"
              />
              <InfoCard
                icon={
                  <img
                    src="/images/Users.svg"
                    alt="유저"
                    className="w-full h-full"
                  />
                }
                label="부원 수"
                value="50+명"
              />
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center items-center">
            <div className="absolute w-full max-w-[540px] aspect-[540/400] bg-black/5 rounded-[30px] sm:rounded-[40px] rotate-3 translate-x-4 translate-y-4 blur-sm" />
            <div className="relative w-full max-w-[540px] aspect-[540/400] bg-[#E2EBC8] rounded-[30px] sm:rounded-[40px] shadow-sm transform -rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center overflow-hidden">
              <p className="text-green-800/20 font-black text-2xl sm:text-4xl select-none italic">
                YBC GALLERY
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 정기모임 (동적 데이터 연동) --- */}
      <section className="w-full bg-white py-14 sm:py-20 px-6 sm:px-12 max-w-screen-2xl mx-auto">
        <div className="mb-8 sm:mb-12 flex flex-col gap-3">
          <h2 className="text-3xl sm:text-5xl font-black text-green-800 tracking-tight">
            정기모임
          </h2>
          <p className="text-base sm:text-lg font-bold text-slate-500">
            현재 활발하게 참여 투표가 진행 중인 정기 운동입니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {isLoading ? (
            // 로딩 중 스켈레톤 UI
            <>
              <div className="bg-white border border-gray-100 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-7 bg-[#E9ECEF] rounded-full" />
                  <div className="w-24 h-7 bg-[#E9ECEF] rounded-full" />
                </div>
                <div className="w-full h-48 sm:h-72 bg-[#E9ECEF] rounded-[20px] sm:rounded-[30px]" />
              </div>
              <div className="bg-white border border-gray-100 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-pulse hidden md:flex">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-7 bg-[#E9ECEF] rounded-full" />
                  <div className="w-24 h-7 bg-[#E9ECEF] rounded-full" />
                </div>
                <div className="w-full h-48 sm:h-72 bg-[#E9ECEF] rounded-[20px] sm:rounded-[30px]" />
              </div>
            </>
          ) : recentVotes.length > 0 ? (
            // 데이터 렌더링
            recentVotes.map((vote, idx) => {
              const title = vote.name || vote.title || "정기 운동";
              const currentCount = vote.currentParticipantCount ?? vote.attendance?.currentAttendees ?? 0;
              const maxCount = vote.capacity ?? vote.attendance?.totalParticipants ?? 20;
              const progressRatio = Math.min((currentCount / maxCount) * 100, 100);

              return (
                <div 
                  key={vote.voteId || idx} 
                  className="bg-white border border-gray-100 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-[#4B7332] text-white text-[13px] font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse" />
                      투표 진행중
                    </span>
                    <span className="bg-slate-100 text-slate-500 text-[13px] font-bold px-4 py-1.5 rounded-full">
                      {vote.activityDate}
                    </span>
                  </div>
                  
                  <div className="w-full bg-[#F8F9FA] rounded-[20px] sm:rounded-[30px] p-6 sm:p-8 flex flex-col justify-center min-h-[192px] sm:min-h-[288px] gap-4 sm:gap-6">
                    <h3 className="text-xl sm:text-3xl font-black text-slate-800 break-keep leading-tight">
                      {title}
                    </h3>
                    
                    <div className="space-y-1 sm:space-y-2 text-sm sm:text-base font-bold text-slate-500">
                      <p className="flex items-center gap-2">
                        <span className="text-lg">📍</span> {vote.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-lg">⏰</span> {vote.activityTime || "19:00"}
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-4 w-full">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-400">참여 인원</span>
                        <span className="text-sm sm:text-base font-black text-green-700">
                          {currentCount} <span className="text-slate-300">/</span> {maxCount}명
                        </span>
                      </div>
                      <div className="w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-[#4B7332] transition-all duration-1000 ease-out" 
                          style={{ width: `${progressRatio}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // 진행중인 모임이 없을 때
            <div className="col-span-1 md:col-span-2 bg-white border border-dashed border-gray-200 rounded-[30px] sm:rounded-[40px] p-12 text-center text-gray-400 font-bold">
              현재 진행 중인 정기모임 투표가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* --- 체육관 위치 --- */}
      <GymLocationSection />

      {/* --- [지원하기 섹션] --- */}
      <section
        id="apply-section"
        className="max-w-screen-2xl mx-auto px-6 sm:px-12 py-20 sm:py-32 flex flex-col items-center text-center gap-6 sm:gap-10"
      >
        <h2 className="text-3xl sm:text-5xl font-black text-green-800 tracking-tight">
          지원하기
        </h2>
        <p className="text-base sm:text-xl font-medium text-slate-600 max-w-2xl leading-relaxed">
          YBC 배드민턴 클럽은 실력보다 열정을 가진{" "}
          <br className="hidden sm:block" />
          새로운 가족을 언제나 기다리고 있습니다.
        </p>
        <Link href="/apply">
          <button className="bg-[#4B7332] text-white text-sm sm:text-[16px] font-bold px-10 sm:px-14 py-3.5 sm:py-4 rounded-full shadow-lg hover:bg-[#3d5d28] hover:-translate-y-1 transition-all duration-300">
            지원하기
          </button>
        </Link>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#E2EBC8] px-5 sm:px-8 py-4 sm:py-6 rounded-2xl sm:rounded-[24px] flex flex-col gap-2 flex-1 sm:flex-none sm:w-56 shadow-sm border border-white/40">
      <div className="w-7 h-7 sm:w-8 sm:h-8 mb-1 sm:mb-2">{icon}</div>
      <p className="text-xs sm:text-sm font-bold text-green-800/60 uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

type Gym = {
  name: string;
  address: string;
  subTitle: string;
  scheduleLabel: string;
  scheduleTime: string[];
  directions: string[];
  placeQuery: string;
};

const GYMS: { magok: Gym; mangwon: Gym } = {
  magok: {
    name: "마곡실내배드민턴장",
    address: "서울특별시 강서구 가양제1동 양천로 251",
    subTitle: "화요일 운동 장소",
    scheduleLabel: "화요일",
    scheduleTime: ["16:00 - 19:00"],
    directions: [
      "주차장 이용 가능",
    ],
    placeQuery: "place_id:ChIJNwJpmXicfDURx9pvbAFHmgM",
  },
  mangwon: {
    name: "망원나들목체육관",
    address: "서울특별시 마포구 동교로1길 45",
    subTitle: "토요일 운동 장소",
    scheduleLabel: "토요일",
    scheduleTime: ["13:30 - 15:30", "16:00 - 18:00"],
    directions: [
      "주차장 이용 가능 (망원한강공원 주차장)",
    ],
    placeQuery: "place_id:ChIJe4XAnIWZfDURf4mpO8Zml-U",
  },
};

function GymMapCard({ gym }: { gym: Gym }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(gym.placeQuery)}&language=ko&region=KR`
    : null;

  return (
    <div className="bg-white border-[1.5px] border-[#E9ECEF] rounded-[30px] sm:rounded-[40px] shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 sm:px-8 pt-5 sm:pt-6">
        <span className="inline-flex items-center gap-2 bg-[#F2F8E1] text-green-800 text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {gym.scheduleLabel} 운동 장소
        </span>
      </div>
      <div className="w-full bg-[#E9ECEF] relative mt-4 sm:mt-5">
        {embedSrc ? (
          <iframe
            key={gym.placeQuery}
            title={`${gym.name} 지도`}
            src={embedSrc}
            className="w-full h-full min-h-[260px] sm:min-h-[340px]"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full min-h-[260px] sm:min-h-[340px] flex items-center justify-center text-slate-400 text-sm font-medium px-6 text-center">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 설정 후 지도가 표시됩니다.
          </div>
        )}
      </div>
      <div className="p-6 sm:p-8 flex items-center gap-4 border-t border-[#E9ECEF]">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-full">
          <img
            src="/images/Location.svg"
            alt="위치"
            className="w-7 h-7 sm:w-9 sm:h-9"
          />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-lg sm:text-2xl font-black text-slate-800 truncate">
            {gym.name}
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-400">
            {gym.address}
          </p>
        </div>
      </div>
      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <ul className="space-y-2 text-sm sm:text-base font-bold text-slate-600">
          {gym.directions.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GymLocationSection() {
  return (
    <section className="w-full bg-white py-16 sm:py-24 px-6 sm:px-12 max-w-screen-2xl mx-auto space-y-10 sm:space-y-16">
      <div className="text-center space-y-3 sm:space-y-4">
        <h2 className="text-3xl sm:text-5xl font-black text-green-800 tracking-tight">
          체육관 위치
        </h2>
        <p className="text-base sm:text-xl font-medium text-slate-500">
          매주 화요일, 토요일에 만나요!
        </p>
      </div>

      {/* 마곡 / 망원 두 체육관을 모두 표시 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        <GymMapCard gym={GYMS.magok} />
        <GymMapCard gym={GYMS.mangwon} />
      </div>

      <div className="bg-[#F2F8E1] p-6 sm:p-10 rounded-[30px] sm:rounded-[40px]">
        <h4 className="text-lg sm:text-[22px] font-black text-slate-800 mb-5 sm:mb-8 tracking-tight">
          정기 활동 시간
        </h4>
        <div className="space-y-3 sm:space-y-4 text-sm sm:text-[17px] font-bold">
          <div className="flex justify-between items-start gap-4">
            <span className="text-green-700">
              화요일 · {GYMS.magok.name}
            </span>
            <span className="text-slate-700 text-right">
              {GYMS.magok.scheduleTime.join(" / ")}
            </span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-green-700">
              토요일 · {GYMS.mangwon.name}
            </span>
            <span className="text-slate-700 text-right whitespace-pre-line">
              {GYMS.mangwon.scheduleTime.join("\n")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}