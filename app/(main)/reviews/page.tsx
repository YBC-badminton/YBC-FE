'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import CreateReviewModal from '../../../components/ui/CreateReviewModal';
import LoginRequiredModal from '../../../components/ui/LoginRequiredModal';

// [데이터 인터페이스는 기존과 동일하게 유지]
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

export default function ReviewPage() {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const categories = ['전체', '라켓', '의류', '신발', '가방', '셔틀콕', '악세서리'];

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page: 0, size: 50, sort: 'desc' };
            if (activeTab !== '전체' && CATEGORY_MAP[activeTab]) params.category = CATEGORY_MAP[activeTab];
            const response = await api.get<any>('/reviews', { params });
            const data = Array.isArray(response.data) ? response.data : (response.data.reviews || []);
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:py-12 sm:px-6 lg:px-24 font-sans text-left">
            <div className="max-w-screen-xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800">장비 후기</h1>
                    <p className="text-sm text-slate-400 font-bold">클럽원들의 배드민턴 장비 사용 후기</p>
                </div>

                {/* 💡 모바일 텍스트 깨짐 해결: gap 및 padding 최적화 */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto gap-0.5 scrollbar-hide">
                        {categories.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 sm:px-6 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#4B7332] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="bg-[#4B7332] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#3d5d28] transition-all text-sm whitespace-nowrap" onClick={() => user ? setIsModalOpen(true) : setShowLoginModal(true)}>
                        + 후기 작성하기
                    </button>
                </div>

                {loading ? <div className="py-24 text-center text-slate-400 font-bold">불러오는 중...</div> : (
                    <div className="space-y-3">
                        {reviews.length > 0 ? reviews.map((review) => (
                            <div key={review.reviewId} onClick={() => setSelectedReview(review)} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#4B7332] transition">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="min-w-0 truncate">
                                        <p className="text-[10px] font-bold text-slate-400">{REVERSE_CATEGORY_MAP[review.category]}</p>
                                        <h3 className="font-black text-slate-800 truncate">{review.brandName} - {review.productName}</h3>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <div className="flex text-amber-400 text-xs justify-end">{'★'.repeat(review.rating)}</div>
                                    <p className="text-[10px] font-bold text-slate-400">{review.memberNickname}</p>
                                </div>
                            </div>
                        )) : <div className="py-24 text-center bg-white rounded-2xl text-slate-400 font-bold">등록된 후기가 없습니다.</div>}
                    </div>
                )}
            </div>

            {selectedReview && (
                <ReviewDetailModal 
                    review={selectedReview} 
                    onClose={() => setSelectedReview(null)} 
                    isAuthor={!!user && user.name === selectedReview.memberNickname}
                    onChanged={() => { fetchReviews(); setSelectedReview(null); }}
                    showToast={showToast}
                />
            )}
            <CreateReviewModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchReviews(); }} />
            <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}

function ReviewDetailModal({ review, onClose, isAuthor, onChanged, showToast }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.content);
    const [busy, setBusy] = useState(false);

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
            {/* 💡 팝업 내부 긴 URL도 깨지지 않도록 break-all 적용 */}
            <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-[32px] relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400"><X /></button>
                <div className="mb-6 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded">{REVERSE_CATEGORY_MAP[review.category]}</p>
                    <h2 className="text-xl font-black text-slate-800">{review.brandName} - {review.productName}</h2>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>{review.memberNickname}</span>
                        <span>{formatDate(review.createdAt)}</span>
                    </div>
                </div>
                <div className="flex text-amber-400 mb-4">{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</div>
                
                {/* 💡 핵심: break-all로 긴 URL 강제 줄바꿈 */}
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap break-all text-sm">
                    {review.content}
                </p>

                {isAuthor && (
                    <div className="flex gap-2 justify-end pt-8">
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold">삭제</button>
                    </div>
                )}
            </div>
        </div>
    );
}