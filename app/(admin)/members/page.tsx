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
        <div className="max-w-6xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">부원 명단</h1>
            <p className="text-gray-500">동아리 부원 정보를 관리하세요.</p>
        </div>

        {/* 상단 현황 카드 (코트별 인원) */}
        <div className="grid grid-cols-5 gap-4 mb-8">
            {[
            { label: '전체 부원', count: '5명', color: 'text-gray-800' },
            { label: '1코트', count: '2명', color: 'text-red-500' },
            { label: '2코트', count: '1명', color: 'text-orange-500' },
            { label: '3코트', count: '1명', color: 'text-blue-500' },
            { label: '4코트', count: '1명', color: 'text-green-500' },
            ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            </div>
            ))}
        </div>

        {/* 검색 및 액션 바 */}
        <div className="flex justify-between mb-6">
            <div className="relative w-96">
            <input 
                type="text" 
                placeholder="이름 또는 학교로 검색" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            + 부원 추가
            </button>
        </div>

        {/* 부원 명단 테이블 */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
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
                    <button className="text-gray-400 hover:text-blue-600">✏️</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
    }
