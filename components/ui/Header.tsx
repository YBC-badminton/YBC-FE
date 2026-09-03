"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const SEEN_ACTIVE_VOTE_IDS_KEY = "seenActiveVoteIds";

function loadSeenActiveVoteIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SEEN_ACTIVE_VOTE_IDS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSeenActiveVoteIds(ids: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_ACTIVE_VOTE_IDS_KEY, JSON.stringify(ids));
}

const NAV_LINKS: { href: string; label: string; authOnly?: boolean }[] = [
  { href: "/activities", label: "정기 모임", authOnly: true },
  { href: "/reviews", label: "장비 후기" },
  { href: "/past-activities", label: "지난 활동" },
  { href: "/faq", label: "문의하기" },
  { href: "/apply", label: "지원하기" },
  { href: "/minigame", label: "미니게임", authOnly: true },
];

function BellIcon({ className = "" }: { className?: string }) {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function LoginIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 12H3.62m0 0 3.5-3.5M3.62 12l3.5 3.5M11 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 💡 운영진 양배추 아이콘 컴포넌트
function CabbageIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${className}`}
      title="운영진"
    >
      🌱
    </span>
  );
}

// 💡 기수(term) 텍스트 포맷팅 헬퍼 (숫자는 크게, "기"는 작게)
function RenderTermBadge({ term, size = "normal" }: { term?: string; size?: "normal" | "small" }) {
  if (!term) return <span>-</span>;
  // "10기", "10" 등에서 숫자만 추출
  const numericTerm = String(term).replace(/[^0-9]/g, "");
  const textClass = size === "small" ? "text-[12px]" : "text-[14px]";
  const subTextClass = size === "small" ? "text-[9px]" : "text-[10px]";

  if (!numericTerm) {
    return <span className={textClass}>{term}</span>;
  }

  return (
    <span className="inline-flex items-baseline justify-center font-black leading-none">
      <span className={textClass}>{numericTerm}</span>
      <span className={`${subTextClass} font-bold ml-0.5 opacity-90`}>기</span>
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [seenActiveVoteIds, setSeenActiveVoteIds] = useState<number[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 유저 객체 정보 단언 처리
  const authUser = user as any;
  const userName = authUser?.name || authUser?.nickname || "부원";
  const userTerm = authUser?.term;
  const isAdmin = Boolean(authUser?.isAdmin);

  // 비로그인 시 authOnly 메뉴(미니게임) 숨김
  const visibleLinks = NAV_LINKS.filter((l) => !l.authOnly || !!user);

  // 내가 참여한 ACTIVE 상태 투표 = 프로필 알림 목록
  const activeVotes: { voteId: number; name: string }[] = authUser?.activeVotes || [];
  const hasUnreadActiveVote = activeVotes.some(
    (v) => !seenActiveVoteIds.includes(v.voteId),
  );

  useEffect(() => {
    setSeenActiveVoteIds(loadSeenActiveVoteIds());
  }, []);

  // 알림을 확인하면(프로필 메뉴/모바일 메뉴를 열면) 빨간 점 제거
  const markActiveVotesAsSeen = () => {
    if (activeVotes.length === 0) return;
    const merged = Array.from(
      new Set([...seenActiveVoteIds, ...activeVotes.map((v) => v.voteId)]),
    );
    setSeenActiveVoteIds(merged);
    saveSeenActiveVoteIds(merged);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  // 모바일 메뉴 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 bg-white rounded-full shadow-[var(--shadow-pill)] px-5 sm:px-8 h-[64px] sm:h-[72px]">
        {/* [좌측] YBC 로고 */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/images/logo.png"
            alt="YBC Logo"
            className="h-7 sm:h-9 w-auto object-contain transition-transform hover:scale-105 active:scale-95"
          />
        </Link>

        {/* [중앙] 데스크톱 메뉴 */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[15px] font-medium text-ink whitespace-nowrap">
            {visibleLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors hover:text-brand-dark ${
                    isActive(item.href) ? "text-brand-dark font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-brand-dark"
                >
                  관리자 페이지
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* [우측] 인증 영역 (데스크톱) */}
        <div className="hidden lg:flex items-center shrink-0">
          {user ? (
            <div className="relative" ref={profileRef}>
              {/* 💡 프로필 이미지 동그라미 안에 기수(term) 표시 */}
              <button
                onClick={() =>
                  setIsProfileOpen((v) => {
                    const next = !v;
                    if (next) markActiveVotesAsSeen();
                    return next;
                  })
                }
                aria-label="프로필 메뉴"
                className="relative w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                <RenderTermBadge term={userTerm} size="normal" />
                {hasUnreadActiveVote && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="px-5 py-4 bg-brand-soft border-b border-gray-100">
                    {/* 💡 운영진일 경우 이름 옆에 양배추 아이콘 추가 */}
                    <div className="flex items-center gap-1.5">
                      <p className="text-[15px] font-bold text-ink truncate">
                        {userName}
                      </p>
                      {isAdmin && <CabbageIcon />}
                    </div>
                    {authUser?.email && (
                      <p className="text-xs font-medium text-subtle truncate mt-0.5">
                        {authUser.email}
                      </p>
                    )}
                  </div>
                  {activeVotes.length > 0 && (
                    <ul className="max-h-52 overflow-y-auto border-b border-gray-100 py-1">
                      {activeVotes.map((vote) => (
                        <li key={vote.voteId}>
                          <Link
                            href={`/activities/${vote.voteId}`}
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-5 py-2.5 text-sm text-ink hover:bg-brand-soft transition-colors"
                          >
                            {vote.name} 참여가 확정됐어요!
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-semibold text-muted hover:bg-brand-soft transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-brand border border-brand-tint text-white text-[15px] font-semibold px-4 py-2 rounded-full hover:bg-brand-hover active:scale-95 transition-all"
            >
              <LoginIcon className="w-5 h-5" />
              로그인
            </Link>
          )}
        </div>

        {/* [우측] 모바일 알림 + 햄버거 */}
        <div className="flex items-center gap-1 lg:hidden">
          {user && (
            <button
              onClick={() => {
                setIsMenuOpen(true);
                markActiveVotesAsSeen();
              }}
              aria-label="알림"
              className="relative p-1.5 text-brand-dark"
            >
              <BellIcon className="w-6 h-6" />
              {hasUnreadActiveVote && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </button>
          )}
          <button
            onClick={() => {
              setIsMenuOpen(true);
              markActiveVotesAsSeen();
            }}
            aria-label="메뉴 열기"
            className="p-1.5 text-brand-dark"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 전체화면 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 h-[72px] border-b border-gray-100">
            {user ? (
              <div className="flex items-center gap-2.5">
                {/* 💡 모바일 프로필 이미지 동그라미 안에 기수(term) 표시 */}
                <div className="relative w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-sm">
                  <RenderTermBadge term={userTerm} size="small" />
                  {hasUnreadActiveVote && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>
                {/* 💡 모바일 상단 프로필에도 이름 + 운영진 양배추 아이콘 표시 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-ink truncate max-w-[140px]">
                    {userName}
                  </span>
                  {isAdmin && <CabbageIcon />}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-1.5 bg-brand border border-brand-tint text-white text-[15px] font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform"
              >
                <LoginIcon className="w-5 h-5" />
                로그인
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="메뉴 닫기"
              className="p-1.5 text-brand-dark"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col items-start gap-8 px-9 pt-14">
            {visibleLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-xl tracking-tight transition-colors ${
                  isActive(item.href)
                    ? "text-brand font-bold"
                    : "text-ink font-semibold"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-semibold text-ink tracking-tight"
              >
                관리자 페이지
              </Link>
            )}
            {user && activeVotes.length > 0 && (
              <div className="w-full flex flex-col items-start gap-3 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-subtle">알림</p>
                {activeVotes.map((vote) => (
                  <Link
                    key={vote.voteId}
                    href={`/activities/${vote.voteId}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-semibold text-ink tracking-tight"
                  >
                    {vote.name} 참여가 확정됐어요!
                  </Link>
                ))}
              </div>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="mt-2 text-base font-semibold text-subtle"
              >
                로그아웃
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
