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

  // 아코디언 상태 관리를 위한 상태 (열려있는 카드의 ID 저장)
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const toggleAccordion = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-left">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">면접 관리</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">면접 시간을 배정하고 결과를 입력하세요.</p>
      </div>

      {/* 현황 카드 레이아웃 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 font-black">
        <div className="col-span-3 sm:col-span-1 bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">전체</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{totalCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">합격</p>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{passCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">불합격</p>
          <p className="text-xl sm:text-3xl font-bold text-red-600">{failCount}명</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">보류</p>
          <p className="text-xl sm:text-3xl font-bold text-orange-500">{holdCount}명</p>
        </div>
      </div>

      {/* 데스크탑 전용 테이블 (lg 이상) */}
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
          <tbody className="divide-y divide-gray-100 text-gray-700 font-bold">
            {interviewees.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-900">{person.name}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    {person.availableTimes.map((time, idx) => (
                      <span key={idx} className="text-sm text-blue-600 flex items-center gap-1 font-medium">
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
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold bg-white"
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
                    className={`px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${resultColor(person.result)}`}
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
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full font-medium"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 전용 카드 리스트 (아코디언 적용) */}
      <div className="lg:hidden space-y-4">
        {interviewees.map((person) => (
          <div key={person.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left transition-all">
            {/* 아코디언 헤더 (항상 노출) */}
            <div 
              className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-50"
              onClick={() => toggleAccordion(person.id)}
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${resultColor(person.result)}`}>
                  {person.result}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === person.id ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* 아코디언 바디 (펼쳐질 때만 노출) */}
            <div className={`transition-all duration-300 ease-in-out ${expandedId === person.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-gray-50/50`}>
              <div className="p-5 pt-0 space-y-4">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">가능 시간대</p>
                  <div className="flex flex-wrap gap-2">
                    {person.availableTimes.map((time, idx) => (
                      <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-bold border border-blue-100">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3"> 
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">배정 시간</p>
                    <select
                      value={person.assignedTime}
                      onChange={(e) => updateField(person.id, 'assignedTime', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                      style={{ appearance: 'auto', WebkitAppearance: 'menulist' }} 
                    >
                      <option value="미정">미정</option>
                      {person.availableTimes.map((time, idx) => (
                        <option key={idx} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">결과 입력</p>
                    <select
                      value={person.result}
                      onChange={(e) => updateField(person.id, 'result', e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none ${resultColor(person.result)}`}
                      style={{ appearance: 'auto', WebkitAppearance: 'menulist' }}
                    >
                      <option value="미정">미정</option>
                      <option value="합격">합격</option>
                      <option value="불합격">불합격</option>
                      <option value="보류">보류</option>
                    </select>
                  </div>
                </div>

                <div className="pb-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">비고</p>
                  <input
                    type="text"
                    value={person.note}
                    onChange={(e) => updateField(person.id, 'note', e.target.value)}
                    placeholder="비고 입력"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end mt-8 pb-10">
        <button
          onClick={handleSave}
          className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}