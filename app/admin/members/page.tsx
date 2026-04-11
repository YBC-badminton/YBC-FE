'use client';

import React, { useState } from 'react';

// 부원 데이터 타입 정의
interface Member {
    id: number;
    name: string;
    age: number;
    school: string;
    phone: string;
    generation: number;
    court: string;
}

export default function AdminMainPage() {
    // 샘플 데이터 (기획안 기반)
    const [members] = useState<Member[]>([
        { id: 1, name: '김철수', age: 23, school: '서울대학교', phone: '010-1234-5678', generation: 5, court: '1코트' },
        { id: 2, name: '이영희', age: 21, school: '연세대학교', phone: '010-2345-6789', generation: 6, court: '2코트' },
        { id: 3, name: '박민수', age: 24, school: '고려대학교', phone: '010-3456-7890', generation: 4, court: '1코트' },
        { id: 4, name: '최지현', age: 22, school: '한양대학교', phone: '010-4567-8901', generation: 6, court: '3코트' },
        { id: 5, name: '정수민', age: 20, school: '서울대학교', phone: '010-5678-9012', generation: 7, court: '4코트' },
    ]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* 헤더 섹션 */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">부원 명단</h1>
                <p className="text-sm text-gray-500 mt-1">동아리 부원 정보를 관리하세요.</p>
            </div>

            {/* 상단 현황 카드 - [수정] 모바일 2열(grid-cols-2), 데스크탑 5열(lg:grid-cols-5) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                {[
                    { label: '전체 부원', count: '5명', color: 'text-gray-800' },
                    { label: '1코트', count: '2명', color: 'text-red-500' },
                    { label: '2코트', count: '1명', color: 'text-orange-500' },
                    { label: '3코트', count: '1명', color: 'text-blue-500' },
                    { label: '4코트', count: '1명', color: 'text-green-500' },
                ].map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left
                            ${idx === 0 ? 'col-span-2 lg:col-span-1' : 'col-span-1'}
                        `}
                    >
                        <p className="text-[10px] sm:text-sm text-gray-500 mb-1 whitespace-nowrap">{item.label}</p>
                        <p className={`text-lg sm:text-2xl font-bold ${item.color}`}>{item.count}</p>
                    </div>
                ))}
            </div>

            {/* 검색 및 액션 바 */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                    <input 
                        type="text" 
                        placeholder="이름 또는 학교로 검색" 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
                <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-md active:scale-95 text-sm">
                    + 부원 추가
                </button>
            </div>

            {/* 데스크탑 전용 테이블 (lg 이상) */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-sm uppercase font-bold">
                        <tr>
                            <th className="p-4 font-medium">이름</th>
                            <th className="p-4 font-medium">나이</th>
                            <th className="p-4 font-medium">학교</th>
                            <th className="p-4 font-medium">전화번호</th>
                            <th className="p-4 font-medium">기수</th>
                            <th className="p-4 font-medium">실력</th>
                            <th className="p-4 font-medium text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-900">{member.name}</td>
                                <td className="p-4">{member.age}세</td>
                                <td className="p-4">{member.school}</td>
                                <td className="p-4">{member.phone}</td>
                                <td className="p-4">{member.generation}기</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        member.court === '1코트' ? 'bg-red-50 text-red-500' :
                                        member.court === '2코트' ? 'bg-orange-50 text-orange-500' :
                                        member.court === '3코트' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                                    }`}>
                                        {member.court}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button className="text-gray-400 hover:text-blue-600 text-xl">✏️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 전용 카드 리스트 (lg 미만) */}
            <div className="lg:hidden space-y-4">
                {members.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[60%]">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{member.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 truncate">{member.school}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap ${
                                    member.court === '1코트' ? 'bg-red-50 text-red-500' :
                                    member.court === '2코트' ? 'bg-orange-50 text-orange-500' :
                                    member.court === '3코트' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                                }`}>
                                    {member.court}
                                </span>
                                <button className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
                                    <span className="text-xs">✏️</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t pt-4">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">기수/나이</p>
                                <p className="font-medium text-gray-700">{member.generation}기 · {member.age}세</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">전화번호</p>
                                <p className="font-medium text-gray-700 text-xs tabular-nums">{member.phone}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}