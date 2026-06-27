"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { href: "/activities", label: "정기 모임" },
  { href: "/reviews", label: "장비 후기" },
  { href: "/past-activities", label: "지난 활동" },
  { href: "/faq", label: "문의하기" },
  { href: "/apply", label: "지원하기" },
  { href: "/minigame", label: "미니게임" },
];

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    router.push("/");
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "?";
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
            {NAV_LINKS.map((item) => (
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
            {user?.isAdmin && (
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
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                aria-label="프로필 메뉴"
                className="w-10 h-10 rounded-full bg-brand-dark text-white font-bold text-[15px] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
              >
                {initial}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  <div className="px-5 py-4 bg-brand-soft border-b border-gray-100">
                    <p className="text-[15px] font-bold text-ink truncate">
                      {user.name}
                    </p>
                    {user.email && (
                      <p className="text-xs font-medium text-subtle truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>
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

        {/* [우측] 모바일 햄버거 */}
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴 열기"
          className="lg:hidden p-1.5 text-brand-dark"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* 모바일 전체화면 메뉴 (Figma node 196:107) */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-5 h-[72px] border-b border-gray-100">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-dark text-white font-bold text-sm flex items-center justify-center">
                  {initial}
                </div>
                <span className="text-[15px] font-bold text-ink truncate max-w-[160px]">
                  {user.name}
                </span>
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
            {NAV_LINKS.map((item) => (
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
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-semibold text-ink tracking-tight"
              >
                관리자 페이지
              </Link>
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
