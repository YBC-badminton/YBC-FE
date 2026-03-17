'use client';

import React, { useState } from 'react';

interface Applicant {
  id: number;
  name: string;
  gender: '남' | '여';
  age: number;
  school: string;
  major: string;
  phone: string;
  appliedDate: string;
  firstPass: boolean;
  finalPass: boolean;
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([
    { id: 1, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false },
    { id: 2, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false },
    { id: 3, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false },
    { id: 4, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false },
    { id: 5, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredApplicants = applicants.filter(
    (a) =>
      a.name.includes(searchQuery) ||
      a.school.includes(searchQuery) ||
      a.major.includes(searchQuery)
  );

  const totalCount = filteredApplicants.length;
  const firstPassCount = filteredApplicants.filter((a) => a.firstPass).length;
  const finalPassCount = filteredApplicants.filter((a) => a.finalPass).length;

  const handleCheckbox = (id: number, field: 'firstPass' | 'finalPass') => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: !a[field] } : a))
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 underline underline-offset-4">지원자 조회</h1>
        <p className="text-gray-500 mt-1">지원자를 확인하고 1차 및 최종 합격자를 선택하세요.</p>
      </div>

      {/* 검색 바 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="이름 또는 학교로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
        </button>
      </div>

      {/* 현황 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">전체 지원자</p>
          <p className="text-3xl font-bold text-gray-800">{totalCount}명</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">1차 합격</p>
          <p className="text-3xl font-bold text-green-600">{firstPassCount}명</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">최종 합격</p>
          <p className="text-3xl font-bold text-green-600">{finalPassCount}명</p>
        </div>
      </div>

      {/* 지원자 테이블 */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 text-gray-400 text-sm">
            <tr>
              <th className="p-4 font-medium">이름</th>
              <th className="p-4 font-medium">성별</th>
              <th className="p-4 font-medium">나이</th>
              <th className="p-4 font-medium">학교/학과</th>
              <th className="p-4 font-medium">연락처</th>
              <th className="p-4 font-medium">지원일</th>
              <th className="p-4 font-medium text-center">1차 합격</th>
              <th className="p-4 font-medium text-center">최종 합격</th>
              <th className="p-4 font-medium text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredApplicants.map((applicant) => (
              <React.Fragment key={applicant.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{applicant.name}</td>
                  <td className="p-4">{applicant.gender}</td>
                  <td className="p-4">{applicant.age}세</td>
                  <td className="p-4">
                    <div>{applicant.school}</div>
                    <div className="text-sm text-gray-400">{applicant.major}</div>
                  </td>
                  <td className="p-4">{applicant.phone}</td>
                  <td className="p-4">{applicant.appliedDate}</td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={applicant.firstPass}
                      onChange={() => handleCheckbox(applicant.id, 'firstPass')}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={applicant.finalPass}
                      onChange={() => handleCheckbox(applicant.id, 'finalPass')}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setExpandedId(expandedId === applicant.id ? null : applicant.id)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-800 transition flex items-center gap-1 mx-auto"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className={`transition-transform ${expandedId === applicant.id ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                      펼치기
                    </button>
                  </td>
                </tr>
                {expandedId === applicant.id && (
                  <tr>
                    <td colSpan={9} className="bg-gray-50 p-6">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-800 mb-2">상세 정보</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-400">이름:</span> {applicant.name}
                          </div>
                          <div>
                            <span className="text-gray-400">성별:</span> {applicant.gender}
                          </div>
                          <div>
                            <span className="text-gray-400">나이:</span> {applicant.age}세
                          </div>
                          <div>
                            <span className="text-gray-400">학교/학과:</span> {applicant.school} {applicant.major}
                          </div>
                          <div>
                            <span className="text-gray-400">연락처:</span> {applicant.phone}
                          </div>
                          <div>
                            <span className="text-gray-400">지원일:</span> {applicant.appliedDate}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
