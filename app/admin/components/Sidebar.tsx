'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// [수정 포인트] 성재님의 아이콘 파일 경로(예: /images/icons/...)로 이름을 맞춰주세요.
const menuItems = [
    { name: '지원자 조회', href: '/admin/applicants', icon: 'applicants' },
    { name: '면접 관리', href: '/admin/interviews', icon: 'interviews' },
    { name: '부원 명단', href: '/admin/members', icon: 'members' },
    { name: '투표 예약', href: '/admin/reservations', icon: 'reservations' },
    { name: '투표 예약 현황', href: '/admin/votes', icon: 'votes_status' },
    { name: '모집 일정', href: '/admin/recruitment', icon: 'recruitment' },
    { name: '대진 관리', href: '/admin/tournament', icon: 'tournament' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

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
                    {/* 스타일 타이틀 */}
                    <h2 className="text-xl font-black text-[#1D2B41] tracking-tighter">
                        관리자 페이지
                    </h2>
                    {/* 모바일용 닫기 버튼 */}
                    <button onClick={onClose} className="lg:hidden text-gray-400 p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="space-y-4">
                    {menuItems.map((item) => {
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
                                        className={`w-5 h-5 object-contain transition-opacity duration-300 ${
                                            isActive ? 'opacity-100' : 'opacity-100'
                                        }`}
                                    />
                                </div>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}