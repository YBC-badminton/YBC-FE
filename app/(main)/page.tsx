"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import api from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

// Kakao Maps SDK는 전역 window.kakao 객체로 노출됩니다.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

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

interface HomeContent {
  clubIntroduction: string;
  activityImageUrl: string;
  regularMeetingCount: number;
  memberCount: number;
}

// API(GET /) 응답이 없을 때 사용할 기본값 (기존 하드코딩 문구를 폴백으로 유지)
const DEFAULT_HOME: HomeContent = {
  clubIntroduction:
    "양질의 배드민턴을 추구하는 사람들이 모인 동아리, 양배추입니다.\n매주 화요일·토요일, 실력보다 열정을 가진 분들과 함께합니다.\n처음이어도 괜찮아요. 함께 즐기며 성장하는 배드민턴을 경험하세요.",
  activityImageUrl: "",
  regularMeetingCount: 2,
  memberCount: 50,
};

export default function YBCMainPage() {
  const [recentVotes, setRecentVotes] = useState<VoteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recruiting, setRecruiting] = useState<boolean | null>(null);
  // 셔틀콕 데코가 따라갈 카드 인덱스 (마우스 오버 카드, 없으면 첫 카드)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [home, setHome] = useState<HomeContent>(DEFAULT_HOME);
  const { user } = useAuth();

  // 메인페이지 콘텐츠 조회 (GET /) — 동아리 소개글·활동 사진·정기활동 횟수·부원 수
  useEffect(() => {
    api
      .get<HomeContent>("/")
      .then((res) => {
        const d = res.data;
        if (!d) return;
        setHome({
          clubIntroduction: d.clubIntroduction || DEFAULT_HOME.clubIntroduction,
          activityImageUrl: d.activityImageUrl || "",
          regularMeetingCount: d.regularMeetingCount ?? DEFAULT_HOME.regularMeetingCount,
          memberCount: d.memberCount ?? DEFAULT_HOME.memberCount,
        });
      })
      .catch((error) => console.warn("메인페이지 콘텐츠를 불러오지 못했습니다.", error));
  }, []);

  useEffect(() => {
    const fetchActiveVotes = async () => {
      try {
        const response = await api.get("/votes/recent");

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.votes)) {
          data = response.data.votes;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        // 활동 날짜순 오름차순 정렬 (가까운 날짜부터, ISO 문자열이라 문자열 비교로 충분)
        data.sort((a: VoteData, b: VoteData) =>
          (a.activityDate ?? "").localeCompare(b.activityDate ?? ""),
        );
        setRecentVotes(data.slice(0, 3));
      } catch (error) {
        console.warn("진행 중인 투표를 불러오지 못했습니다.", error);
        setRecentVotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveVotes();
  }, []);

  // 모집 여부 조회 (recruiting=true 일 때만 '지원하기' 버튼 노출)
  useEffect(() => {
    api
      .get("/recruitments/message")
      .then((res) => setRecruiting(!!res.data?.recruiting))
      .catch(() => setRecruiting(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white overflow-x-clip">
      {/* ── 히어로 ───────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden -mt-[100px] pt-[120px] pb-10 sm:pb-14 min-h-[500px] sm:min-h-[650px] lg:min-h-[800px] flex flex-col bg-gradient-to-b from-brand-soft via-brand-wash to-white">
        {/* 1. 배경 및 캐릭터 이미지 영역 (z-0) */}
        <div className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none">
          <img
            src="/images/background.png"
            alt="양배추 배드민턴 배경"
            // object-bottom을 유지하되, 컨테이너 높이가 넉넉해져서 상단이 잘리지 않습니다.
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        {/* 2. 콘텐츠 및 버튼 영역 (z-10으로 이미지 위로 띄움) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center mt-10 sm:mt-16">
          <div className="mb-8 sm:mb-10">
            <img
              src="/images/text-title.svg"
              alt="양배추 양질의 배드민턴 추구"
              className="w-[150px] sm:w-[250px] h-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* 3. 액션 버튼 그룹 */}
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-[350px] mx-auto">
            {/* 지원하기 버튼 (브랜드 라임 그라데이션) — 모집중일 때만 노출 */}
            {recruiting === true && (
              <Link
                href="/apply"
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#a1c852] to-[#93C54B] text-white py-3 sm:py-3.5 rounded-full font-body font-semibold text-[17px] shadow-[0_6px_16px_rgba(147,197,75,0.35)] hover:from-[#93C54B] hover:to-[#81b23c] active:scale-95 transition-all duration-200"
              >
                지원하기
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            {/* 정기모임 보기 버튼 (흰 바탕 + 브랜드 테두리) */}
            <Link
              href="/activities"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#c3dd93] text-[#5b6b0f] py-3 sm:py-3.5 rounded-full font-body font-semibold text-[17px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:bg-[#f6fbf0] hover:border-[#93C54B] active:scale-95 transition-all duration-200"
            >
              정기모임 보기
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. 캐릭터 하단 배치 영역 (z-5) */}
        {/* mt-auto로 콘텐츠(버튼) 아래 하단 밴드에 정상 흐름으로 배치 → 어떤 화면비에서도 버튼과 겹치지 않음.
            flex justify-between + clamp() 너비로 마이너스 오프셋 없이 화면 안쪽에 균등 배치 → 잘림도 없음. */}
        <div className="relative z-[5] mt-auto w-full max-w-screen-2xl mx-auto px-3 sm:px-8 lg:px-12 flex items-end justify-between gap-2 sm:gap-3 pointer-events-none">
          {/* [왼쪽 캐릭터] 서서 라켓 들고 손 흔드는 양배추 */}
          <div className="shrink-0 w-[clamp(84px,24vw,250px)] transition-all duration-300">
            <img
              src="/images/character-left.svg"
              alt="손 흔드는 양배추 캐릭터"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* [가운데 캐릭터] 코트에 슬라이딩하며 리시브하는 양배추 */}
          <div className="shrink-0 w-[clamp(84px,23vw,280px)] transition-all duration-300">
            <img
              src="/images/character-center.svg"
              alt="슬라이딩하는 양배추 캐릭터"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* [오른쪽 캐릭터 + 셔틀콕] 점프하며 스매싱 시도하는 양배추 */}
          <div className="shrink-0 w-[clamp(88px,25vw,320px)] transition-all duration-300">
            <img
              src="/images/character-right.svg"
              alt="스매싱하는 양배추 캐릭터"
              className="w-full h-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ── 동아리 소개 ──────────────────────────────────── */}
      <section className="w-full bg-gradient-to-b from-[#fefff4] to-[#ffffff] pt-6 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col items-center text-center gap-6">
          {/* 타이틀 명 (Figma 전용 폰트 스타일 및 시그니처 컬러 반영) */}
          <h2 className="text-[26px] sm:text-[50px] font-display text-[#5b6b0f] break-keep">
            YBC badminton club
          </h2>

          {/* 소개 텍스트 본문 (GET / clubIntroduction, 줄바꿈 단위로 문단 렌더링) */}
          <div className="text-base sm:text-[18px] font-normal text-[#484848] leading-[1.5] max-w-2xl space-y-1.5">
            {home.clubIntroduction.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* 하단 카드 레이아웃 영역 (모바일 그리드, 데스크탑 플렉스) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10 w-full max-w-4xl">
            {/* 1. 동아리 실제 활동 사진 블롭 카드 (초록 배경) */}
            <div
              className="relative col-span-2 place-self-center w-full sm:flex-[1.3] max-w-[380px] sm:max-w-none min-h-[180px] sm:min-h-[220px] bg-[#93C54B] flex items-center justify-center text-white/90 font-bold text-sm sm:text-base px-8 text-center shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
              style={{ borderRadius: "28% 72% 38% 62% / 45% 36% 64% 55%" }}
            >
              {/* GET / activityImageUrl — 있으면 실제 사진(블롭을 꽉 채움), 없으면 안내 문구 */}
              {home.activityImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={home.activityImageUrl}
                  alt="동아리 실제 활동 사진"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span>동아리 실제 활동 사진 삽입</span>
              )}
            </div>

            {/* 2. 정기 활동 블롭 카드 (연두빛 틴트 배경) */}
            <div
              className="col-span-1 w-full sm:flex-1 min-h-[160px] sm:min-h-[220px] bg-[#E8F5E9] flex flex-col items-center justify-center gap-2 px-2 sm:px-6 text-center shadow-sm transition-transform hover:scale-[1.02]"
              style={{ borderRadius: "62% 38% 43% 57% / 46% 54% 46% 54%" }}
            >
              <p className="text-sm sm:text-base font-normal text-[#80917d]">
                정기 활동
              </p>
              <p className="flex items-baseline gap-1">
                <span className="text-xl sm:text-[40px] font-normal text-[#74bf63] mr-1">
                  주
                </span>
                <span className="text-4xl sm:text-[66px] font-bold text-[#74bf63] leading-none">
                  {home.regularMeetingCount}회
                </span>
              </p>
            </div>

            {/* 3. 부원 수 블롭 카드 (연한 그레이시 그린 배경) */}
            <div
              className="col-span-1 w-full sm:flex-1 min-h-[160px] sm:min-h-[220px] bg-[#EDF1EC] flex flex-col items-center justify-center gap-2 px-2 sm:px-6 text-center shadow-sm transition-transform hover:scale-[1.02]"
              style={{ borderRadius: "44% 56% 42% 58% / 55% 45% 55% 45%" }}
            >
              <p className="text-sm sm:text-base font-normal text-[#80917d]">
                부원 수
              </p>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-[66px] font-bold text-[#5b6b0f] leading-none">
                  {home.memberCount}
                </span>
                <span className="text-xl sm:text-[40px] font-normal text-[#5b6b0f] ml-1">
                  명
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 정기모임 ─────────────────────────────────────── */}
      <section className="w-full bg-white py-12 sm:py-16 px-6 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-[40px] font-bold text-ink">
            정기모임
          </h2>
          <Link
            href="/activities"
            className="flex items-center gap-1 text-sm font-semibold text-subtle hover:text-brand-dark transition-colors"
          >
            <span className="text-base leading-none">＋</span> 전체보기
          </Link>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* 3번째 카드 뒤에서 빼꼼 나오는 마스코트 (모바일 숨김) */}
          <img
            src="/images/mascot-peek.svg"
            alt=""
            className="hidden lg:block pointer-events-none select-none absolute -top-[200px] right-[72px] w-[246px] h-[282px]"
          />
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-[28px] p-6 border border-line/60 bg-brand-wash animate-pulse flex flex-col gap-5 ${i === 2 ? "hidden lg:flex" : ""}`}
              >
                <div className="flex gap-2">
                  <div className="w-12 h-6 bg-line rounded-full" />
                  <div className="w-16 h-6 bg-line rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-line rounded" />
                <div className="h-4 w-1/2 bg-line rounded" />
                <div className="h-3 w-full bg-line rounded-full mt-4" />
              </div>
            ))
          ) : recentVotes.length > 0 ? (
            recentVotes.map((vote, idx) => (
              <MeetingCard
                key={vote.voteId ?? idx}
                vote={vote}
                themeIndex={idx}
                isLoggedIn={!!user}
                // 포커스(=마우스 오버, 미오버 시 첫 카드)된 카드가 테두리+셔틀콕을 함께 가져간다
                focused={
                  hoveredIdx === null ? idx === 0 : hoveredIdx === idx
                }
                onHoverChange={(hovering) =>
                  setHoveredIdx(hovering ? idx : null)
                }
              />
            ))
          ) : (
            <div className="col-span-full bg-brand-wash border border-dashed border-line rounded-[28px] p-12 text-center text-subtle font-semibold">
              현재 진행 중인 정기모임 투표가 없습니다.
            </div>
          )}
        </div>
      </section>

      {/* ── 체육관 위치 ──────────────────────────────────── */}
      <GymLocationSection />

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
          <h2 className="text-[28px] sm:text-[40px] font-bold text-ink mb-4 sm:mb-5">
            지원하기
          </h2>
          <p className="text-[14px] sm:text-[18px] font-normal text-[#494949] leading-[1.5] mb-6 sm:mb-8">
            YBC 배드민턴 클럽은 실력보다 열정을 가진 <br />
            새로운 가족을 언제나 기다리고 있습니다.
          </p>
          <Link href="/apply" className="w-fit">
            <button className="flex items-center justify-center gap-2 bg-[#A3C668] text-white text-[16px] font-semibold px-8 py-3.5 sm:py-3 rounded-full shadow-sm hover:bg-[#93C54B] active:scale-95 transition-all duration-200">
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
              <div className="flex flex-col gap-2.5 text-[16px] font-medium text-[#626262]">
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
                  href="/policy/privacy"
                  className="text-gray-900 font-black text-[14px] hover:text-gray-700 transition-colors"
                >
                  개인정보 처리방침
                </a>
                <p className="text-left md:text-right leading-relaxed text-[15px] font-normal text-[#191919]/60">
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

/* 활동일까지 남은 일수를 D-day 배지 문구로 변환 (D-0 → "오늘", 지난 날짜 → "종료") */
function getDDayLabel(activityDate?: string): string {
  if (!activityDate) return "";
  const [y, m, d] = activityDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "오늘";
  if (diffDays > 0) return `D-${diffDays}`;
  return "종료";
}

/* 카드별 컬러 테마 (Figma: 22:743 초록 / 19:428 올리브 / 93:3793 골드) — 인덱스순으로 적용 */
const CARD_THEMES = [
  {
    bg: "bg-[#eef7ec]",
    border: "border-[3px] border-[#74bf63]",
    pill: "bg-[#74c063]",
    bar: "bg-[#74c063]",
    track: "bg-[#dfecdc]",
    accent: "text-[#74bf63]",
  },
  {
    bg: "bg-[#f5f7ec]",
    border: "border-[3px] border-[#a1c852]",
    pill: "bg-[#a1c852]",
    bar: "bg-[#a1c852]",
    track: "bg-[#e5e8d7]",
    accent: "text-[#8fae44]",
  },
  {
    bg: "bg-[#f7f5ec]",
    border: "border-[3px] border-[#e9c523]",
    pill: "bg-[#e9c523]",
    bar: "bg-[#e9c523]",
    track: "bg-[#ece9db]",
    accent: "text-[#c7a41d]",
  },
];

/* ── 정기모임 카드 ──────────────────────────────────────── */
function MeetingCard({
  vote,
  themeIndex,
  isLoggedIn,
  focused,
  onHoverChange,
}: {
  vote: VoteData;
  themeIndex: number;
  isLoggedIn: boolean;
  focused: boolean;
  onHoverChange: (hovering: boolean) => void;
}) {
  const theme = CARD_THEMES[Math.min(themeIndex, CARD_THEMES.length - 1)];
  const title = vote.name || vote.title || "정기 운동";
  const currentCount =
    vote.currentParticipantCount ?? vote.attendance?.currentAttendees ?? 0;
  const maxCount = vote.capacity ?? vote.attendance?.totalParticipants ?? 0;
  const hasCapacity = maxCount > 0; // FLASH(번개)는 정원이 없어 0으로 옴
  const ratio = hasCapacity
    ? Math.min(Math.round((currentCount / maxCount) * 100), 100)
    : 0;
  const full = hasCapacity && currentCount >= maxCount;
  const dDayLabel = getDDayLabel(vote.activityDate);

  return (
    <Link
      href="/activities"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={`group relative rounded-[28px] p-6 sm:p-7 flex flex-col gap-5 transition-all hover:-translate-y-1 ${theme.bg} ${
        focused
          ? `${theme.border} shadow-[var(--shadow-card)]`
          : "border-[3px] border-transparent hover:shadow-[var(--shadow-card)]"
      }`}
    >
      {focused && (
        <img
          src="/images/shuttlecock.svg"
          alt=""
          style={{ transform: "rotate(103.35deg)" }}
          className="absolute -top-12 -right-6 w-[75.713px] h-[73.41px] pointer-events-none drop-shadow-sm transition-opacity duration-300"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dDayLabel && (
            <span className="bg-white border border-[#dcdcdc] text-[#1a1a1a] text-sm font-normal px-3 py-1 rounded-full">
              {dDayLabel}
            </span>
          )}
          {full ? (
            <span className="bg-brand-dark text-white text-sm font-normal px-3 py-1 rounded-full">
              모집완료
            </span>
          ) : (
            <span className={`${theme.pill} text-white text-sm font-normal px-3 py-1 rounded-full flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" />
              모집중
            </span>
          )}
        </div>
        <ArrowUpRight className={`w-5 h-5 ${theme.accent} transition-colors`} />
      </div>

      <h3 className="text-base sm:text-[20px] font-semibold text-ink leading-snug break-keep">
        {title}
      </h3>

      <div className="space-y-2 text-base font-normal text-[#52525c]">
        <p className="flex items-center gap-1.5">
          <PinIcon className={`w-4 h-4 ${theme.accent} shrink-0`} />
          {vote.location}
        </p>
        <p className="flex items-center gap-1.5">
          <CalendarIcon className={`w-4 h-4 ${theme.accent} shrink-0`} />
          {vote.activityDate} {vote.activityTime && `· ${vote.activityTime}`}
        </p>
      </div>

      <div className="mt-1">
        {hasCapacity ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-base font-normal text-[#71717b]">
                <PeopleIcon className={`w-4 h-4 ${theme.accent}`} />
                {isLoggedIn ? `${currentCount} / ${maxCount}명` : "?? / ??명"}
              </span>
              <span className="text-sm font-bold text-[#1a1a1a]">
                {isLoggedIn ? `${ratio}%` : "??%"}
              </span>
            </div>
            <div className={`w-full h-2.5 ${theme.track} rounded-full overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${full ? "bg-brand-dark" : theme.bar}`}
                style={{ width: `${isLoggedIn ? ratio : 0}%` }}
              />
            </div>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-base font-normal text-[#71717b]">
            <PeopleIcon className={`w-4 h-4 ${theme.accent}`} />
            {isLoggedIn ? `${currentCount}명 참가` : "??명 참가"}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── 체육관 위치 ────────────────────────────────────────── */
type Gym = {
  key: "magok" | "mangwon";
  tab: string;
  name: string;
  address: string;
  scheduleLabel: string;
  parking: string;
  scheduleTime: string[];
  placeId: string;
  lat: number;
  lng: number;
};

const GYMS: Gym[] = [
  {
    key: "magok",
    tab: "마곡",
    name: "마곡실내배드민턴장",
    address: "서울특별시 강서구 가양제1동 양천로 251",
    scheduleLabel: "화요일",
    parking: "주차장 이용 가능",
    scheduleTime: ["16:00 - 19:00"],
    placeId: "7856404",
    lat: 37.5675,
    lng: 126.8405,
  },
  {
    key: "mangwon",
    tab: "망원",
    name: "망원나들목체육관",
    address: "서울특별시 마포구 동교로1길 45",
    scheduleLabel: "토요일",
    parking: "주차장 이용 가능 (망원한강공원 주차장)",
    scheduleTime: ["13:30 - 15:30", "16:00 - 18:00"],
    placeId: "1227651208",
    lat: 37.5556,
    lng: 126.9015,
  },
];

type KakaoPlace = { id: string; x: string; y: string };

function GymMap({ gym, sdkReady }: { gym: Gym; sdkReady: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;

    const { kakao } = window;
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(gym.lat, gym.lng),
      level: 4,
    });

    const placeMarker = (lat: number, lng: number) => {
      const position = new kakao.maps.LatLng(lat, lng);
      map.setCenter(position);
      const marker = new kakao.maps.Marker({ map, position });
      kakao.maps.event.addListener(marker, "click", () => {
        window.open(`https://place.map.kakao.com/${gym.placeId}`, "_blank");
      });
    };

    const places = new kakao.maps.services.Places();
    places.keywordSearch(gym.name, (data: KakaoPlace[], status: string) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const exact = data.find((p) => p.id === gym.placeId) ?? data[0];
        placeMarker(Number(exact.y), Number(exact.x));
        return;
      }
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(
        gym.address,
        (result: { x: string; y: string }[], st: string) => {
          if (st === kakao.maps.services.Status.OK && result[0]) {
            placeMarker(Number(result[0].y), Number(result[0].x));
          } else {
            placeMarker(gym.lat, gym.lng);
          }
        },
      );
    });
  }, [sdkReady, gym]);

  if (!KAKAO_MAP_API_KEY) {
    return (
      <div className="w-full h-full bg-[#F0F7FA] flex items-center justify-center text-gray-400 text-sm font-bold px-6 text-center">
        NEXT_PUBLIC_KAKAO_MAP_API_KEY 설정 후 지도가 표시됩니다.
      </div>
    );
  }

  return (
    <div ref={mapRef} title={`${gym.name} 지도`} className="w-full h-full" />
  );
}

function MapAppButton({
  label,
  href,
  primary,
}: {
  label: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`h-[46px] px-3 sm:px-4 rounded-md flex items-center justify-center gap-1.5 text-[14px] sm:text-[15px] font-medium transition-all ${
        primary
          ? "bg-white border border-[#93C54B] text-[#5b6b0f] hover:bg-[#F1F6EC]"
          : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      <ArrowUpRight className="w-3.5 h-3.5" />
    </a>
  );
}

function GymLocationSection() {
  const [sdkReady, setSdkReady] = useState(false);
  const [activeKey, setActiveKey] = useState<Gym["key"]>("magok");
  const gym = GYMS.find((g) => g.key === activeKey)!;

  const initKakaoSdk = () => {
    window.kakao?.maps?.load(() => setSdkReady(true));
  };

  useEffect(() => {
    if (window.kakao?.maps) initKakaoSdk();
  }, []);

  const query = encodeURIComponent(gym.name);
  const mapApps = [
    {
      label: "네이버 지도",
      href: `https://map.naver.com/v5/search/${query}`,
      primary: true,
    },
    {
      label: "카카오 지도",
      href: `https://place.map.kakao.com/${gym.placeId}`,
    },
    { label: "구글 지도", href: `https://www.google.com/maps/search/${query}` },
    { label: "TMAP", href: `https://tmap.life/route?goalname=${query}` },
  ];

  return (
    <section className="w-full bg-white py-12 sm:py-20 px-6 max-w-screen-xl mx-auto">
      {KAKAO_MAP_API_KEY && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
          strategy="afterInteractive"
          onLoad={initKakaoSdk}
        />
      )}

      {/* 상단 헤더 영역 */}
      <div className="text-center space-y-3 mb-10 sm:mb-16">
        <h2 className="text-2xl sm:text-[40px] font-bold text-ink">
          체육관 위치
        </h2>
        <p className="text-sm sm:text-[18px] font-normal text-[#494949]">
          매주 화요일, 토요일에 만나요!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-x-20 items-start">
        {/* 1. 탭 메뉴 (모바일: 중앙 정렬, 상단 배치 / 데스크탑: 좌측 정렬) */}
        <div className="order-1 lg:order-1 flex justify-center lg:justify-start w-full">
          <div className="bg-white rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-1.5 flex w-[90%] max-w-[320px] sm:max-w-none sm:w-auto border border-gray-100/50">
            {GYMS.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveKey(g.key)}
                className={`flex-1 sm:w-[140px] py-2.5 rounded-full text-[15px] sm:text-[18px] font-semibold transition-colors ${
                  activeKey === g.key
                    ? "bg-[#93C54B] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {g.tab}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 지도 영역 (모바일: 탭과 상세 정보 사이 / 데스크탑: 우측) */}
        <div className="order-2 lg:order-2 lg:col-start-2 lg:row-span-2 w-full relative flex justify-center">
          {/* 지도 컨테이너 (유기적 Blob 테두리 곡선 적용) */}
          <div
            className="w-full sm:w-[90%] lg:w-full h-[320px] sm:h-[400px] relative overflow-hidden shadow-sm"
            style={{ borderRadius: "82% 18% 56% 44% / 29% 20% 80% 71%" }}
          >
            <GymMap gym={gym} sdkReady={sdkReady} />
          </div>

          {/* 데코레이션 캐릭터 */}
          <div className="hidden lg:block absolute -bottom-8 -right-2 sm:-bottom-12 sm:-right-8 lg:-right-14 w-[160px] sm:w-[240px] lg:w-[280px] z-10 pointer-events-none drop-shadow-md transition-all">
            <img
              src="/images/character-map.svg"
              alt="양배추 캐릭터"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* 3. 상세 정보 및 버튼 영역 (모바일: 지도 아래 / 데스크탑: 좌측 탭 아래) */}
        <div className="order-3 lg:order-3 lg:col-start-1 w-full flex flex-col gap-6 lg:mt-0 font-body">
          <h3 className="text-[20px] sm:text-[24px] font-bold text-black">
            {gym.name}
          </h3>

          <div className="flex flex-col gap-3.5 text-[14px] sm:text-[18px] font-medium text-[#111111]">
            <p className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#5b6b0f] text-white flex items-center justify-center shrink-0">
                <PinIcon className="w-3.5 h-3.5" />
              </span>
              {gym.address}
            </p>
            <p className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#5b6b0f] text-white flex items-center justify-center shrink-0 text-[11px] font-bold pb-px">
                P
              </span>
              {gym.parking}
            </p>
          </div>

          {/* 구분선 */}
          <div className="h-px w-full bg-gray-100 my-1" />

          {/* 지도 앱 바로가기 버튼 그룹 (모바일 환경 2x2 반응형 적용) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {mapApps.map((m) => (
              <MapAppButton key={m.label} {...m} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}