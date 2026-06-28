'use client';

import React, { useState } from 'react';
import { Zap, Calendar, Clock, MapPin, CreditCard, FileText, X } from 'lucide-react';
import api from '../../lib/axios';
import { useToast } from './Toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export default function CreateLightningModal({ isOpen, onClose, onCreated }: ModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [activityTime, setActivityTime] = useState('');
    const [voteEndAt, setVoteEndAt] = useState('');
    const [location, setLocation] = useState('');
    const [fee, setFee] = useState('');
    const [memo, setMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setTitle(''); setDate(''); setActivityTime('');
        setVoteEndAt(''); setLocation(''); setFee(''); setMemo('');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !date || !activityTime.trim() || !location.trim() || !voteEndAt) {
            showToast('필수 항목을 모두 입력해주세요.', 'error');
            return;
        }

        // 메모: 사용자가 입력한 메모와 참여비를 함께 보관
        const memoParts = [];
        if (memo.trim()) memoParts.push(memo.trim());
        if (fee.trim()) memoParts.push(`참여비 ${fee.trim()}원`);

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                activityDate: date,
                activityTime: activityTime.trim(),
                location: location.trim(),
                memo: memoParts.join(' / '),
                voteEndAt: `${voteEndAt}:00`,
            };

            const response = await api.post('/votes/flash', payload);
            if (response.status === 201 || response.status === 200) {
                showToast('번개 모임이 생성되었습니다.', 'success');
                resetForm();
                onCreated?.();
                onClose();
            }
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '번개 모임 생성 중 오류가 발생했습니다.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        />

        {/* 모달 컨테이너 */}
        <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-4 sm:mx-6 flex flex-col">

            {/* --- [1] 헤더 섹션 (초록색 배경) --- */}
            <div className="bg-[#3D6B2C] px-6 py-6 sm:px-10 sm:py-8 text-white relative shrink-0">
            <button
                onClick={onClose}
                className="absolute top-5 right-5 sm:top-8 sm:right-8 text-white/80 hover:text-white transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">번개 모임 열기</h2>
            </div>
            <p className="text-white/70 font-bold text-sm">빠르게 모여서 배드민턴을 즐겨보세요!</p>
            </div>

            {/* --- [2] 폼 섹션 (입력창) --- */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 space-y-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">

            <InputGroup icon={<Zap className="w-5 h-5" />} label="번개 모임 이름" placeholder="예) 목요일 저녁 번개" value={title} onChange={setTitle} />
            <InputGroup icon={<Calendar className="w-5 h-5" />} label="날짜" type="date" value={date} onChange={setDate} />

            <InputGroup icon={<Clock className="w-5 h-5" />} label="활동 시간" placeholder="예) 19:00 ~ 20:00" value={activityTime} onChange={setActivityTime} />

            <InputGroup icon={<MapPin className="w-5 h-5" />} label="장소" placeholder="예) 강남구민체육센터" value={location} onChange={setLocation} />
            <InputGroup icon={<Calendar className="w-5 h-5" />} label="투표 마감 시각" type="datetime-local" value={voteEndAt} onChange={setVoteEndAt} />
            <InputGroup icon={<FileText className="w-5 h-5" />} label="메모 (선택)" placeholder="예) 셔틀콕 지참, 초보 환영" value={memo} onChange={setMemo} />

            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-500">
                    <span className="inline-flex w-5 justify-center shrink-0"><CreditCard className="w-5 h-5" /></span> 참여비 (선택)
                </label>
                <div className="relative">
                <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="10000"
                    className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl sm:rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 pr-12"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-400">원</span>
                </div>
            </div>
            </div>

            {/* --- [3] 푸터 버튼 섹션 --- */}
            <div className="px-6 py-5 sm:px-10 sm:py-6 border-t border-gray-100 grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <button
                onClick={onClose}
                disabled={isSubmitting}
                className="py-3.5 bg-[#F1F3F5] text-slate-600 font-black rounded-xl sm:rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
                취소
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-3.5 bg-[#3D6B2C] text-white font-black rounded-xl sm:rounded-2xl shadow-lg hover:bg-[#2D5A27] transition-all disabled:opacity-50"
            >
                {isSubmitting ? '생성 중...' : '번개 모임 만들기'}
            </button>
            </div>
        </div>
        </div>
    );
}

/** 아이콘과 라벨이 포함된 공용 입력창 **/
function InputGroup({ icon, label, placeholder, type = "text", value, onChange }: { icon: React.ReactNode; label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-black text-slate-500">
            <span className="inline-flex w-5 justify-center shrink-0">{icon}</span> {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl sm:rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
        />
        </div>
    );
}
