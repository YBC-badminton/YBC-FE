// app/admin/votes/components/ReservationQueue.tsx
'use client';

import { useEffect, useState } from 'react';
import { VoteReservation } from '../types/vote';
import api from '@/lib/axios';

export default function ReservationQueue() {
    const [queue, setQueue] = useState<VoteReservation[]>([]);

    useEffect(() => {
        const fetchQueue = async () => {
        const res = await api.get<VoteReservation[]>('/api/admin/votes/queue');
        setQueue(res.data);
        };
        fetchQueue();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
        <h3 className="text-lg font-bold mb-4">투표 예약 대기열</h3>
        {queue.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg mb-4 flex justify-between items-center">
            <div>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mb-2 inline-block">
                {item.type === 'regular' ? '정기활동' : '특별활동'}
                </span>
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-gray-500">📅 {item.date} ({item.day}) | 🕒 {item.startTime} - {item.endTime}</p>
                <p className="text-sm text-gray-500">📍 {item.location}</p>
            </div>
            <div className="text-right text-xs text-gray-400">
                <p>투표 기간: {item.voteStart} ~ {item.voteEnd}</p>
                <p>예약 시간: {item.createdAt}</p>
            </div>
            </div>
        ))}
        </div>
    );
}