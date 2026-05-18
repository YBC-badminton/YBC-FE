"use client";

import React from "react";
import Link from "next/link";
import { Sansita } from "next/font/google";

const sansita = Sansita({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

export default function YBCMainPage() {
  const scrollToApply = () => {
    const element = document.getElementById("apply-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-white text-slate-900">
      <HeroSection scrollToApply={scrollToApply} />
      <AboutSection />
      <ScheduleSection />
      <GymLocationSection />
      <ApplySection />
    </div>
  );
}

/* ---------------- Hero ---------------- */

function HeroSection({ scrollToApply }: { scrollToApply: () => void }) {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] bg-[#F6FAEA] overflow-hidden flex items-center justify-center py-20 sm:py-0">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/symbol.png"
          alt=""
          aria-hidden
          className="absolute top-[-8%] left-[-4%] w-[22%] max-w-[280px] opacity-[0.08] rotate-[-12deg] object-contain"
        />
        <img
          src="/images/symbol.png"
          alt=""
          aria-hidden
          className="absolute bottom-[-10%] right-[-6%] w-[28%] max-w-[360px] opacity-[0.06] rotate-[8deg] object-contain"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-center w-full gap-12 lg:gap-16">
        <div className="flex justify-center lg:justify-start animate-fade-in-left">
          <img
            src="/images/mascot.png"
            alt="YBC Badminton Mascot"
            className="w-[220px] sm:w-[300px] lg:w-[400px] h-auto object-contain"
          />
        </div>

        <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 text-center lg:text-left animate-fade-in-up">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-emerald-700 tracking-[0.25em] uppercase">
            <span className="w-6 h-px bg-emerald-700" />
            Seoul Badminton Club
          </span>

          <h1
            className={`${sansita.className} text-5xl sm:text-7xl lg:text-[80px] text-emerald-900 leading-[1.05] tracking-tight`}
          >
            YBC badminton<br />club
          </h1>

          <p className="text-base sm:text-xl font-medium text-slate-600 max-w-md leading-relaxed">
            양질의 배드민턴을 함께 추구하는 사람들. <br className="hidden sm:block" />
            화요일과 토요일, 코트 위에서 만나요.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
            <button
              onClick={scrollToApply}
              className="group bg-emerald-700 text-white text-sm sm:text-base font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-sm hover:bg-emerald-800 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              지원하기
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div className="bg-white px-5 py-2.5 sm:py-3 rounded-full shadow-sm flex items-center gap-2.5 border border-slate-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-slate-700">
                현재 모집중
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-emerald-900/10 w-full max-w-md">
            <HeroStat value="50+" label="부원" />
            <HeroStat value="주 2회" label="정기 모임" />
            <HeroStat value="2개" label="홈 코트" />
          </div>
        </div>
      </div>

      <button
        onClick={scrollToApply}
        aria-label="다음 섹션으로"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-emerald-800/40 hover:text-emerald-800 transition-colors cursor-pointer"
      >
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xl sm:text-2xl font-bold text-emerald-900">{value}</span>
      <span className="text-xs sm:text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}

/* ---------------- About ---------------- */

function AboutSection() {
  return (
    <section className="w-full bg-white py-24 sm:py-32 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24">
        <div className="flex flex-col gap-8">
          <SectionEyebrow index="01" label="About" />
          <h2 className="text-3xl sm:text-5xl font-bold text-emerald-900 tracking-tight leading-tight">
            실력보다 꾸준함을<br />추구합니다
          </h2>
          <div className="flex flex-col gap-4 text-base sm:text-lg font-normal text-slate-600 leading-relaxed">
            <p>
              YBC는 양질의 배드민턴을 함께 추구하는 동호회입니다. 매주 두 번,
              코트 위에서 게임과 기초 트레이닝을 함께 합니다.
            </p>
            <p>
              초보자부터 선수 출신까지 다양한 부원들이 함께합니다. 실력의 격차보다
              꾸준한 출석과 서로를 배려하는 코트 매너를 더 중요하게 생각해요.
            </p>
            <p>
              운동이 끝난 뒤에는 함께 식사를 하거나, 시즌마다 친선전 · 단체전을
              엽니다. 라켓을 잡는 시간이 일상에 작은 활력이 되었으면 좋겠습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 max-w-md">
            <InfoCard
              icon={<img src="/images/Calendar.svg" alt="" className="w-full h-full" />}
              label="정기 활동"
              value="주 2회"
            />
            <InfoCard
              icon={<img src="/images/Users.svg" alt="" className="w-full h-full" />}
              label="부원 수"
              value="50+명"
            />
          </div>
        </div>

        <div className="relative w-full aspect-[5/4] max-w-[560px] mx-auto">
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-3 sm:gap-4">
            <div className="col-span-4 row-span-4 bg-[#E8F0D2] rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center">
              <img
                src="/images/mascot.png"
                alt="YBC Mascot"
                className="w-3/4 h-3/4 object-contain"
              />
            </div>
            <div className="col-span-2 row-span-2 bg-emerald-700 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between text-white">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase opacity-80">Since</span>
              <span className={`${sansita.className} text-2xl sm:text-3xl leading-none`}>2020</span>
            </div>
            <div className="col-span-2 row-span-2 bg-[#F2F8E1] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-emerald-700">Court</span>
              <span className={`${sansita.className} text-2xl sm:text-3xl leading-none text-emerald-900`}>2</span>
            </div>
            <div className="col-span-6 row-span-2 bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex items-center justify-between text-white">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-emerald-300">Mission</span>
                <span className="text-sm sm:text-base font-medium leading-snug">
                  양질의 배드민턴 추구
                </span>
              </div>
              <img src="/images/Star.png" alt="" className="w-10 h-10 sm:w-14 sm:h-14 object-contain opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Schedule (정기모임) ---------------- */

function ScheduleSection() {
  const today = useToday();
  const todayGym = today ? getGymForToday(today) : null;

  const cards = [
    { gym: GYMS.magok, dayIndex: 2 },
    { gym: GYMS.mangwon, dayIndex: 6 },
  ];

  return (
    <section className="w-full bg-[#FAFCF3] py-24 sm:py-32">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col gap-5 sm:gap-6 mb-12 sm:mb-16">
          <SectionEyebrow index="02" label="Schedule" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-emerald-900 tracking-tight leading-tight">
              정기모임
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-500 max-w-md">
              매주 두 곳의 코트에서 만나요. 다음 모임의 일정을 확인해보세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {cards.map(({ gym, dayIndex }) => {
            const isNext = today ? gym === todayGym : false;
            const daysUntil = today ? daysUntilWeekday(today, dayIndex) : null;
            return (
              <ScheduleCard
                key={gym.name}
                gym={gym}
                isNext={isNext}
                daysUntil={daysUntil}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScheduleCard({
  gym,
  isNext,
  daysUntil,
}: {
  gym: Gym;
  isNext: boolean;
  daysUntil: number | null;
}) {
  return (
    <div
      className={`group relative bg-white rounded-3xl p-7 sm:p-9 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 ${
        isNext
          ? "border-2 border-emerald-700 shadow-[0_8px_30px_-12px_rgba(4,120,87,0.25)]"
          : "border border-slate-100 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full tracking-wider uppercase ${
              isNext ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {gym.scheduleLabel}
          </span>
          {isNext && daysUntil !== null && (
            <span className="text-xs font-medium text-emerald-700">
              {daysUntil === 0 ? "오늘 모임" : `D-${daysUntil}`}
            </span>
          )}
        </div>
        <svg
          className="w-5 h-5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {gym.name}
        </h3>
        <p className="text-sm sm:text-base font-medium text-slate-500">
          {gym.address}
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2 pt-6 border-t border-slate-100">
        {gym.scheduleTime.map((time) => (
          <div key={time} className="flex items-center gap-3">
            <span className="text-emerald-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-700">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Gym Location ---------------- */

function GymLocationSection() {
  const today = useToday();
  const gym = today ? getGymForToday(today) : GYMS.magok;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(gym.placeQuery)}&language=ko&region=KR`
    : null;

  return (
    <section className="w-full bg-white py-24 sm:py-32">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col gap-5 sm:gap-6 mb-12 sm:mb-16">
          <SectionEyebrow index="03" label="Location" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="text-3xl sm:text-5xl font-bold text-emerald-900 tracking-tight leading-tight">
              체육관 위치
            </h2>
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              이번 주 다음 모임 · {gym.scheduleLabel} · {gym.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 sm:gap-6 items-stretch">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            <div className="flex-1 w-full bg-slate-100 relative">
              {embedSrc ? (
                <iframe
                  key={gym.placeQuery}
                  title={`${gym.name} 지도`}
                  src={embedSrc}
                  className="w-full h-full min-h-[320px]"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full min-h-[320px] flex items-center justify-center text-slate-400 text-sm font-medium px-6 text-center">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 설정 후 지도가 표시됩니다.
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8 flex items-center gap-4 border-t border-slate-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center bg-emerald-50 rounded-2xl">
                <img src="/images/Location.svg" alt="" className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-bold text-slate-900">{gym.name}</p>
                <p className="text-sm font-medium text-slate-500">{gym.address}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="bg-[#F6FAEA] p-7 sm:p-9 rounded-3xl flex-1">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-5 tracking-tight">
                찾아오시는 길
              </h4>
              <ul className="space-y-3.5 text-sm sm:text-base font-medium text-slate-600">
                {gym.directions.map((line) => (
                  <li key={line} className="flex items-start gap-3 leading-relaxed">
                    <span className="text-emerald-600 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#F6FAEA] p-7 sm:p-9 rounded-3xl">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-5 tracking-tight">
                정기 활동 시간
              </h4>
              <div className="space-y-4 text-sm sm:text-[15px] font-medium">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-emerald-700 font-semibold">화요일</span>
                  <span className="text-slate-700 text-right">
                    {GYMS.magok.scheduleTime.join(" / ")}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-emerald-700 font-semibold">토요일</span>
                  <span className="text-slate-700 text-right whitespace-pre-line">
                    {GYMS.mangwon.scheduleTime.join("\n")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Apply ---------------- */

function ApplySection() {
  return (
    <section
      id="apply-section"
      className="w-full bg-white py-24 sm:py-32"
    >
      <div className="max-w-screen-xl mx-auto px-6 sm:px-12">
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[44px] bg-emerald-900 text-white px-8 sm:px-16 py-16 sm:py-24 flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
            <img
              src="/images/symbol.png"
              alt=""
              aria-hidden
              className="absolute -top-12 -right-8 w-56 sm:w-72 rotate-12 object-contain"
            />
            <img
              src="/images/symbol.png"
              alt=""
              aria-hidden
              className="absolute -bottom-16 -left-12 w-64 sm:w-80 -rotate-12 object-contain"
            />
          </div>

          <span className="relative inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-emerald-300 tracking-[0.25em] uppercase">
            <span className="w-6 h-px bg-emerald-300" />
            Join Us
          </span>

          <h2 className="relative text-3xl sm:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
            라켓 하나만 있으면<br />함께 시작할 수 있어요
          </h2>
          <p className="relative text-base sm:text-lg font-normal text-emerald-100 max-w-xl leading-relaxed">
            실력보다 열정을 가진 새로운 가족을 언제나 기다리고 있습니다.
            지원서를 작성하고 다음 정기 모임에서 만나요.
          </p>

          <Link href="/apply" className="relative mt-2">
            <button className="group bg-white text-emerald-900 text-sm sm:text-base font-bold px-9 sm:px-11 py-3.5 sm:py-4 rounded-full hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2.5 shadow-sm hover:shadow-md">
              지원하기
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Shared ---------------- */

function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold text-emerald-700 tracking-[0.25em] uppercase">
      <span className="font-mono opacity-60">{index}</span>
      <span className="w-6 h-px bg-emerald-700/40" />
      <span>{label}</span>
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
    <div className="bg-[#F6FAEA] px-5 sm:px-6 py-5 sm:py-6 rounded-2xl flex flex-col gap-2 border border-emerald-900/5">
      <div className="w-6 h-6 sm:w-7 sm:h-7 mb-1 opacity-80">{icon}</div>
      <p className="text-[10px] sm:text-xs font-semibold text-emerald-800/70 uppercase tracking-[0.15em]">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/* ---------------- Data & utilities ---------------- */

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
      "지하철 9호선/공항철도 마곡나루역 인근",
      "버스: 마곡나루역 정류장 하차",
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
      "지하철 6호선 망원역 1번 출구 도보 10분",
      "한강공원 망원지구 내 위치",
      "주차장 이용 가능 (망원한강공원 주차장)",
    ],
    placeQuery: "place_id:ChIJe4XAnIWZfDURf4mpO8Zml-U",
  },
};

function getGymForToday(today: Date): Gym {
  const day = today.getDay();
  return day <= 2 ? GYMS.magok : GYMS.mangwon;
}

function daysUntilWeekday(today: Date, targetDay: number): number {
  const current = today.getDay();
  return (targetDay - current + 7) % 7;
}

function useToday(): Date | null {
  const [today, setToday] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}
