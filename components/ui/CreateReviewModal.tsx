'use client';

import React, { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateReviewModal({ isOpen, onClose }: ModalProps) {
    const [selectedCategory, setSelectedCategory] = useState('라켓');
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');

    if (!isOpen) return null;

    const categories = ['라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={onClose} 
        />

        {/* 모달 컨테이너 */}
        <div className="relative bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-6">
            
            {/* --- [1] 헤더 섹션 --- */}
            <div className="bg-[#3D6B2C] p-10 text-white relative">
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <h2 className="text-3xl font-black tracking-tight mb-2">장비 후기 작성</h2>
            <p className="text-white/70 font-bold text-sm">사용하신 배드민턴 장비에 대한 솔직한 후기를 남겨주세요</p>
            </div>

            {/* --- [2] 폼 섹션 --- */}
            <div className="p-10 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
            
            {/* 카테고리 선택 */}
            <div className="space-y-3">
                <label className="text-sm font-black text-slate-500">카테고리 <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all ${
                        selectedCategory === cat 
                        ? 'bg-[#3D6B2C] text-white border-[#3D6B2C]' 
                        : 'bg-white text-slate-400 border-gray-200 hover:border-slate-300'
                    }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>
            </div>

            {/* 브랜드 & 제품명 */}
            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="브랜드" placeholder="예) YONEX" required />
                <InputGroup label="제품명" placeholder="예) 아스트록스 99 프로" required />
            </div>

            <InputGroup label="사용 기간" placeholder="예) 6개월" required />

            {/* 별점 선택 */}
            <div className="space-y-3">
                <label className="text-sm font-black text-slate-500">별점 <span className="text-red-500">*</span></label>
                <div className="flex gap-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                    ★
                    </button>
                ))}
                </div>
            </div>

            {/* 후기 내용 */}
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-500">후기 내용 <span className="text-red-500">*</span></label>
                <textarea 
                className="w-full h-40 p-5 bg-white border border-gray-200 rounded-2xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none placeholder:text-slate-300"
                placeholder="제품에 대한 솔직한 후기를 작성해주세요. (사용감, 장점, 단점, 추천 대상 등)"
                maxLength={1000}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-right text-xs font-bold text-slate-300">{content.length} / 1000자</p>
            </div>
            </div>

            {/* --- [3] 푸터 버튼 --- */}
            <div className="p-10 pt-0 grid grid-cols-2 gap-4">
            <button 
                onClick={onClose}
                className="py-4 bg-[#F1F3F5] text-slate-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
            >
                취소
            </button>
            <button className="py-4 bg-[#3D6B2C] text-white font-black rounded-2xl shadow-lg hover:bg-[#2D5A27] transition-all">
                후기 작성 완료
            </button>
            </div>
        </div>
        </div>
    );
    }

    function InputGroup({ label, placeholder, required, type = "text" }: { label: string; placeholder?: string; required?: boolean; type?: string }) {
    return (
        <div className="space-y-2">
        <label className="text-sm font-black text-slate-500">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} 
            placeholder={placeholder}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all" 
        />
        </div>
    );
}