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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.36 11.43 6.63 11.69a1.25 1.25 0 0 0 1.74 0c.27-.26 6.63-6.44 6.63-11.69C19.5 5.36 16.14 2 12 2Zm0 10.25a2.75 2.75 0 1 1 0-5.5 2.75 2.75 0 0 1 0 5.5Z" />
    </svg>
  );
}
function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="17" rx="3" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}
function PeopleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-2a4 4 0 0 0-3-3.87M16 2.13A4 4 0 0 1 16 9.87" />
    </svg>
  );
}
function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export default function YBCMainPage() {
  const [recentVotes, setRecentVotes] = useState<VoteData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, loginKakao, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    const fetchActiveVotes = async () => {
      try {
        const response = await api.get("/votes", { params: { open: true, page: 0, size: 50 } });

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.votes)) {
          data = response.data.votes;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        setRecentVotes(data.slice(0, 3));
      } catch (error) {
        console.warn("진행 중인 투표를 불러오지 못했습니다. 기본 활성 데이터를 노출합니다.", error);
        setRecentVotes([
          { voteId: 998, name: "이번 주 화요 정기 운동", activityDate: "2026-06-09", activityTime: "19:00", location: "마곡실내배드민턴장", currentParticipantCount: 15, capacity: 20 },
          { voteId: 999, name: "이번 주 토요 정기 운동", activityDate: "2026-06-13", activityTime: "13:30", location: "망원나들목체육관", currentParticipantCount: 18, capacity: 20 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveVotes();
  }, []);

  const scrollToApply = () => {
    document.getElementById("apply-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white">
      {/* ── 히어로 ───────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden -mt-[80px] pt-[120px] pb-16 sm:pb-24 bg-gradient-to-b from-brand-soft via-brand-wash to-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.18]">
          <img src="/images/symbol.png" alt="" className="absolute top-[6%] left-[-2%] w-[16%] max-w-[220px] -rotate-12 object-contain" />
          <img src="/images/symbol.png" alt="" className="absolute bottom-[8%] right-[-2%] w-[18%] max-w-[260px] rotate-12 object-contain" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 relative z-10 flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="flex items-end justify-center gap-1 sm:gap-6">
            <img src="/images/mascot.png" alt="YBC 마스코트" className="w-16 sm:w-[150px] h-auto object-contain -scale-x-100 animate-fade-in-left" />
            <h1 className="font-black text-brand-dark text-5xl sm:text-8xl tracking-tight leading-none drop-shadow-sm">
              양배추
            </h1>
            <img src="/images/mascot.png" alt="YBC 마스코트" className="w-16 sm:w-[150px] h-auto object-contain" />
          </div>

          <p className="text-lg sm:text-2xl font-semibold text-brand-ink/90 tracking-tight">
            양질의 배드민턴 추구
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <button
              onClick={scrollToApply}
              className="bg-white px-6 py-2.5 rounded-full shadow-[var(--shadow-card)] flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95"
            >
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand" />
              </span>
              <span className="text-base font-bold text-ink tracking-tight">모집중</span>
            </button>

            {!user && (
              <button
                onClick={() => loginKakao()}
                disabled={isAuthLoading}
                className="bg-[#FEE500] px-6 py-2.5 rounded-full shadow-[var(--shadow-card)] flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-[#191919]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24-.14.52-.9 3.37-.93 3.58 0 0-.02.17.09.23.11.07.23.03.23.03.31-.04 3.56-2.33 4.12-2.73.7.1 1.42.15 2.13.15 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
                </svg>
                <span className="text-base font-bold text-[#191919] tracking-tight">
                  {isAuthLoading ? "로그인 중..." : "카카오 로그인"}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 동아리 소개 ──────────────────────────────────── */}
      <section className="w-full bg-white py-16 sm:py-24">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col items-center text-center gap-5">
          <h2 className="font-display text-[26px] sm:text-5xl text-brand-dark tracking-wide break-keep">
            YBC badminton club
          </h2>
          <div className="text-base sm:text-lg font-medium text-muted leading-relaxed max-w-2xl space-y-1">
            <p>양질의 배드민턴을 추구하는 사람들이 모인 동아리, 양배추입니다.</p>
            <p>매주 화요일·토요일, 실력보다 열정을 가진 분들과 함께합니다.</p>
            <p>처음이어도 괜찮아요. 함께 즐기며 성장하는 배드민턴을 경험하세요.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-5 sm:gap-6 mt-8 w-full">
            <div className="flex-1 max-w-[420px] mx-auto sm:mx-0 bg-brand rounded-[40px] min-h-[150px] flex items-center justify-center text-white/85 font-semibold text-sm sm:text-base shadow-[var(--shadow-card)] px-6 text-center">
              동아리 실제 활동 사진 삽입
            </div>
            <InfoBlob label="정기 활동" prefix="주" value="2회" tone="soft" />
            <InfoBlob label="부원 수" value="50+" suffix="명" tone="neutral" />
          </div>
        </div>
      </section>

      {/* ── 정기모임 ─────────────────────────────────────── */}
      <section className="w-full bg-white py-12 sm:py-16 px-6 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">정기모임</h2>
          <Link href="/activities" className="flex items-center gap-1 text-sm font-semibold text-subtle hover:text-brand-dark transition-colors">
            <span className="text-base leading-none">＋</span> 전체보기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`rounded-[28px] p-6 border border-line/60 bg-brand-wash animate-pulse flex flex-col gap-5 ${i === 2 ? "hidden lg:flex" : ""}`}>
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
              <MeetingCard key={vote.voteId ?? idx} vote={vote} active={idx === 0} />
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

      {/* ── 지원하기 ─────────────────────────────────────── */}
      <section
        id="apply-section"
        className="relative w-full mt-10 overflow-hidden bg-gradient-to-b from-brand-wash to-brand-soft"
      >
        <img src="/images/symbol.png" alt="" className="absolute -bottom-6 right-4 w-24 sm:w-36 opacity-20 rotate-12 pointer-events-none" />
        <div className="max-w-screen-lg mx-auto px-6 py-20 sm:py-28 flex flex-col items-center text-center gap-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">지원하기</h2>
          <p className="text-base sm:text-lg font-medium text-muted max-w-xl leading-relaxed">
            YBC 배드민턴 클럽은 실력보다 열정을 가진{" "}
            <br className="hidden sm:block" />
            새로운 가족을 언제나 기다리고 있습니다.
          </p>
          <Link href="/apply">
            <button className="bg-brand text-white text-base font-bold px-12 py-3.5 rounded-full shadow-[var(--shadow-card)] hover:bg-brand-hover hover:-translate-y-0.5 transition-all duration-300">
              지원하기
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── 소개 블롭 카드 ─────────────────────────────────────── */
function InfoBlob({
  label,
  prefix,
  value,
  suffix,
  tone,
}: {
  label: string;
  prefix?: string;
  value: string;
  suffix?: string;
  tone: "soft" | "neutral";
}) {
  return (
    <div
      className={`flex-1 max-w-[220px] mx-auto sm:mx-0 rounded-[40px] min-h-[150px] flex flex-col items-center justify-center gap-1.5 px-6 text-center shadow-[var(--shadow-card)] ${
        tone === "soft" ? "bg-brand-tint" : "bg-[#ededed]"
      }`}
    >
      <p className="text-sm font-semibold text-subtle tracking-tight">{label}</p>
      <p className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold text-brand-dark">{prefix}</span>}
        <span className="text-4xl sm:text-5xl font-black text-brand-dark">{value}</span>
        {suffix && <span className="text-lg font-bold text-brand-dark">{suffix}</span>}
      </p>
    </div>
  );
}

/* ── 정기모임 카드 ──────────────────────────────────────── */
function MeetingCard({ vote, active }: { vote: VoteData; active: boolean }) {
  const title = vote.name || vote.title || "정기 운동";
  const currentCount = vote.currentParticipantCount ?? vote.attendance?.currentAttendees ?? 0;
  const maxCount = vote.capacity ?? vote.attendance?.totalParticipants ?? 20;
  const ratio = Math.min(Math.round((currentCount / maxCount) * 100), 100);
  const full = currentCount >= maxCount;

  return (
    <Link
      href="/activities"
      className={`group relative rounded-[28px] p-6 sm:p-7 flex flex-col gap-5 transition-all hover:-translate-y-1 ${
        active
          ? "bg-white border-2 border-brand shadow-[var(--shadow-card)]"
          : "bg-brand-wash border border-line/70 hover:shadow-[var(--shadow-card)]"
      }`}
    >
      {active && (
        <img
          src="/images/shuttlecock.svg"
          alt=""
          style={{ transform: "rotate(103.35deg)" }}
          className="absolute -top-12 -right-6 w-[75.713px] h-[73.41px] pointer-events-none drop-shadow-sm"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#ededed] text-subtle text-xs font-bold px-3 py-1 rounded-full">오늘</span>
          {full ? (
            <span className="bg-brand-dark text-white text-xs font-bold px-3 py-1 rounded-full">모집완료</span>
          ) : (
            <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" />
              모집중
            </span>
          )}
        </div>
        <ArrowUpRight className="w-5 h-5 text-subtle group-hover:text-brand-dark transition-colors" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-ink leading-snug break-keep">{title}</h3>

      <div className="space-y-2 text-sm font-medium text-muted">
        <p className="flex items-center gap-1.5">
          <PinIcon className="w-4 h-4 text-brand-dark shrink-0" />
          {vote.location}
        </p>
        <p className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-brand-dark shrink-0" />
          {vote.activityDate} {vote.activityTime && `· ${vote.activityTime}`}
        </p>
      </div>

      <div className="mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted">
            <PeopleIcon className="w-4 h-4 text-brand-dark" />
            {currentCount} / {maxCount}명
          </span>
          <span className="text-sm font-bold text-brand-dark">{ratio}%</span>
        </div>
        <div className="w-full h-2.5 bg-line/70 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${full ? "bg-brand-dark" : "bg-brand"}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
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
      geocoder.addressSearch(gym.address, (result: { x: string; y: string }[], st: string) => {
        if (st === kakao.maps.services.Status.OK && result[0]) {
          placeMarker(Number(result[0].y), Number(result[0].x));
        } else {
          placeMarker(gym.lat, gym.lng);
        }
      });
    });
  }, [sdkReady, gym]);

  if (!KAKAO_MAP_API_KEY) {
    return (
      <div className="w-full h-full min-h-[300px] rounded-[28px] bg-brand-soft flex items-center justify-center text-subtle text-sm font-medium px-6 text-center">
        NEXT_PUBLIC_KAKAO_MAP_API_KEY 설정 후 지도가 표시됩니다.
      </div>
    );
  }

  return <div ref={mapRef} title={`${gym.name} 지도`} className="relative z-0 w-full h-full min-h-[300px] rounded-[28px] overflow-hidden" />;
}

function MapAppButton({ label, href, primary }: { label: string; href: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`h-12 rounded-lg flex items-center justify-center gap-1.5 text-[15px] font-medium transition-colors ${
        primary
          ? "bg-white border border-brand-dark text-brand-dark hover:bg-brand-soft"
          : "bg-white border border-line text-subtle hover:bg-brand-soft"
      }`}
    >
      {label}
      <ArrowUpRight className="w-4 h-4" />
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
    { label: "네이버 지도", href: `https://map.naver.com/v5/search/${query}`, primary: true },
    { label: "카카오 지도", href: `https://place.map.kakao.com/${gym.placeId}` },
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

      <div className="text-center space-y-2 mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">체육관 위치</h2>
        <p className="text-base sm:text-lg font-medium text-subtle">매주 화요일, 토요일에 만나요!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
        {/* 좌측: 탭 + 정보 (Pretendard) */}
        <div className="flex flex-col font-body">
          <div className="self-start bg-white rounded-full shadow-[var(--shadow-card)] p-2.5 flex gap-2.5 mb-10">
            {GYMS.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveKey(g.key)}
                className={`w-[120px] sm:w-[140px] py-3 rounded-full text-base font-semibold transition-colors ${
                  activeKey === g.key ? "bg-brand text-white" : "text-[#666] hover:text-brand-dark"
                }`}
              >
                {g.tab}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-7">
            <div className="flex flex-col gap-5">
              <h3 className="text-xl sm:text-2xl font-bold text-black">{gym.name}</h3>
              <div className="flex flex-col gap-3 text-base text-black/90">
                <p className="flex items-center gap-1.5">
                  <PinIcon className="w-5 h-5 text-brand-dark shrink-0" />
                  {gym.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <PinIcon className="w-5 h-5 text-brand-dark shrink-0" />
                  {gym.parking}
                </p>
                <p className="flex items-center gap-1.5">
                  <CalendarIcon className="w-5 h-5 text-brand-dark shrink-0" />
                  {gym.scheduleLabel} · {gym.scheduleTime.join(" / ")}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-line" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {mapApps.map((m) => (
                <MapAppButton key={m.label} {...m} />
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 지도 */}
        <div className="relative min-h-[300px] lg:min-h-[420px]">
          <GymMap gym={gym} sdkReady={sdkReady} />
          <img
            src="/images/mascot-walk.svg"
            alt=""
            className="pointer-events-none select-none absolute -bottom-10 sm:-bottom-16 -right-1 sm:-right-4 w-40 h-auto sm:w-[352px] sm:h-[265px] drop-shadow-sm z-20"
          />
        </div>
      </div>
    </section>
  );
}
