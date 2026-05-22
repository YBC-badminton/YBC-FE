'use client';

import React, { useState } from 'react';
import api from '../../lib/axios';

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
        // 숫자만 입력했을 경우 기본 개월 수로 예외 인지
        const pureNumberMatch = cleanStr.match(/^(\d+)$/);
        if (pureNumberMatch) {
            totalMonths = parseInt(pureNumberMatch[1], 10);
        }
    }
    
    return totalMonths > 0 ? totalMonths : 1; // 최소 1개월 가드
}

export default function CreateReviewModal({ isOpen, onClose }: ModalProps) {
    const [selectedCategory, setSelectedCategory] = useState('라켓');
    const [brandName, setBrandName] = useState('');
    const [productName, setProductName] = useState('');
    const [duration, setDuration] = useState('');
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    
    // 통신 상태 관리
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const categories = ['라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    // [API 연동] 후기 생성 요청 Submit 핸들러
    const handleSubmit = async () => {
        // 필수 필드 유효성 검증 가드
        if (!brandName.trim() || !productName.trim() || !duration.trim() || rating === 0 || !content.trim()) {
            alert('필수(*) 항목을 모두 올바르게 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // 명세서 규격에 맞춘 Payload 빌드
            const payload = {
                category: CATEGORY_MAP[selectedCategory] || 'RACKET',
                brandName: brandName.trim(),
                productName: productName.trim(),
                usageMonth: Number(parseUsageMonth(duration)), // 정수형 int 타입 파싱 가드
                rating: Number(rating), // 정수형 int 타입 파싱 가드
                content: content.trim()
            };

            // POST /reviews 통신 실행
            const response = await api.post('/reviews', payload);
            
            if (response.status === 201 || response.status === 200) {
                alert('장비 후기가 성공적으로 등록되었습니다.');
                
                // 등록 성공 후 입력 폼 초기화
                setBrandName('');
                setProductName('');
                setDuration('');
                setRating(0);
                setContent('');
                
                onClose(); // 닫히면서 부모 ReviewPage 리스트 갱신 유도
            }
        } catch (err: unknown) {
            console.error('❌ [Create Review Request Error]:', err);
            
            // 명세서 Fail Response 구조 디버깅 대응
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '후기 등록 중 오류가 발생했습니다. 입력 정보를 확인해주세요.';
            alert(message);
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
            <div className="relative bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-6 text-left">
                
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
                <div className="p-10 space-y-8 max-h-[450px] overflow-y-auto custom-scrollbar">
                
                    {/* 카테고리 선택 */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-500">카테고리 <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
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
                        <InputGroup 
                            label="브랜드" 
                            placeholder="예) YONEX" 
                            required 
                            value={brandName}
                            onChange={setBrandName}
                        />
                        <InputGroup 
                            label="제품명" 
                            placeholder="예) 아스트록스 99 프로" 
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
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-500">별점 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2 text-3xl">
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
                <div className="p-10 pt-4 grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="py-4 bg-[#F1F3F5] text-slate-600 font-black rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        취소
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="py-4 bg-[#3D6B2C] text-white font-black rounded-2xl shadow-lg hover:bg-[#2D5A27] transition-all disabled:opacity-50"
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
        <div className="space-y-2 text-left">
            <label className="text-sm font-black text-slate-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                type={type} 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all" 
            />
        </div>
    );
}