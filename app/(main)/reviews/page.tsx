'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import CreateReviewModal from '../../../components/ui/CreateReviewModal';
import LoginRequiredModal from '../../../components/ui/LoginRequiredModal';

// --- 명세서 Success Response 기반 데이터 인터페이스 정의 ---
interface Review {
    reviewId: number;
    category: 'RACKET' | 'CLOTHES' | 'SHOES' | 'BAG' | 'SHUTTLECOCK' | 'ACCESSORY';
    brandName: string;
    productName: string;
    rating: number;
    usageMonth: number;
    content: string;
    memberNickname: string;
    createdAt: string;
}

interface ReviewResponse {
    reviews: Review[];
    pageInfo?: {
        totalElements: number;
        totalPages: number;
        isLast: boolean;
    };
}

const CATEGORY_MAP: Record<string, string> = {
    '라켓': 'RACKET',
    '의류': 'CLOTHES',
    '신발': 'SHOES',
    '가방': 'BAG',
    '셔틀콕': 'SHUTTLECOCK',
    '악세서리': 'ACCESSORY'
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
    'RACKET': '라켓',
    'CLOTHES': '의류',
    'SHOES': '신발',
    'BAG': '가방',
    'SHUTTLECOCK': '셔틀콕',
    'ACCESSORY': '악세서리'
};

// ISO 날짜 문자열 정제 함수 ("2026-03-15T14:30:00" -> "2026.03.15")
function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const yy = String(d.getFullYear());
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    } catch {
        return dateStr;
    }
}

export default function ReviewPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user } = useAuth();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleWriteReview = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        setIsModalOpen(true);
    };

    const categories = ['전체', '라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 명세서 400 에러 해결의 핵심: 'id,desc'가 아닌 'desc' 단일 정렬 규격 파라미터 셋업
            const params: Record<string, any> = {
                page: 0,
                size: 50,
                sort: 'desc'
            };

            if (activeTab !== '전체' && CATEGORY_MAP[activeTab]) {
                params.category = CATEGORY_MAP[activeTab];
            }

            const response = await api.get<ReviewResponse>('/reviews', { params });
            
            // 데이터 응답 포맷 유연화 가드 처리
            if (response.data) {
                if (Array.isArray(response.data.reviews)) {
                    setReviews(response.data.reviews);
                } else if (Array.isArray(response.data)) {
                    setReviews(response.data);
                } else {
                    setReviews([]);
                }
            } else {
                setReviews([]);
            }
        } catch (err: unknown) {
            console.error('Fetch Reviews Error:', err);
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '장비 후기 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans text-left">
            <div className="max-w-screen-xl mx-auto space-y-8 sm:space-y-12">

                {/* --- [1] 헤더 섹션 --- */}
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800">장비 후기</h1>
                    <p className="text-sm sm:text-base text-slate-400 font-bold">클럽원들의 배드민턴 장비 사용 후기를 확인하고 공유해보세요</p>
                </div>

                {/* --- [2] 필터 및 작성 버튼 섹션 --- */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide gap-1">
                        {categories.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab
                                        ? 'bg-[#4B7332] text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button
                        className="bg-[#4B7332] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d5d28] transition-all shadow-md text-sm sm:text-base"
                        onClick={handleWriteReview}
                    >
                        <span className="text-lg sm:text-xl">+</span> 후기 작성하기
                    </button>
                    <CreateReviewModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            fetchReviews(); // 후기 등록 모달 닫힐 때 실시간 동기화 호출
                        }}
                    />
                    <LoginRequiredModal
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                    />
                </div>

                {/* 에러 피드백 표시바 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                {/* --- [3] 후기 카드 그리드 --- */}
                {loading ? (
                    <div className="py-24 text-center text-slate-400 font-bold text-base">
                        후기 목록을 불러오는 중입니다...
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                        {reviews.map((review) => (
                            <ReviewCard key={review.reviewId || Math.random()} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[32px] border border-dashed border-gray-200 text-slate-400 font-bold">
                        등록된 장비 후기가 존재하지 않습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

/** 후기 카드 컴포넌트 **/
function ReviewCard({ review }: { review: Review }) {
    const displayCategory = REVERSE_CATEGORY_MAP[review.category] || review.category;

    // 사용 개월 수 데이터를 연/월 단위 문자열로 가독성 있게 치환 
    const displayDuration = review.usageMonth >= 12
        ? `${Math.floor(review.usageMonth / 12)}년 ${review.usageMonth % 12 > 0 ? `${review.usageMonth % 12}개월` : ''}`.trim()
        : `${review.usageMonth || 1}개월`;

    return (
        <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-4 sm:gap-5 hover:shadow-md transition-shadow text-left">
            {/* 카드 상단: 카테고리 & 별점 */}
            <div className="flex justify-between items-center">
                <span className="bg-slate-100 text-slate-500 text-[11px] font-black px-3 py-1 rounded-md uppercase">
                    {displayCategory}
                </span>
                <div className="flex text-amber-400 text-lg">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                </div>
            </div>

            {/* 카드 중단: 브랜드명 - 제품명 조합 타이틀 & 사용 기간 */}
            <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">
                    {review.brandName || '미지정'} - {review.productName || '일반 상품'}
                </h3>
                <p className="text-sm font-bold text-slate-400">사용 기간: {displayDuration}</p>
            </div>

            {/* 카드 본문: 내용 */}
            <div className="py-4 border-t border-slate-50 min-h-[120px]">
                <p className="text-[15px] font-medium text-slate-600 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                    {review.content}
                </p>
            </div>

            {/* 카드 하단: 작성자 닉네임 & 날짜 */}
            <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black text-slate-400">{review.memberNickname || '익명 부원'}</span>
                <span className="text-sm font-bold text-slate-200 tabular-nums">{formatDate(review.createdAt)}</span>
            </div>
        </div>
    );
}