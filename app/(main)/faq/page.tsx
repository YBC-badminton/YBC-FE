'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/axios';

// 백엔드 API 응답 구조에 맞춘 타입 정의
interface FAQItem {
    faqId: number;
    question: string;
    answer: string;
}

const KAKAO_CHANNEL_URL = 'https://open.kakao.com/o/sf2p7ipg';

export default function InquiryPage() {
    const [faqData, setFaqData] = useState<FAQItem[]>([]); // API로 받아올 FAQ 리스트
    const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 관리
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 백엔드 API 호출 (/faqs)
    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                // 1. 명세서에 맞춰 엔드포인트를 '/faqs'로 수정합니다.
                const response = await api.get('/faqs');
                
                // 2. 백엔드에서 { "faqs": [...] } 형태로 주기 때문에 response.data.faqs를 담아줍니다.
                if (response.data && response.data.faqs) {
                    setFaqData(response.data.faqs);
                }
            } catch (error) {
                console.error('FAQ 데이터 로드 실패', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchFAQs();
    }, []);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // 실시간 검색어 필터링
    const filteredFAQ = faqData.filter(
        (faq) =>
            faq.question.includes(searchQuery) ||
            faq.answer.includes(searchQuery)
    );

    return (
        /* 모바일 배경색: #f7f9f5 / 데스크탑 배경색: white */
        <div className="min-h-screen bg-[#f7f9f5] sm:bg-white py-6 sm:py-12 px-4 sm:px-6 lg:px-24 font-sans select-none text-left flex flex-col">
            <div className="max-w-[760px] mx-auto w-full h-full flex flex-col flex-grow">

                {/* 헤더 안내 카드 (YBC 디자인 시스템 적용) */}
                <div className="bg-white rounded-[24px] sm:rounded-[40px] border border-gray-100 shadow-sm p-6 sm:p-12 mb-6 sm:mb-8 overflow-hidden">
                    
                    {/* 💡 텍스트와 캐릭터 이미지를 양옆으로 배치하는 Flex 컨테이너 */}
                    <div className="flex justify-between items-center sm:items-end gap-4 sm:gap-8 mb-8 sm:mb-10">
                        {/* 좌측 텍스트 영역 */}
                        <div className="flex-1 min-w-0">
                            <span className="inline-block bg-[#f7f9f5] text-[#A1C852] px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-extrabold uppercase tracking-wider mb-2">
                                FAQ
                            </span>
                            <h1 className="text-[22px] sm:text-[28px] font-black text-[#1a1a1a] sm:text-slate-800 mt-2 mb-3 sm:mb-4 tracking-tight break-keep">
                                양배추 지원 시 자주 묻는 질문
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-[#8b95a1] sm:text-slate-500 font-medium leading-[1.6] break-keep">
                                양배추에 지원하시는 분들이 자주 묻는 질문을 모아보았습니다.<br className="hidden sm:block" />
                                그래도 궁금하신 사항이 있으시면 공식 소통창구로 문의해주세요!
                            </p>
                        </div>
                        
                        {/* 우측 캐릭터 이미지 영역 */}
                        <div className="shrink-0 mb-auto sm:mb-0">
                            <img 
                                src="/images/character-faq.svg" 
                                alt="궁금해하는 양배추 마스코트" 
                                className="w-[100px] sm:w-[130px] h-auto object-contain transition-transform duration-300 animate-in fade-in zoom-in duration-500" 
                            />
                        </div>
                    </div>

                    {/* 카카오 채널 문의하기 버튼 */}
                    <button
                        onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] text-[#191919] font-bold text-[14px] sm:text-[15px] py-4 rounded-[16px] hover:bg-[#F4DC00] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-sm"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c-5.523 0-10 3.51-10 7.84 0 2.81 1.84 5.26 4.67 6.64-.16.55-.95 3.32-.98 3.53-.02.13.06.2.14.15.11-.06 3.63-2.43 4.22-2.84.63.09 1.28.14 1.95.14 5.523 0 10-3.51 10-7.84S17.523 3 12 3z" />
                        </svg>
                        카카오 채널로 문의하기
                    </button>
                </div>

                {/* FAQ 아코디언 리스트 */}
                <div className="space-y-3 sm:space-y-4 pb-12">
                    {isLoading ? (
                        /* 데이터 로딩 스피너 */
                        <div className="py-16 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-[#A1C852] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[14px] text-[#8b95a1] mt-4 font-medium">자주 묻는 질문을 가져오고 있습니다...</p>
                        </div>
                    ) : filteredFAQ.length > 0 ? (
                        filteredFAQ.map((faq) => {
                            // originalIndex 대신 백엔드 고유 ID인 faqId를 활용해 열고 닫기 상태를 식별합니다.
                            const isOpen = openIndex === faq.faqId;

                            return (
                                <div
                                    key={faq.faqId}
                                    className="bg-white rounded-[16px] sm:rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => toggleFAQ(faq.faqId)}
                                        className="w-full flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 text-left gap-4 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <span className="text-[15px] sm:text-[16px] font-bold text-[#1a1a1a] sm:text-[#333D4B] leading-snug break-keep">
                                            {faq.question}
                                        </span>
                                        <span className={`text-slate-300 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>

                                    {/* 펼쳐지는 답변 내용 */}
                                    {isOpen && (
                                        <div className="px-5 sm:px-8 pb-5 sm:pb-6 animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col gap-4">
                                            {/* 텍스트 답변 */}
                                            <p className="text-[14px] sm:text-[15px] text-[#4e5968] sm:text-[#6B7684] font-medium leading-[1.6] break-keep">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center bg-white rounded-[16px] sm:rounded-[24px] border border-dashed border-gray-200 shadow-sm">
                            <p className="text-[#8b95a1] sm:text-slate-400 font-bold">검색 결과가 없습니다.</p>
                            <p className="text-[13px] sm:text-sm text-[#8b95a1] sm:text-slate-300 mt-2">다른 키워드로 검색하거나 직접 문의해 주세요.</p>
                        </div>
                    )}
                </div>

                {/* 모바일 전용 푸터 섹션 */}
                <div className="sm:hidden p-4">
                    <img 
                        src="/images/logo.png"
                        alt="YBC BADMINTON CLUB" 
                        className="h-10 mb-4 object-contain" 
                    />
                    <p className="text-[13px] text-[#8b95a1] font-medium">
                        © 2026 YBC Badminton Club. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}