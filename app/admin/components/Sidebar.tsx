// app/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: '지원자 조회', href: '/admin/applicants', icon: '👥' },
    { name: '면접 관리', href: '/admin/interviews', icon: '📅' },
    { name: '부원 명단', href: '/admin/members', icon: '👤' },
    { name: '투표 예약', href: '/admin/votes', icon: '🗳️' },
    { name: '투표 예약 현황', href: '/admin/votes/status', icon: '✅' },
    { name: '대진 관리', href: '/admin/tournament', icon: '📊' },
];

export default function Sidebar() {
    const pathname = usePathname(); // 현재 어떤 페이지에 있는지 확인

    return (
        <aside className="w-64 bg-white border-r min-h-screen p-4">
        <h2 className="text-xl font-bold mb-8 px-2 text-gray-800">관리자 페이지</h2>
        <nav className="space-y-1">
            {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 rounded-lg font-medium transition-colors ${
                    isActive 
                    ? 'bg-blue-50 text-blue-600' // 활성화된 메뉴 디자인
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                >
                <span className="mr-3">{item.icon}</span>
                {item.name}
                </Link>
            );
            })}
        </nav>
        </aside>
    );
    }