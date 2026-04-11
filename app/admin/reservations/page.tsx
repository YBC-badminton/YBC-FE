'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { useAxios } from '@/hooks/useAxios';

// 투표 데이터 타입 정의
interface VoteReservation {
    id?: string;
    type: 'regular' | 'extra';
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
    // 1. 커스텀 훅으로 대기열 데이터 가져오기 (GET)
    const { data: queue, loading, error, refetch } = useAxios<VoteReservation[]>('/api/admin/votes/queue');

    // 2. 폼 상태 관리
    const [regularForm, setRegularForm] = useState<VoteReservation>({
        type: 'regular', day: '', title: '정기활동', date: '', startTime: '', endTime: '', location: '', voteStart: '', voteEnd: ''
    });
    const [extraForm, setExtraForm] = useState<VoteReservation>({
        type: 'extra', day: '', title: '', date: '', startTime: '', endTime: '', location: '', voteStart: '', voteEnd: ''
    });

    // 3. 투표 예약 전송 (POST)
    const handleReserve = async (type: 'regular' | 'extra') => {
        const payload = type === 'regular' ? regularForm : extraForm;

        try {
        const response = await api.post('/api/admin/votes/reserve', payload);
        if (response.status === 200 || response.status === 201) {
            alert('투표 예약이 완료되었습니다!');
            refetch(); // 예약 성공 후 대기열 목록 새로고침
        }
        } catch (err) {
        alert('예약 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">투표 예약</h1>
                <p className="text-gray-500 text-sm">정기활동 및 특별활동 투표를 예약하세요.</p>
            </div>

            {/* 입력 폼 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <VoteFormCard 
                title="정기활동 투표 예약" 
                formData={regularForm} 
                setFormData={setRegularForm} 
                onSubmit={() => handleReserve('regular')}
                buttonColor="bg-blue-600 hover:bg-blue-700"
                />
                <VoteFormCard 
                title="특별활동 투표 예약" 
                formData={extraForm} 
                setFormData={setExtraForm} 
                onSubmit={() => handleReserve('extra')}
                buttonColor="bg-green-600 hover:bg-green-700"
                />
            </div>

            {/* 예약 대기열 섹션 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-bold mb-6">투표 예약 대기열</h3>
                
                {loading && <p className="text-center text-blue-500">데이터를 불러오는 중입니다...</p>}
                {error && <p className="text-center text-red-500 font-medium">에러 발생: {error}</p>}
                
                {!loading && !error && queue && queue.length > 0 ? (
                <div className="space-y-4">
                    {queue.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold mb-2 inline-block ${item.type === 'regular' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                            {item.type === 'regular' ? '정기활동' : '특별활동'}
                        </span>
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">📅 {item.date} | 📍 {item.location}</p>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                        <p>운동 시간: {item.startTime} ~ {item.endTime}</p>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                !loading && <p className="text-center text-gray-400 italic">현재 대기 중인 예약이 없습니다.</p>
                )}
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
        <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input
            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            {...props}
        />
        </div>
    );
}