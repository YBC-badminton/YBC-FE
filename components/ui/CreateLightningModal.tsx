'use client';

import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateLightningModal({ isOpen, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={onClose} 
        />

        {/* 모달 컨테이너 */}
        <div className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-6">
            
            {/* --- [1] 헤더 섹션 (초록색 배경) --- */}
            <div className="bg-[#3D6B2C] p-10 text-white relative">
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                </div>
                <h2 className="text-3xl font-black tracking-tight">번개 모임 열기</h2>
            </div>
            <p className="text-white/70 font-bold text-sm">빠르게 모여서 배드민턴을 즐겨보세요!</p>
            </div>

            {/* --- [2] 폼 섹션 (입력창) --- */}
            <div className="p-10 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            
            <InputGroup icon="⚡" label="번개 모임 이름" placeholder="예) 목요일 저녁 번개" />
            <InputGroup icon="📅" label="날짜" type="date" />

            <div className="grid grid-cols-2 gap-4">
                <InputGroup icon="🕒" label="시작 시간" type="time" />
                <InputGroup icon="🕒" label="종료 시간" type="time" />
            </div>

            <InputGroup icon="👤" label="최대 참여 인원" placeholder="예) 18" type="number" />
            <InputGroup icon="📍" label="장소" placeholder="예) 강남구민체육센터" />
            
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-500">
                <span>$</span> 참여비
                </label>
                <div className="relative">
                <input 
                    type="text" 
                    placeholder="10000"
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 pr-12" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-400">원</span>
                </div>
            </div>
            </div>

            {/* --- [3] 푸터 버튼 섹션 --- */}
            <div className="p-10 pt-0 grid grid-cols-2 gap-4">
            <button 
                onClick={onClose}
                className="py-4 bg-[#F1F3F5] text-slate-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
            >
                취소
            </button>
            <button className="py-4 bg-[#3D6B2C] text-white font-black rounded-2xl shadow-lg hover:bg-[#2D5A27] transition-all">
                번개 모임 만들기
            </button>
            </div>
        </div>
        </div>
    );
    }

    /** 아이콘과 라벨이 포함된 공용 입력창 **/
    function InputGroup({ icon, label, placeholder, type = "text" }: { icon: string; label: string; placeholder?: string; type?: string }) {
    return (
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-black text-slate-500">
            <span>{icon}</span> {label}
        </label>
        <input 
            type={type} 
            placeholder={placeholder}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all" 
        />
        </div>
    );
}