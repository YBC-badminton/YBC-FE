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
    // TODO: API call
    alert('저장되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">면접 관리</h1>
        <p className="text-gray-500 mt-1">면접 시간을 배정하고 결과를 입력하세요.</p>
      </div>

      {/* 현황 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">전체 면접자</p>
          <p className="text-3xl font-bold text-gray-800">{totalCount}명</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">합격</p>
          <p className="text-3xl font-bold text-blue-600">{passCount}명</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">불합격</p>
          <p className="text-3xl font-bold text-red-600">{failCount}명</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">보류</p>
          <p className="text-3xl font-bold text-orange-500">{holdCount}명</p>
        </div>
      </div>

      {/* 면접자 테이블 */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
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

      {/* 저장 버튼 */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
