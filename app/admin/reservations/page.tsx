'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { useAxios } from '@/hooks/useAxios';

// API 응답 타입 (spec 기준)
interface VoteQueueItem {
    voteId: number;
    activityType: 'REGULAR' | 'FLUSH' | 'EVENT';
    title: string;
    activityDate: string;
    activityTime: string;
    location: string;
    voteStartAt: string;
    voteEndAt: string;
    createdAt: string;
}

interface VoteQueueResponse {
    count: number;
    data: VoteQueueItem[];
}

// 투표 예약 요청 타입 (spec 기준)
interface VoteReserveRequest {
    activityType: 'REGULAR' | 'FLUSH' | 'EVENT';
    title: string;
    activityDate: string;
    activityTime: string;
    location: string;
    memo: string;
    voteStartAt: string;
    voteEndAt: string;
    capacity: number;
}

// 폼 입력 상태 타입 — capacity는 빈 문자열 허용을 위해 string으로 보관
type VoteReserveFormState = Omit<VoteReserveRequest, 'capacity'> & { capacity: string };

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
    'REGULAR': '정기 운동',
    'FLUSH': '번개 운동',
    'EVENT': '이벤트 운동',
};

export default function VoteReservationPage() {
    // GET /admin/votes/queue
    const { data: queueResponse, loading, error, refetch } = useAxios<VoteQueueResponse>('/admin/votes/queue');

    const [regularForm, setRegularForm] = useState<VoteReserveFormState>({
        activityType: 'REGULAR', title: '정기활동', activityDate: '', activityTime: '', location: '', memo: '', voteStartAt: '', voteEndAt: '', capacity: ''
    });
    const [extraForm, setExtraForm] = useState<VoteReserveFormState>({
        activityType: 'FLUSH', title: '', activityDate: '', activityTime: '', location: '', memo: '', voteStartAt: '', voteEndAt: '', capacity: ''
    });

    // POST /admin/votes
    const handleReserve = async (type: 'regular' | 'extra') => {
        const form = type === 'regular' ? regularForm : extraForm;
        const payload: VoteReserveRequest = {
            ...form,
            voteStartAt: form.voteStartAt ? form.voteStartAt + ':00' : '',
            voteEndAt: form.voteEndAt ? form.voteEndAt + ':00' : '',
            capacity: Number(form.capacity) || 0,
        };

        try {
            const response = await api.post('/admin/votes', payload);
            if (response.status === 200 || response.status === 201) {
                alert('투표 예약이 완료되었습니다!');
                refetch();
            }
        } catch {
            alert('예약 중 오류가 발생했습니다.');
        }
    };

    const queue = queueResponse?.data ?? [];

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
                    activityTypeOptions={['REGULAR']}
                />
                <VoteFormCard
                    title="특별활동 투표 예약"
                    formData={extraForm}
                    setFormData={setExtraForm}
                    onSubmit={() => handleReserve('extra')}
                    buttonColor="bg-green-600 hover:bg-green-700"
                    activityTypeOptions={['FLUSH', 'EVENT']}
                />
            </div>

            {/* 예약 대기열 섹션 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-bold mb-6">투표 예약 대기열 {queueResponse && `(${queueResponse.count}건)`}</h3>

                {loading && <p className="text-center text-blue-500">데이터를 불러오는 중입니다...</p>}
                {error && <p className="text-center text-red-500 font-medium">에러 발생: {error}</p>}

                {!loading && !error && queue.length > 0 ? (
                    <div className="space-y-4">
                        {queue.map((item) => (
                            <div key={item.voteId} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold mb-2 inline-block ${
                                        item.activityType === 'REGULAR' ? 'bg-blue-50 text-blue-600' :
                                        item.activityType === 'FLUSH' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                        {ACTIVITY_TYPE_LABEL[item.activityType] || item.activityType}
                                    </span>
                                    <p className="font-bold text-gray-800">{item.title}</p>
                                    <p className="text-sm text-gray-500">📅 {item.activityDate} | 📍 {item.location}</p>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                    <p>운동 시간: {item.activityTime}</p>
                                    <p>투표: {item.voteStartAt?.slice(0, 16)} ~ {item.voteEndAt?.slice(0, 16)}</p>
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
function VoteFormCard({ title, formData, setFormData, onSubmit, buttonColor, activityTypeOptions }: {
    title: string;
    formData: VoteReserveFormState;
    setFormData: React.Dispatch<React.SetStateAction<VoteReserveFormState>>;
    onSubmit: () => void;
    buttonColor: string;
    activityTypeOptions: VoteReserveRequest['activityType'][];
}) {
    const showTypeSelector = activityTypeOptions.length > 1;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const nextValue = name === 'capacity' ? value.replace(/\D/g, '') : value;
        setFormData({ ...formData, [name]: nextValue });
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-800">{title}</h2>
            <div className="space-y-4">
                {/* 활동 유형 및 제목 */}
                <div className="flex gap-4">
                    {showTypeSelector && (
                        <div className="flex-1 min-w-0">
                            <label className="block text-xs font-medium text-gray-400 mb-1">활동 유형</label>
                            <select
                                name="activityType"
                                value={formData.activityType}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                {activityTypeOptions.map((type) => (
                                    <option key={type} value={type}>{ACTIVITY_TYPE_LABEL[type]}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <InputGroup label="제목" name="title" value={formData.title} onChange={handleChange} placeholder="예: 4월 3주차 정기 배드민턴 투표" />
                </div>
                {/* 날짜 및 시간 */}
                <div className="flex gap-4">
                    <InputGroup label="활동 날짜" name="activityDate" type="date" value={formData.activityDate} onChange={handleChange} />
                    <InputGroup label="활동 시간" name="activityTime" value={formData.activityTime} onChange={handleChange} placeholder="예: 14:00 ~ 17:00" />
                </div>
                {/* 장소 및 정원 */}
                <div className="flex gap-4">
                    <InputGroup label="장소" name="location" value={formData.location} onChange={handleChange} placeholder="예: 망원나들목체육관" />
                    <InputGroup label="정원" name="capacity" type="text" inputMode="numeric" value={formData.capacity} onChange={handleChange} placeholder="예: 25" />
                </div>
                {/* 메모 */}
                <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-400 mb-1">메모</label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        onChange={handleChange}
                        placeholder="예: 라켓 지참 필수"
                        className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        rows={2}
                    />
                </div>
                {/* 투표 기간 */}
                <div className="flex gap-4 pt-2">
                    <InputGroup label="투표 시작" name="voteStartAt" type="datetime-local" value={formData.voteStartAt} onChange={handleChange} />
                    <InputGroup label="투표 종료" name="voteEndAt" type="datetime-local" value={formData.voteEndAt} onChange={handleChange} />
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
function InputGroup({ label, ...props }: { label: string; [key: string]: unknown }) {
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
