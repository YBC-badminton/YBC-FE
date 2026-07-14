'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useToast } from '../../../components/ui/Toast';
import { Calendar, FileText, CheckCircle, Plus, Edit2, Trash2, X } from 'lucide-react';

interface FAQItem {
    faqId: number;
    question: string;
    answer: string;
    image?: string;
}

export default function AdminFAQPage() {
    const { showToast } = useToast();
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 모달 제어 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);

    // 폼 입력 필드 상태
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    // 등록/수정 중 요청 상태 관리
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. FAQ 목록 조회 (GET /faqs)
    const fetchFAQs = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/faqs');
            if (response.data && response.data.faqs) {
                setFaqs(response.data.faqs);
            }
        } catch (error) {
            console.error('FAQ 목록 조회 실패', error);
            showToast('FAQ 목록을 불러오는 데 실패했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    // 모달 열기 (등록)
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setQuestion('');
        setAnswer('');
        setSelectedFaqId(null);
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const handleOpenEditModal = (faq: FAQItem) => {
        setModalMode('edit');
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setSelectedFaqId(faq.faqId);
        setIsModalOpen(true);
    };

    // 2. FAQ 등록 및 수정 제출 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim() || !answer.trim()) {
            showToast('질문과 답변을 모두 입력해 주세요.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (modalMode === 'create') {
                // FAQ 등록 (POST /admin/content/faqs)
                await api.post('/admin/content/faqs', { question, answer });
                showToast('FAQ가 성공적으로 등록되었습니다.', 'success');
            } else if (modalMode === 'edit' && selectedFaqId !== null) {
                // FAQ 수정 (PATCH /admin/content/faqs/{faqId})
                await api.patch(`/admin/content/faqs/${selectedFaqId}`, { question, answer });
                showToast('FAQ가 성공적으로 수정되었습니다.', 'success');
            }
            setIsModalOpen(false);
            fetchFAQs(); // 목록 새로고침
        } catch (error: any) {
            const message = error?.response?.data?.message || '처리 중 오류가 발생했습니다.';
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. FAQ 삭제 처리 (DELETE /admin/content/faqs/{faqId})
    const handleDelete = async (faqId: number) => {
        if (!confirm('정말 이 FAQ를 삭제하시겠습니까?')) return;

        try {
            await api.delete(`/admin/content/faqs/${faqId}`);
            showToast('FAQ가 성공적으로 삭제되었습니다.', 'success');
            fetchFAQs(); // 목록 새로고침
        } catch (error: any) {
            const message = error?.response?.data?.message || '삭제 중 오류가 발생했습니다.';
            showToast(message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9f5] py-6 sm:py-12 px-4 sm:px-6 lg:px-24 font-sans select-none text-left flex flex-col">
            <div className="max-w-[1000px] mx-auto w-full flex flex-col flex-grow">
                
                {/* 관리자 헤더 안내 영역 */}
                <div className="bg-white rounded-[24px] sm:rounded-[40px] border border-gray-100 shadow-sm p-6 sm:p-12 mb-6 sm:mb-8 overflow-hidden">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <span className="inline-block bg-[#f7f9f5] text-[#A1C852] px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-2">
                                ADMIN SYSTEM
                            </span>
                            <h1 className="text-[22px] sm:text-[28px] font-black text-[#1a1a1a] sm:text-slate-800 mt-2 mb-3 tracking-tight break-keep">
                                자주 묻는 질문(FAQ) 관리자 콘솔
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-[#8b95a1] sm:text-slate-500 font-medium leading-[1.6] break-keep">
                                사용자 페이지에 공개되는 FAQ를 신규 등록, 수정 및 삭제할 수 있습니다.
                            </p>
                        </div>
                        
                        {/* 새 FAQ 추가 버튼 */}
                        <button
                            onClick={handleOpenCreateModal}
                            className="shrink-0 flex items-center gap-1.5 bg-[#A1C852] text-white font-bold text-[14px] sm:text-[15px] px-5 py-3.5 rounded-[16px] hover:bg-[#8eb344] active:scale-[0.98] transition-all duration-200 shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">새 FAQ 추가</span>
                        </button>
                    </div>
                </div>

                {/* 관리 테이블 / 리스트 카드 */}
                <div className="space-y-4">
                    <div className="px-1 sm:px-0 flex justify-between items-center">
                        <h2 className="text-[20px] sm:text-2xl font-black text-[#1a1a1a] sm:text-slate-800 tracking-tight">
                            등록된 FAQ 목록 ({faqs.length})
                        </h2>
                    </div>

                    {isLoading ? (
                        /* 로딩 뷰 */
                        <div className="py-24 text-center bg-white rounded-[20px] sm:rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="inline-block w-8 h-8 border-4 border-[#A1C852] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[14px] text-[#8b95a1] mt-4 font-medium">FAQ 목록을 로드하는 중입니다...</p>
                        </div>
                    ) : faqs.length > 0 ? (
                        /* FAQ 관리 카드 그리드 */
                        <div className="grid grid-cols-1 gap-4">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.faqId}
                                    className="bg-white rounded-[20px] sm:rounded-[28px] border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 transition-all"
                                >
                                    {/* 정보 영역 */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#f7f9f5] text-[#A1C852] text-[11px] sm:text-[12px] font-extrabold px-2.5 py-1 rounded-md">
                                                ID: {faq.faqId}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] sm:text-[17px] font-bold text-[#1a1a1a] sm:text-slate-800 leading-snug break-keep">
                                                Q. {faq.question}
                                            </h3>
                                            <p className="text-[13px] sm:text-[14px] text-[#4e5968] sm:text-slate-500 mt-2 font-medium leading-[1.6] break-keep">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 컨트롤 버튼 영역 */}
                                    <div className="flex md:flex-col items-center md:items-end justify-end gap-2 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 shrink-0">
                                        <button
                                            onClick={() => handleOpenEditModal(faq)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 border border-gray-100 text-[13px] sm:text-[14px] font-bold transition-all w-1/2 md:w-28 active:scale-95"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq.faqId)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-red-500 bg-red-50/50 hover:bg-red-50 border border-red-100 text-[13px] sm:text-[14px] font-bold transition-all w-1/2 md:w-28 active:scale-95"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* 데이터 없음 뷰 */
                        <div className="py-24 text-center bg-white rounded-[20px] sm:rounded-[32px] border border-dashed border-gray-200 shadow-sm">
                            <p className="text-[#8b95a1] sm:text-slate-400 font-bold">등록된 자주 묻는 질문이 존재하지 않습니다.</p>
                            <p className="text-[13px] sm:text-sm text-[#8b95a1] sm:text-slate-300 mt-2">상단의 '새 FAQ 추가' 버튼을 눌러 첫 번째 질문을 올려보세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 등록 및 수정 레이어드 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[600px] rounded-[24px] sm:rounded-[36px] shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        
                        {/* 모달 헤더 */}
                        <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h3 className="text-[18px] sm:text-[21px] font-black text-slate-800">
                                {modalMode === 'create' ? '새로운 FAQ 등록' : 'FAQ 상세 수정'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <X className="w-5.5 h-5.5" />
                            </button>
                        </div>

                        {/* 모달 폼 바디 */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {/* 질문 등록 */}
                            <div className="space-y-2">
                                <label className="block text-[14px] sm:text-sm font-bold text-slate-700">
                                    질문 (Question) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="예) 초보자도 가입할 수 있나요?"
                                    className="w-full px-4 py-3.5 bg-[#f7f9f5]/50 border border-gray-200 rounded-[12px] sm:rounded-xl text-[14px] sm:text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition"
                                />
                            </div>

                            {/* 답변 등록 */}
                            <div className="space-y-2">
                                <label className="block text-[14px] sm:text-sm font-bold text-slate-700">
                                    답변 (Answer) <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    required
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="예) 네, 초보자도 가입 가능합니다."
                                    rows={6}
                                    className="w-full px-4 py-3.5 bg-[#f7f9f5]/50 border border-gray-200 rounded-[12px] sm:rounded-xl text-[14px] sm:text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#A1C852]/30 focus:border-[#A1C852]/50 transition resize-none"
                                />
                            </div>
                        </form>

                        {/* 모달 푸터 */}
                        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 bg-white font-bold text-[14px] transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-3 rounded-xl bg-[#A1C852] hover:bg-[#8eb344] text-white font-bold text-[14px] transition-all duration-200 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? '처리 중...' : modalMode === 'create' ? 'FAQ 등록하기' : '수정 사항 저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}