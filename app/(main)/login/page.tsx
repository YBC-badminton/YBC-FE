'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

// type LoginTab = 'member' | 'admin' | 'applicant';

export default function LoginPage() {
    const { error } = useAuth();

    // TODO: 관리자/지원자 로그인 탭이 필요할 경우 아래 주석 해제
    // const [activeTab, setActiveTab] = useState<LoginTab>('member');
    // const { clearError } = useAuth();
    // const handleTabChange = (tab: LoginTab) => {
    //     clearError();
    //     setActiveTab(tab);
    // };

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-12">

                {/* 헤더 */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800">로그인</h1>
                    <p className="text-slate-400 font-bold">양배추 배드민턴 동아리에 오신 것을 환영합니다.</p>
                </div>

                {/* 로그인 카드 */}
                <div className="max-w-md mx-auto space-y-6">

                    {/* TODO: 관리자/지원자 로그인 탭이 필요할 경우 아래 주석 해제 */}
                    {/* <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        {([
                            { key: 'member', label: '회원 로그인' },
                            { key: 'admin', label: '관리자' },
                            { key: 'applicant', label: '지원자 조회' },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === tab.key
                                        ? 'bg-[#4B7332] text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div> */}

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* 회원 로그인만 활성화 */}
                    <MemberLogin />

                    {/* TODO: 관리자/지원자 로그인이 필요할 경우 아래 주석 해제 */}
                    {/* {activeTab === 'admin' && <AdminLogin />} */}
                    {/* {activeTab === 'applicant' && <ApplicantLogin />} */}
                </div>
            </div>
        </div>
    );
}

// --- 1. 회원 로그인 (카카오) ---
function MemberLogin() {
    const { loginKakao, isLoading } = useAuth();

    const handleKakaoLogin = async () => {
        try {
            await loginKakao();
        } catch {
            // 에러는 AuthContext에서 처리
        }
    };

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#F2F8E1] rounded-full flex items-center justify-center mx-auto border border-[#E2EBC8]">
                    <svg className="w-8 h-8 text-[#4B7332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-slate-800">클럽 회원 전용</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    동아리 회원은 카카오 계정으로 로그인해 주세요.
                </p>
            </div>

            <button
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] font-bold py-4 rounded-2xl hover:brightness-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.74 4.93 4.36 6.24-.14.52-.9 3.37-.93 3.58 0 0-.02.17.09.23.11.07.23.03.23.03.31-.04 3.56-2.33 4.12-2.73.7.1 1.42.15 2.13.15 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
                </svg>
                {isLoading ? '로그인 중...' : '카카오로 로그인'}
            </button>

            <p className="text-center text-xs text-slate-300 font-bold">
                카카오톡에 등록된 정보로 자동 로그인됩니다
            </p>
        </div>
    );
}

// --- 2. 관리자 로그인 ---
// TODO: 관리자 로그인이 필요할 경우 주석 해제
// function AdminLogin() {
//     const { loginAdmin, isLoading } = useAuth();
//     const router = useRouter();
//     const [id, setId] = useState('');
//     const [password, setPassword] = useState('');
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!id || !password) return;
//         try {
//             await loginAdmin(id, password);
//             router.push('/applicants');
//         } catch {
//             // 에러는 AuthContext에서 처리
//         }
//     };
//
//     return (
//         <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
//             <div className="text-center space-y-2">
//                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
//                     <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                     </svg>
//                 </div>
//                 <h2 className="text-xl font-black text-slate-800">관리자 로그인</h2>
//                 <p className="text-sm text-slate-400 font-medium">운영진 전용 계정으로 로그인해 주세요.</p>
//             </div>
//
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                     <label className="text-sm font-bold text-slate-600">아이디</label>
//                     <input
//                         type="text"
//                         value={id}
//                         onChange={e => setId(e.target.value)}
//                         placeholder="관리자 아이디"
//                         className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
//                     />
//                 </div>
//                 <div className="space-y-2">
//                     <label className="text-sm font-bold text-slate-600">비밀번호</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={e => setPassword(e.target.value)}
//                         placeholder="비밀번호"
//                         className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
//                     />
//                 </div>
//                 <button
//                     type="submit"
//                     disabled={isLoading || !id || !password}
//                     className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     {isLoading ? '로그인 중...' : '로그인'}
//                 </button>
//             </form>
//         </div>
//     );
// }

// --- 3. 지원자 조회 ---
// TODO: 지원자 조회가 필요할 경우 주석 해제
// function ApplicantLogin() {
//     const { loginApplicant, isLoading } = useAuth();
//     const [name, setName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [isVerified, setIsVerified] = useState(false);
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!name || !phone) return;
//         try {
//             await loginApplicant(name, phone);
//             setIsVerified(true);
//         } catch {
//             // 에러는 AuthContext에서 처리
//         }
//     };
//
//     if (isVerified) {
//         return (
//             <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6 text-center">
//                 <div className="w-16 h-16 bg-[#F2F8E1] rounded-full flex items-center justify-center mx-auto border border-[#E2EBC8]">
//                     <svg className="w-8 h-8 text-[#4B7332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
//                     </svg>
//                 </div>
//                 <h2 className="text-xl font-black text-slate-800">지원서 확인 완료</h2>
//                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
//                     <span className="text-slate-700 font-bold">{name}</span>님의 지원서가 확인되었습니다.<br />
//                     면접 일정은 별도로 안내드리겠습니다.
//                 </p>
//                 <Link href="/">
//                     <button className="mt-2 bg-[#4B7332] text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#3d5d28] transition-all duration-300">
//                         홈으로 돌아가기
//                     </button>
//                 </Link>
//             </div>
//         );
//     }
//
//     return (
//         <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
//             <div className="text-center space-y-2">
//                 <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
//                     <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                 </div>
//                 <h2 className="text-xl font-black text-slate-800">지원서 조회</h2>
//                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
//                     지원 시 입력한 이름과 전화번호로<br />제출한 지원서를 확인할 수 있습니다.
//                 </p>
//             </div>
//
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                     <label className="text-sm font-bold text-slate-600">이름</label>
//                     <input
//                         type="text"
//                         value={name}
//                         onChange={e => setName(e.target.value)}
//                         placeholder="지원서에 입력한 성함"
//                         className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
//                     />
//                 </div>
//                 <div className="space-y-2">
//                     <label className="text-sm font-bold text-slate-600">전화번호</label>
//                     <input
//                         type="tel"
//                         value={phone}
//                         onChange={e => setPhone(e.target.value)}
//                         placeholder="010-1234-5678"
//                         className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
//                     />
//                 </div>
//                 <button
//                     type="submit"
//                     disabled={isLoading || !name || !phone}
//                     className="w-full bg-amber-500 text-white font-bold py-4 rounded-2xl hover:bg-amber-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     {isLoading ? '조회 중...' : '지원서 조회하기'}
//                 </button>
//             </form>
//
//             <p className="text-center text-xs text-slate-300 font-bold">
//                 아직 지원하지 않으셨나요? <Link href="/apply" className="text-[#4B7332] hover:underline">지원하기</Link>
//             </p>
//         </div>
//     );
// }
