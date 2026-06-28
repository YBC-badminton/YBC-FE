'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import CreateReviewModal from '../../../components/ui/CreateReviewModal';
import LoginRequiredModal from '../../../components/ui/LoginRequiredModal';

// --- 인터페이스 정의 ---
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
    updatedAt?: string;
}

interface ReviewResponse {
    reviews: Review[];
}

const CATEGORY_MAP: Record<string, string> = {
    '라켓': 'RACKET', '의류': 'CLOTHES', '신발': 'SHOES', '가방': 'BAG', '셔틀콕': 'SHUTTLECOCK', '악세서리': 'ACCESSORY'
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
    'RACKET': '라켓', 'CLOTHES': '의류', 'SHOES': '신발', 'BAG': '가방', 'SHUTTLECOCK': '셔틀콕', 'ACCESSORY': '악세서리'
};

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch { return dateStr; }
}

// 작성자 이름 가운데를 *로 마스킹 (첫·끝 글자 유지). 예: 양은서 → 양*서, 김철수2 → 김**2
function maskName(name: string): string {
    if (!name) return '';
    if (name.length <= 1) return name;
    if (name.length === 2) return `${name[0]}*`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
}

export default function ReviewPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const { user } = useAuth();
    const { showToast } = useToast();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const categories = ['전체', '라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page: 0, size: 50, sort: 'desc' };
            if (activeTab !== '전체' && CATEGORY_MAP[activeTab]) {
                params.category = CATEGORY_MAP[activeTab];
            }

            const response = await api.get<any>('/reviews', { params });
            const data = Array.isArray(response.data) ? response.data : (response.data.reviews || []);
            setReviews(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || '후기를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-12 px-4 sm:px-6 lg:px-24 font-sans text-left">
            <div className="max-w-screen-xl mx-auto space-y-8">
                {/* 헤더 섹션 */}
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800">장비 후기</h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-bold">클럽원들의 배드민턴 장비 사용 후기를 확인하고 공유해보세요</p>
                </div>

                {/* 필터 및 작성 버튼 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto gap-1 scrollbar-hide">
                        {categories.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                    activeTab === tab
                                        ? 'bg-[#5b6b0f] text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button
                        className="bg-[#5b6b0f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#46530c] transition-all text-sm w-full sm:w-auto"
                        onClick={() => user ? setIsModalOpen(true) : setShowLoginModal(true)}
                    >
                        + 후기 작성하기
                    </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">
                        {error}
                    </div>
                )}

                {/* 후기 리스트 */}
                {loading ? (
                    <div className="py-24 text-center text-slate-400 font-bold">불러오는 중...</div>
                ) : (
                    <div className="space-y-3">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div 
                                    key={review.reviewId} 
                                    onClick={() => setSelectedReview(review)} 
                                    className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#5b6b0f] transition"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="min-w-0 truncate">
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {REVERSE_CATEGORY_MAP[review.category]}
                                            </p>
                                            <h3 className="font-black text-slate-800 truncate">
                                                {review.brandName} - {review.productName}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <div className="flex text-amber-400 text-xs justify-end">
                                            {'★'.repeat(review.rating)}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">
                                            {maskName(review.memberNickname)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center bg-white rounded-2xl text-slate-400 font-bold">
                                등록된 후기가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 상세보기 모달 */}
            {selectedReview && (
                <ReviewDetailModal 
                    review={selectedReview} 
                    onClose={() => setSelectedReview(null)} 
                    isAuthor={!!user && user.name === selectedReview.memberNickname}
                    onChanged={() => { fetchReviews(); setSelectedReview(null); }}
                    showToast={showToast}
                />
            )}

            {/* 작성 및 로그인 모달 */}
            <CreateReviewModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchReviews(); }} />
            <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}

// 상세보기 모달 컴포넌트
function ReviewDetailModal({ review, onClose, isAuthor, onChanged, showToast }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.content);
    const [editRating, setEditRating] = useState<number>(review.rating);
    const [editUsageMonth, setEditUsageMonth] = useState<string>(String(review.usageMonth ?? ''));
    const [busy, setBusy] = useState(false);

    const saveEdit = async () => {
        const month = Number(editUsageMonth);
        if (editRating < 1 || editRating > 5) { showToast('별점을 선택해 주세요.', 'error'); return; }
        if (Number.isNaN(month) || month < 0) { showToast('사용 개월을 올바르게 입력해 주세요.', 'error'); return; }
        if (!editContent.trim()) { showToast('후기 내용을 입력해 주세요.', 'error'); return; }
        setBusy(true);
        try {
            await api.patch(`/reviews/${review.reviewId}`, { rating: editRating, usageMonth: month, content: editContent });
            showToast('수정되었습니다.', 'success');
            setIsEditing(false);
            onChanged();
        } catch { showToast('오류 발생', 'error'); } finally { setBusy(false); }
    };

    const handleDelete = async () => {
        if (!confirm('삭제하시겠습니까?')) return;
        try {
            await api.delete(`/reviews/${review.reviewId}`);
            showToast('삭제되었습니다.', 'success');
            onChanged();
        } catch { showToast('오류 발생', 'error'); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-2xl p-6 sm:p-12 rounded-[28px] sm:rounded-[40px] relative shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 sm:top-8 sm:right-8 text-slate-400 text-2xl hover:text-slate-600">
                    <X />
                </button>

                <div className="mb-8 sm:mb-10 space-y-2">
                    <p className="text-sm font-black text-slate-400 bg-slate-100 w-fit px-3 py-1 rounded-lg uppercase tracking-wider">
                        {REVERSE_CATEGORY_MAP[review.category]}
                    </p>
                    <h2 className="text-xl sm:text-4xl font-black text-slate-800 break-keep pr-8">
                        {review.brandName} - {review.productName}
                    </h2>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-400 pt-2">
                        <span>작성자: {maskName(review.memberNickname)}</span>
                        <span>
                            {review.updatedAt && review.updatedAt !== review.createdAt
                                ? `수정일: ${formatDate(review.updatedAt)}`
                                : `작성일: ${formatDate(review.createdAt)}`}
                        </span>
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-black text-slate-500">별점</label>
                            <div className="flex gap-1.5 text-3xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEditRating(star)}
                                        className={`transition-colors ${star <= editRating ? 'text-amber-400' : 'text-slate-200'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-black text-slate-500">사용 개월</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    value={editUsageMonth}
                                    onChange={(e) => setEditUsageMonth(e.target.value)}
                                    className="w-28 p-2.5 border border-gray-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5b6b0f]/20"
                                />
                                <span className="text-sm font-bold text-slate-500">개월</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex text-amber-400 text-2xl">
                            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                        </div>
                        <span className="text-sm font-bold text-slate-400">· 사용 {review.usageMonth}개월</span>
                    </div>
                )}

                <div className="py-8 border-y border-slate-100 min-h-[250px]">
                    {isEditing ? (
                        <textarea 
                            value={editContent} 
                            onChange={(e) => setEditContent(e.target.value)} 
                            rows={5} 
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5b6b0f] outline-none" 
                        />
                    ) : (
                        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap break-all">
                            {review.content}
                        </p>
                    )}
                </div>

                {/* 💡 복구된 수정/삭제 버튼 */}
                {isAuthor && (
                    <div className="flex gap-4 justify-end pt-8">
                        {isEditing ? (
                            <button onClick={saveEdit} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#5b6b0f] text-white rounded-full font-bold hover:bg-[#46530c]">
                                <Check className="w-5 h-5" /> 저장
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-slate-600 rounded-full font-bold hover:bg-gray-200">
                                    <Pencil className="w-5 h-5" /> 수정
                                </button>
                                <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100">
                                    <Trash2 className="w-5 h-5" /> 삭제
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}