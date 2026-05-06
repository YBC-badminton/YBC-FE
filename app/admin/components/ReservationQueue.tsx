'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

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

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
    REGULAR: '정기 운동',
    FLUSH: '번개 운동',
    EVENT: '이벤트 운동',
};

export default function ReservationQueue() {
    const [queue, setQueue] = useState<VoteQueueItem[]>([]);

    useEffect(() => {
        const fetchQueue = async () => {
            const res = await api.get<VoteQueueResponse>('/admin/votes/queue');
            setQueue(res.data.data ?? []);
        };
        fetchQueue();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
            <h3 className="text-lg font-bold mb-4">투표 예약 대기열</h3>
            {queue.map((item) => (
                <div key={item.voteId} className="border p-4 rounded-lg mb-4 flex justify-between items-center">
                    <div>
                        <span className={`px-2 py-1 rounded text-xs mb-2 inline-block font-bold ${
                            item.activityType === 'REGULAR' ? 'bg-blue-100 text-blue-600' :
                            item.activityType === 'FLUSH' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                        }`}>
                            {ACTIVITY_TYPE_LABEL[item.activityType] || item.activityType}
                        </span>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-gray-500">📅 {item.activityDate} | 🕒 {item.activityTime}</p>
                        <p className="text-sm text-gray-500">📍 {item.location}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                        <p>투표: {item.voteStartAt?.slice(0, 16)} ~ {item.voteEndAt?.slice(0, 16)}</p>
                        <p>예약: {item.createdAt?.slice(0, 16)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
