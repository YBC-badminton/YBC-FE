"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    router.push("/");
  };

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "?";

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

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-5 sm:px-12 py-4 sm:py-5">
        {/* [좌측] YBC 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-2 transition-transform group-hover:scale-105 active:scale-95">
            <img
              src="/images/logo.png"
              alt="YBC Logo"
              className="h-9 sm:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* [우측] 데스크톱 메뉴 */}
        <div className="hidden lg:flex items-center gap-10">
          <nav>
            <ul className="flex items-center gap-10 text-[15px] font-medium text-slate-700 tracking-tight">
              <li>
                <Link href="/activities" className="hover:text-green-700 transition">
                  정기 모임
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-green-700 transition">
                  장비 후기
                </Link>
              </li>
              <li>
                <Link href="/past-activities" className="hover:text-green-700 transition">
                  지난 활동
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-green-700 transition">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-green-700 transition">
                  지원하기
                </Link>
              </li>
              <li>
                <Link href="/minigame" className="hover:text-green-700 transition">
                  미니게임
                </Link>
              </li>
            </ul>
          </nav>
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                aria-label="프로필 메뉴"
                className="w-10 h-10 rounded-full bg-[#4B7332] text-white font-bold text-[15px] flex items-center justify-center shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                {initial}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-5 py-4 bg-slate-50 border-b border-gray-100">
                    <p className="text-[15px] font-black text-slate-800 truncate">{user.name}</p>
                    {user.email && (
                      <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 border-2 border-slate-300 rounded-full text-[15px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>

        {/* [우측] 모바일 햄버거 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-slate-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="max-w-screen-2xl mx-auto px-5 py-4 space-y-1">
            {[
              { href: "/activities", label: "정기 모임" },
              { href: "/reviews", label: "장비 후기" },
              { href: "/past-activities", label: "지난 활동" },
              { href: "/faq", label: "문의하기" },
              { href: "/apply", label: "지원하기" },
              { href: "/minigame", label: "미니게임" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="mx-4 mt-3 mb-2 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-[#4B7332] text-white font-bold text-[15px] flex items-center justify-center shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                    {user.email && (
                      <p className="text-xs font-medium text-slate-400 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-6 py-2.5 border-2 border-slate-300 rounded-full text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block mx-4 mt-3 mb-2 text-center px-6 py-2.5 border-2 border-slate-300 rounded-full text-[15px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
