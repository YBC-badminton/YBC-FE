// app/admin/layout.tsx
import Sidebar from './components/Sidebar';

export default function AdminLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <div className="flex">
        {/* 고정 사이드바 */}
        <Sidebar />
        
        {/* 페이지 콘텐츠 영역 */}
        <main className="flex-1 bg-gray-50 p-8">
            {children}
        </main>
        </div>
    );
}