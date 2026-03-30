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
  // 상세 데이터 필드 추가
  timestamp: string;
  address: string;
  interviewTime: string;
  intro: string;
  reason: string;
  equipment: string;
  source: string;
  isAdminSupport: string;
  lastMessage: string;
}

export default function ApplicantsPage() {
    const [applicants, setApplicants] = useState<Applicant[]>([
    { 
      id: 1, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 2, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 3, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 4, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 5, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 6, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },
    { 
      id: 7, name: '김철수', gender: '남', age: 23, school: '서울대학교', major: '컴퓨터공학과', 
      phone: '010-1234-5678', appliedDate: '2026-03-01', firstPass: false, finalPass: false,
      timestamp: '2026-03-01 09:30:00',
      address: '서울 강남구',
      interviewTime: '3월 15일 14:00-17:00',
      intro: '안녕하세요! 배드민턴을 사랑하는 김철수입니다. 고등학교 때부터 배드민턴을 시작해서 5년째 즐기고 있습니다.',
      reason: '대학에 와서 함께 배드민턴을 칠 동아리를 찾고 있었는데, 양배추가 가장 활발하고 좋은 분위기라고 들어서 지원하게 되었습니다.',
      equipment: '요넥스 아스트록스 99, 배드민턴화(미즈노)',
      source: '학교 게시판',
      isAdminSupport: '아니오',
      lastMessage: '열심히 하겠습니다!'
    },

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 underline underline-offset-4">지원자 조회</h1>
        <p className="text-sm text-gray-500 mt-1">합격 여부를 선택해 주세요.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="이름 또는 학교 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition text-sm">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span className="sm:hidden">필터링</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
          <p className="text-[10px] sm:text-sm text-gray-400 mb-1">전체</p>
          <p className="text-lg sm:text-3xl font-bold text-gray-800">{totalCount}명</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
          <p className="text-[10px] sm:text-sm text-gray-400 mb-1">1차</p>
          <p className="text-lg sm:text-3xl font-bold text-green-600">{firstPassCount}명</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
          <p className="text-[10px] sm:text-sm text-gray-400 mb-1">최종</p>
          <p className="text-lg sm:text-3xl font-bold text-green-600">{finalPassCount}명</p>
        </div>
      </div>

      {/* 데스크탑 전용 테이블 */}
      <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 text-gray-400 text-sm">
            <tr>
              <th className="p-4 font-medium">이름</th>
              <th className="p-4 font-medium">성별/나이</th>
              <th className="p-4 font-medium">학교/학과</th>
              <th className="p-4 font-medium">연락처</th>
              <th className="p-4 font-medium">지원일</th>
              <th className="p-4 font-medium text-center">1차 합격</th>
              <th className="p-4 font-medium text-center">최종 합격</th>
              <th className="p-4 font-medium text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
            {filteredApplicants.map((applicant) => (
              <React.Fragment key={applicant.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-900">{applicant.name}</td>
                  <td className="p-4 text-sm">{applicant.gender} / {applicant.age}세</td>
                  <td className="p-4">
                    <div className="text-sm">{applicant.school}</div>
                    <div className="text-xs text-gray-400">{applicant.major}</div>
                  </td>
                  <td className="p-4 text-sm">{applicant.phone}</td>
                  <td className="p-4 text-sm">{applicant.appliedDate}</td>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={applicant.firstPass} onChange={() => handleCheckbox(applicant.id, 'firstPass')} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" checked={applicant.finalPass} onChange={() => handleCheckbox(applicant.id, 'finalPass')} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setExpandedId(expandedId === applicant.id ? null : applicant.id)} className="text-blue-600 text-sm hover:text-blue-800 transition flex items-center gap-1 mx-auto">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expandedId === applicant.id ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                  </td>
                </tr>
                {expandedId === applicant.id && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 p-8 border-t border-b border-gray-200/50 animate-in fade-in duration-300">
                      <DetailContent applicant={applicant} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 전용 카드 리스트 */}
      <div className="lg:hidden space-y-4">
        {filteredApplicants.map((applicant) => (
          <div key={applicant.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{applicant.name} <span className="text-xs font-normal text-gray-400 ml-1">{applicant.gender} / {applicant.age}세</span></h3>
                <p className="text-xs text-gray-500 mt-1">{applicant.school}</p>
              </div>
              <button onClick={() => setExpandedId(expandedId === applicant.id ? null : applicant.id)} className="p-1 text-gray-400">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expandedId === applicant.id ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </div>

            <div className="flex gap-2 mt-4 border-t pt-4">
              <label className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                <span className="text-[10px] text-gray-400 mb-1">1차 합격</span>
                <input type="checkbox" checked={applicant.firstPass} onChange={() => handleCheckbox(applicant.id, 'firstPass')} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              </label>
              <label className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                <span className="text-[10px] text-gray-400 mb-1">최종 합격</span>
                <input type="checkbox" checked={applicant.finalPass} onChange={() => handleCheckbox(applicant.id, 'finalPass')} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
              </label>
            </div>

            {expandedId === applicant.id && (
              <div className="mt-4 pt-6 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <DetailContent applicant={applicant} isMobile />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** [컴포넌트] 지원서 상세 정보 디자인 **/
function DetailContent({ applicant, isMobile = false }: { applicant: Applicant; isMobile?: boolean }) {
  return (
    <div className={`space-y-3 text-slate-700 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
      <h4 className="text-base font-bold text-slate-900 mb-6">지원서 상세 정보</h4>
      
      {/* 상단 섹션 */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-8'}`}>
        <InfoItem label="타임스탬프" value={applicant.timestamp} />
        <InfoItem label="거주지" value={applicant.address} />
        <InfoItem label="면접 가능 시간" value={applicant.interviewTime} />
      </div>

      <div className="border-t border-gray-200/60 pt-6 space-y-2">
        <InfoItem label="자기소개" value={applicant.intro} full />
        <InfoItem label="지원 동기" value={applicant.reason} full />
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-8'} border-t border-gray-200/60 pt-6`}>
        <InfoItem label="보유 장비" value={applicant.equipment} />
        <InfoItem label="알게 된 경로" value={applicant.source} />
      </div>

      <div className="border-t border-gray-200/60 pt-6">
        <InfoItem label="운영진 지원 여부" value={applicant.isAdminSupport} />
      </div>

      <div className="border-t border-gray-200/60 pt-6">
        <InfoItem label="마지막으로 하고 싶은 말" value={applicant.lastMessage} full />
      </div>
    </div>
  );
}

function InfoItem({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`${full ? 'col-span-full' : ''}`}>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-[14px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}