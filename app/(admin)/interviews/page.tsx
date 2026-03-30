'use client';

import React, { useState } from 'react';

interface Interviewee {
  id: number;
  name: string;
  availableTimes: string[];
  assignedTime: string;
  result: '미정' | '합격' | '불합격' | '보류';
  note: string;
}

export default function InterviewsPage() {
  const [interviewees, setInterviewees] = useState<Interviewee[]>([
    { id: 1, name: '김철수', availableTimes: ['14:30-15:30', '15:30-16:30'], assignedTime: '미정', result: '합격', note: '' },
    { id: 2, name: '김철수', availableTimes: ['14:30-15:30', '15:30-16:30'], assignedTime: '미정', result: '미정', note: '' },
    { id: 3, name: '김철수', availableTimes: ['14:30-15:30', '15:30-16:30'], assignedTime: '미정', result: '미정', note: '' },
    { id: 4, name: '김철수', availableTimes: ['14:30-15:30', '15:30-16:30'], assignedTime: '미정', result: '미정', note: '' },
  ]);

  const totalCount = interviewees.length;
  const passCount = interviewees.filter((i) => i.result === '합격').length;
  const failCount = interviewees.filter((i) => i.result === '불합격').length;
  const holdCount = interviewees.filter((i) => i.result === '보류').length;

  const updateField = (id: number, field: keyof Interviewee, value: string) => {
    setInterviewees((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const resultColor = (result: string) => {
    switch (result) {
      case '합격': return 'bg-green-50 text-green-600 border-green-200';
      case '불합격': return 'bg-red-50 text-red-600 border-red-200';
      case '보류': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default: return 'bg-white text-gray-600 border-gray-200';
    }
  };

  const handleSave = () => {
    alert('저장되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">면접 관리</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">면접 시간을 배정하고 결과를 입력하세요.</p>
      </div>

      {/* 현황 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">전체</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{totalCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">합격</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{passCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">불합격</p>
          <p className="text-xl sm:text-3xl font-bold text-red-600">{failCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">보류</p>
          <p className="text-xl sm:text-3xl font-bold text-orange-500">{holdCount}명</p>
        </div>
      </div>

      {/* 데스크탑 테이블 (lg 이상) */}
      <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm">
            <tr>
              <th className="p-4 font-medium">면접자</th>
              <th className="p-4 font-medium">가능 시간대</th>
              <th className="p-4 font-medium text-center">배정 시간</th>
              <th className="p-4 font-medium text-center">결과</th>
              <th className="p-4 font-medium text-center">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {interviewees.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-900">{person.name}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    {person.availableTimes.map((time, idx) => (
                      <span key={idx} className="text-sm text-blue-600 flex items-center gap-1">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {time}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <select
                    value={person.assignedTime}
                    onChange={(e) => updateField(person.id, 'assignedTime', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="미정">미정</option>
                    {person.availableTimes.map((time, idx) => (
                      <option key={idx} value={time}>{time}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-center">
                  <select
                    value={person.result}
                    onChange={(e) => updateField(person.id, 'result', e.target.value)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${resultColor(person.result)}`}
                  >
                    <option value="미정">미정</option>
                    <option value="합격">합격</option>
                    <option value="불합격">불합격</option>
                    <option value="보류">보류</option>
                  </select>
                </td>
                <td className="p-4 text-center">
                  <input
                    type="text"
                    value={person.note}
                    onChange={(e) => updateField(person.id, 'note', e.target.value)}
                    placeholder="비고 입력"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 전용 카드 리스트 (lg 미만) */}
      <div className="lg:hidden space-y-4">
        {interviewees.map((person) => (
          <div key={person.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${resultColor(person.result)}`}>
                {person.result}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">가능 시간대</p>
                <div className="flex flex-wrap gap-2">
                  {person.availableTimes.map((time, idx) => (
                    <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* [중요] 390x844 모바일 옵션 위치 오류 수정 영역 */}
              <div className="grid grid-cols-2 gap-3 relative"> 
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">배정 시간</p>
                  <select
                    value={person.assignedTime}
                    onChange={(e) => updateField(person.id, 'assignedTime', e.target.value)}
                    /* z-index와 appearance를 조절하여 옵션 창이 상자 바로 아래 뜨도록 수정 */
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer relative z-20"
                    style={{ appearance: 'auto', WebkitAppearance: 'menulist' }} 
                  >
                    <option value="미정">미정</option>
                    {person.availableTimes.map((time, idx) => (
                      <option key={idx} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">결과</p>
                  <select
                    value={person.result}
                    onChange={(e) => updateField(person.id, 'result', e.target.value)}
                    /* 기존 resultColor 디자인을 유지하면서 옵션 위치만 잡음 */
                    className={`w-full px-3 py-2.5 border rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer relative z-20 ${resultColor(person.result)}`}
                    style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}
                  >
                    <option value="미정">미정</option>
                    <option value="합격">합격</option>
                    <option value="불합격">불합격</option>
                    <option value="보류">보류</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">비고</p>
                <input
                  type="text"
                  value={person.note}
                  onChange={(e) => updateField(person.id, 'note', e.target.value)}
                  placeholder="비고 입력"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end mt-8 pb-10">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}