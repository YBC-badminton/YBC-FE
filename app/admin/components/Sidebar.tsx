'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItem = { name: string; href: string; icon: string };

// 운영 관리 메뉴 (지원/면접/투표 등 일상 운영 기능)
const operationItems: MenuItem[] = [
    { name: '지원자 조회', href: '/admin/applicants', icon: 'applicants' },
    { name: '면접 관리', href: '/admin/interviews', icon: 'interviews' },
    { name: '부원 명단', href: '/admin/members', icon: 'members' },
    { name: '투표 예약', href: '/admin/reservations', icon: 'reservations' },
    { name: '투표 예약 현황', href: '/admin/votes', icon: 'votes_status' },
    { name: '모집 일정', href: '/admin/recruitment', icon: 'recruitment' },
    { name: '대진 관리', href: '/admin/tournament', icon: 'tournament' },
];

// 사이트 관리 메뉴 (방문자에게 보이는 페이지 콘텐츠 편집)
const siteItems: MenuItem[] = [
    { name: '메인페이지 관리', href: '/admin/home', icon: 'home' },
    { name: '지난 활동 관리', href: '/admin/activities', icon: 'activities' },
    { name: '문의하기 관리', href: '/admin/faq', icon: 'faq' },
    { name: '개인정보 처리방침', href: '/admin/privacy', icon: 'privacy' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    const renderItem = (item: MenuItem) => {
        const isActive = pathname === item.href;
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                /* 디자인 적용 핵심 클래스 */
                className={`
                    flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-colors
                    active:scale-[0.98]

                    ${isActive
                      ? 'bg-[#E3F2FD] text-[#007BFF] font-bold shadow-sm' // 활성화 상태
                      : 'text-[#4A5568] hover:bg-slate-50 font-medium' // 비활성화 상태
                    }
                `}
            >
                {/* [수정 포인트] 아이콘 파일 적용 영역 */}
                <div className="w-6 h-6 flex items-center justify-center relative">
                    <img
                        /* [핵심] 활성화 여부에 따라 _active 파일로 교체 */
                        src={`/images/icons/${item.icon}${isActive ? '_active' : ''}.svg`}
                        alt={item.name}
                        className="w-5 h-5 object-contain transition-opacity duration-300"
                    />
                </div>
                {item.name}
            </Link>
        );
    };

    return (
        <>
            {/* 모바일 배경 어둡게 (로직 유지) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[45] bg-black/20 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                /* 디자인 및 너비 유지 */
                w-60 bg-white p-6
                flex flex-col

                /* [핵심] 기존 고정 및 반응형 스크롤 로직 유지 */
                fixed top-0 bottom-0 left-0 z-[50]
                h-screen overflow-y-auto

                /* 데스크탑에서 레이아웃 위치 고정 */
                lg:sticky lg:translate-x-0

                /* 모바일 슬라이드 애니메이션 유지 */
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center mb-12 px-1">
                    {/* 메인 페이지로 돌아가는 로고 링크 */}
                    <Link
                        href="/"
                        onClick={onClose}
                        aria-label="메인 페이지로"
                        className="flex items-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <img
                            src="/images/logo.png"
                            alt="YBC Logo"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>
                    {/* 모바일용 닫기 버튼 */}
                    <button onClick={onClose} className="lg:hidden text-gray-400 p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 운영 관리 메뉴 */}
                <nav className="space-y-4">
                    {operationItems.map(renderItem)}
                </nav>

                {/* 사이트 관리 메뉴 (하단 고정, 소제목으로 구분) */}
                <div className="mt-auto pt-8 border-t border-slate-100">
                    <p className="px-4 mb-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        사이트 관리
                    </p>
                    <nav className="space-y-4">
                        {siteItems.map(renderItem)}
                    </nav>
                </div>
            </aside>
        </>
    );
}
