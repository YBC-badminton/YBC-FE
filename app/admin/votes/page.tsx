'use client';

import React, { useState, useEffect } from 'react';

// 투표 데이터 타입 정의
interface VoteForm {
    day: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    voteStart: string;
    voteEnd: string;
}

export default function VoteReservationPage() {
  // 1. 정기활동 및 기타활동 폼 상태 관리
    const [regularForm, setRegularForm] = useState<VoteForm>({
        day: '', title: '정기활동', date: '', startTime: '', endTime: '', location: '', voteStart: '', voteEnd: ''
    });
    const [extraForm, setExtraForm] = useState<VoteForm>({
        day: '', title: '', date: '', startTime: '', endTime: '', location: '', voteStart: '', voteEnd: ''
    });

    // 2. 예약 대기열 상태 (백엔드 연동용)
    const [reservationQueue, setReservationQueue] = useState<any[]>([]);

    // 3. 백엔드로 데이터 전송 함수
    const handleReserve = async (type: 'regular' | 'extra') => {
        const data = type === 'regular' ? regularForm : extraForm;
        
        // 유효성 검사 예시
        if (!data.date || !data.title) {
        alert('날짜와 제목은 필수 입력 사항입니다.');
        return;
        }

        try {
        // 실제 구현 시 백엔드 엔드포인트 주소로 변경 필요
        const response = await fetch('/api/admin/votes/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, type }),
        });

        if (response.ok) {
            alert(`${type === 'regular' ? '정기활동' : '기타활동'} 투표 예약이 성공했습니다!`);
            // 성공 시 폼 초기화 로직 등을 추가할 수 있습니다.
        }
        } catch (error) {
        console.error('서버 전송 오류:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
        {/* 상단 헤더 */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">투표 예약</h1>
            <p className="text-gray-500 text-sm">정기활동 및 특별활동 투표를 예약하세요.</p>
        </div>

        {/* 폼 섹션 (좌우 배치) */}
        <div className="grid grid-cols-2 gap-8 mb-10">
            {/* 왼쪽: 정기활동 투표 예약 */}
            <VoteFormCard 
            title="정기활동 투표 예약" 
            formData={regularForm} 
            setFormData={setRegularForm} 
            onSubmit={() => handleReserve('regular')}
            buttonColor="bg-blue-600 hover:bg-blue-700"
            />

            {/* 오른쪽: 정기활동 외 다른날 투표 예약 */}
            <VoteFormCard 
            title="정기활동 외 다른날 투표 예약" 
            formData={extraForm} 
            setFormData={setExtraForm} 
            onSubmit={() => handleReserve('extra')}
            buttonColor="bg-green-600 hover:bg-green-700"
            />
        </div>

        {/* 하단: 투표 예약 대기열 섹션 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-lg font-bold mb-6">투표 예약 대기열</h3>
            <div className="border border-dashed border-gray-200 rounded-lg p-10 text-center">
            {/* 데이터가 없을 때의 UI */}
            <div className="flex flex-col items-center text-gray-400">
                <span className="text-3xl mb-2">📋</span>
                <p className="text-sm italic">현재 예약된 투표가 없습니다. 백엔드 서버에서 정보를 불러올 예정입니다.</p>
            </div>
            </div>
        </div>
        </div>
    );
    }

    // 재사용 가능한 폼 카드 컴포넌트
    function VoteFormCard({ title, formData, setFormData, onSubmit, buttonColor }: any) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-6 text-gray-800">{title}</h2>
        <div className="space-y-4">
            {/* 요일 및 제목 */}
            <div className="flex gap-4">
            <InputGroup label="요일" name="day" value={formData.day} onChange={handleChange} placeholder="예: 화요일" />
            <InputGroup label="제목" name="title" value={formData.title} onChange={handleChange} placeholder="예: 정기활동" />
            </div>
            {/* 날짜 */}
            <InputGroup label="날짜" name="date" type="date" value={formData.date} onChange={handleChange} />
            {/* 운동 시간 */}
            <div className="flex gap-4">
            <InputGroup label="운동 시작 시간" name="startTime" type="time" value={formData.startTime} onChange={handleChange} />
            <InputGroup label="운동 종료 시간" name="endTime" type="time" value={formData.endTime} onChange={handleChange} />
            </div>
            {/* 장소 */}
            <InputGroup label="장소" name="location" value={formData.location} onChange={handleChange} placeholder="예: 올림픽공원 체육관" />
            {/* 투표 기간 */}
            <div className="flex gap-4 pt-2">
            <InputGroup label="투표 시작" name="voteStart" type="datetime-local" value={formData.voteStart} onChange={handleChange} />
            <InputGroup label="투표 종료" name="voteEnd" type="datetime-local" value={formData.voteEnd} onChange={handleChange} />
            </div>
            {/* 전송 버튼 */}
            <button 
            onClick={onSubmit}
            className={`w-full py-3 mt-4 text-white rounded-lg font-bold transition ${buttonColor}`}
            >
            투표 예약하기
            </button>
        </div>
        </div>
    );
    }

    // 개별 입력 필드 그룹 컴포넌트
    function InputGroup({ label, ...props }: any) {
    return (
        <div className="flex-1">
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input 
            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            {...props}
        />
        </div>
    );
}