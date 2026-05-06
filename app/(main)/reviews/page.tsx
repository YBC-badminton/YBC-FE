'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import CreateReviewModal from '../../../components/ui/CreateReviewModal';

// 1. 후기 데이터 타입 정의
interface Review {
    id: number;
    category: '라켓' | '의류' | '신발' | '가방' | '셔틀콕' | '악세서리';
    rating: number;
    title: string;
    duration: string;
    content: string;
    author: string;
    date: string;
    }

    // 2. 시안 기반 더미 데이터
    const DUMMY_REVIEWS: Review[] = [
    {
        id: 1,
        category: '라켓',
        rating: 5,
        title: 'YONEX - 아스트록스 99 프로',
        duration: '6개월',
        content: '헤드헤비 라켓이지만 스윙이 편하고 파워가 좋습니다. 특히 스매싱할 때 위력이 엄청나요. 처음엔 무게감이 느껴졌지만 적응하고 나니 제 실력이 한 단계 올라간 느낌입니다. 중급자 이상에게 강력 추천합니다.',
        author: '김민수',
        date: '2026.03.15'
    },
    {
        id: 2,
        category: '신발',
        rating: 4,
        title: 'VICTOR - P9200TD',
        duration: '1년',
        content: '쿠션감이 좋고 발목 지지력이 탁월합니다. 장시간 경기에도 발이 편하고 미끄럼 방지 기능이 우수해요. 다만 내구성이 조금 아쉽습니다. 1년 사용 후 밑창이 많이 닳았네요.',
        author: '이성재',
        date: '2026.03.14'
    },
    {
        id: 3,
        category: '의류',
        rating: 5,
        title: 'LI-NING - 국가대표 반팔 셔츠',
        duration: '3개월',
        content: '통풍이 정말 잘 되고 땀 배출도 빠릅니다. 디자인도 깔끔하고 고급스러워요. 세탁해도 형태가 변하지 않아서 만족스럽습니다. 가격대비 최고의 선택이었습니다.',
        author: '박지영',
        date: '2026.03.13'
    },
    {
        id: 4,
        category: '셔틀콕',
        rating: 4,
        title: 'RSL - Classic Tournament',
        duration: '2개월',
        content: '비행 안정성이 좋고 내구성도 괜찮습니다. 실내 체육관에서 사용하기 적합해요. 가격이 조금 비싸지만 품질을 생각하면 합리적입니다. 정기 모임에서 계속 사용 중입니다.',
        author: '최현우',
        date: '2026.03.12'
    },
    {
        id: 5,
        category: '가방',
        rating: 5,
        title: 'YONEX - BAG92031W',
        duration: '8개월',
        content: '라켓 3개와 신발, 의류까지 넉넉하게 들어갑니다. 수납공간이 많아서 정리하기 편하고 어깨끈 패딩이 두꺼워서 메고 다니기 편해요. 방수 기능도 있어서 비 오는 날에도 안심입니다.',
        author: '정수민',
        date: '2026.03.11'
    },
    {
        id: 6,
        category: '악세서리',
        rating: 4,
        title: 'WILSON - 프로 오버그립',
        duration: '1개월',
        content: '땀 흡수가 잘 되고 그립감이 좋습니다. 교체하기도 쉽고 가격도 합리적이에요. 다만 흰색이라 금방 더러워지는 게 단점입니다. 그래도 성능은 만족스럽습니다.',
        author: '강태호',
        date: '2026.03.10'
    }
    ];

    export default function ReviewPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleWriteReview = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsModalOpen(true);
    };

    const categories = ['전체', '라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    const filteredReviews = DUMMY_REVIEWS.filter(review => 
        activeTab === '전체' ? true : review.category === activeTab
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 sm:py-16 px-6 lg:px-24 font-sans select-none">
        <div className="max-w-screen-xl mx-auto space-y-8 sm:space-y-12">

            {/* --- [1] 헤더 섹션 --- */}
            <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800">장비 후기</h1>
            <p className="text-sm sm:text-base text-slate-400 font-bold">클럽원들의 배드민턴 장비 사용 후기를 확인하고 공유해보세요</p>
            </div>

            {/* --- [2] 필터 및 작성 버튼 섹션 --- */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto gap-1">
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
                    onClose={() => setIsModalOpen(false)}
                />
            </div>

            {/* --- [3] 후기 카드 그리드 --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
            </div>
        </div>
        </div>
    );
    }

    /** 후기 카드 컴포넌트 **/
    function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-4 sm:gap-5 hover:shadow-md transition-shadow">
        {/* 카드 상단: 카테고리 & 별점 */}
        <div className="flex justify-between items-center">
            <span className="bg-slate-100 text-slate-500 text-[11px] font-black px-3 py-1 rounded-md uppercase">
            {review.category}
            </span>
            <div className="flex text-amber-400 text-lg">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
            ))}
            </div>
        </div>

        {/* 카드 중단: 제목 & 기간 */}
        <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">
            {review.title}
            </h3>
            <p className="text-sm font-bold text-slate-400">사용 기간: {review.duration}</p>
        </div>

        {/* 카드 본문: 내용 */}
        <div className="py-4 border-t border-slate-50 min-h-[120px]">
            <p className="text-[15px] font-medium text-slate-600 leading-relaxed break-keep">
            {review.content}
            </p>
        </div>

        {/* 카드 하단: 작성자 & 날짜 */}
        <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-black text-slate-400">{review.author}</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{review.date}</span>
        </div>
        </div>
    );
}