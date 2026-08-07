'use client';

import React, { useState } from 'react';
import api from '../../lib/axios';
import { useToast } from './Toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 한글 탭 -> API 영문 이늄 매핑 테이블
const CATEGORY_MAP: Record<string, string> = {
    '라켓': 'RACKET',
    '의류': 'CLOTHES',
    '신발': 'SHOES',
    '가방': 'BAG',
    '셔틀콕': 'SHUTTLECOCK',
    '악세서리': 'ACCESSORY'
};

// "6개월" 또는 "1년 6개월" 등의 한글 입력값을 정수형 개월 수(int)로 변환하는 안전 헬퍼 함수
function parseUsageMonth(durationStr: string): number {
    const cleanStr = durationStr.replace(/\s/g, '');
    let totalMonths = 0;
    
    // "X년" 패턴 매칭 및 계산
    const yearMatch = cleanStr.match(/(\d+)년/);
    if (yearMatch) {
        totalMonths += parseInt(yearMatch[1], 10) * 12;
    }
    
    // "X개월" 또는 "X달" 패턴 매칭 및 계산
    const monthMatch = cleanStr.match(/(\d+)(개?월|달)/);
    if (monthMatch) {
        totalMonths += parseInt(monthMatch[1], 10);
    } else if (!yearMatch) {
        const pureNumberMatch = cleanStr.match(/^(\d+)$/);
        if (pureNumberMatch) {
            totalMonths = parseInt(pureNumberMatch[1], 10);
        }
    }
    
    return totalMonths > 0 ? totalMonths : 1;
}

export default function CreateReviewModal({ isOpen, onClose }: ModalProps) {
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('라켓');
    const [brandName, setBrandName] = useState('');
    const [productName, setProductName] = useState('');
    const [duration, setDuration] = useState('');
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const categories = ['라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    const handleSubmit = async () => {
        if (!brandName.trim() || !productName.trim() || !duration.trim() || rating === 0 || !content.trim()) {
            showToast('필수(*) 항목을 모두 올바르게 입력해주세요.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                category: CATEGORY_MAP[selectedCategory] || 'RACKET',
                brandName: brandName.trim(),
                productName: productName.trim(),
                usageMonth: Number(parseUsageMonth(duration)),
                rating: Number(rating),
                content: content.trim()
            };

            const response = await api.post('/reviews', payload);
            
            if (response.status === 201 || response.status === 200) {
                showToast('장비 후기가 등록되었습니다.', 'success');
                
                setBrandName('');
                setProductName('');
                setDuration('');
                setRating(0);
                setContent('');
                
                onClose();
            }
        } catch (err: unknown) {
            console.error('❌ [Create Review Request Error]:', err);
            
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '후기 등록 중 오류가 발생했습니다. 입력 정보를 확인해주세요.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        /* 💡 1. p-3 sm:p-4 및 overflow-y-auto 적용으로 아이폰 SE 등에서 정중앙 배치 및 외부 스크롤 지원 */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* 배경 오버레이 */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose} 
            />

            {/* 💡 2. 모달 컨테이너: max-h-[90vh], my-auto, flex flex-col 설정으로 화면 밖으로 넘치지 않도록 조절 */}
            <div className="relative bg-white w-full max-w-xl rounded-[28px] sm:rounded-[40px] overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in duration-200 text-left">
                
                {/* --- [1] 헤더 섹션 --- */}
                <div className="bg-[#93C54B] p-5 sm:p-8 text-white relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 sm:top-7 sm:right-7 text-white/80 hover:text-white transition-colors p-1"
                        aria-label="닫기"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-1 sm:mb-2">장비 후기 작성</h2>
                    <p className="text-white/80 font-bold text-xs sm:text-sm">사용하신 배드민턴 장비에 대한 솔직한 후기를 남겨주세요</p>
                </div>

                {/* --- [2] 폼 섹션 (💡 flex-1 overflow-y-auto 적용) --- */}
                <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                    {/* 카테고리 선택 */}
                    <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-black text-slate-500">카테고리 <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                                        selectedCategory === cat 
                                            ? 'bg-[#93C54B] text-white border-[#93C54B]' 
                                            : 'bg-white text-slate-400 border-gray-200 hover:border-slate-300'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 브랜드 & 제품명 */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <InputGroup 
                            label="브랜드" 
                            placeholder="예) YONEX" 
                            required 
                            value={brandName}
                            onChange={setBrandName}
                        />
                        <InputGroup 
                            label="제품명" 
                            placeholder="예) 아스트록스 99" 
                            required 
                            value={productName}
                            onChange={setProductName}
                        />
                    </div>

                    <InputGroup 
                        label="사용 기간" 
                        placeholder="예) 6개월 또는 1년" 
                        required 
                        value={duration}
                        onChange={setDuration}
                    />

                    {/* 별점 선택 */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-black text-slate-500">별점 <span className="text-red-500">*</span></label>
                        <div className="flex gap-1 sm:gap-2 text-2xl sm:text-3xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-colors ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 후기 내용 */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-xs sm:text-sm font-black text-slate-500">후기 내용 <span className="text-red-500">*</span></label>
                        <textarea 
                            className="w-full h-28 sm:h-36 p-3.5 sm:p-4 bg-white border border-gray-200 rounded-2xl font-medium text-xs sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none placeholder:text-slate-300"
                            placeholder="제품에 대한 솔직한 후기를 작성해주세요. (사용감, 장점, 단점 등)"
                            maxLength={1000}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <p className="text-right text-[11px] sm:text-xs font-bold text-slate-300">{content.length} / 1000자</p>
                    </div>
                </div>

                {/* --- [3] 푸터 버튼 (고정 영역) --- */}
                <div className="p-4 sm:p-8 pt-2 sm:pt-4 grid grid-cols-2 gap-3 shrink-0 border-t border-slate-50">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="py-3 sm:py-3.5 bg-[#F1F3F5] text-slate-600 font-black rounded-2xl text-xs sm:text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="py-3 sm:py-3.5 bg-[#93C54B] text-white font-black rounded-2xl text-xs sm:text-sm shadow-md hover:bg-[#81b23c] transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? '등록 중...' : '후기 작성 완료'}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InputGroupProps {
    label: string;
    placeholder?: string;
    required?: boolean;
    type?: string;
    value: string;
    onChange: (val: string) => void;
}

function InputGroup({ label, placeholder, required, type = "text", value, onChange }: InputGroupProps) {
    return (
        <div className="space-y-1 sm:space-y-2 text-left">
            <label className="text-xs sm:text-sm font-black text-slate-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                type={type} 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2.5 sm:p-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-xs sm:text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all" 
            />
        </div>
    );
}
