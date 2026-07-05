'use client';

import React, { useState } from 'react';

const FAQ_DATA = [
    {
        question: '동아리는 어떤 방식으로 운영되나요? 처음 참여해도 괜찮을까요?',
        answer: '양배추 배드민턴 동아리는 매주 화요일, 목요일 정기 운동을 중심으로 운영됩니다. 실력에 상관없이 누구나 참여할 수 있으며, 처음 오시는 분들도 편하게 즐기실 수 있도록 분위기를 만들고 있습니다.',
    },
    {
        question: 'OT는 무엇인가요? 꼭 참여해야 하나요?',
        answer: 'OT(오리엔테이션)는 신규 부원을 위한 동아리 소개 및 친목 행사입니다. 필수 참석은 아니지만, 동아리 운영 방식과 부원들을 알아가는 좋은 기회이므로 가능하시면 참석을 권장합니다.',
    },
    {
        question: '정기 운동 일정과 참석은 어떻게 하나요?',
        answer: '정기 운동은 매주 화요일, 목요일 저녁 7시에 진행됩니다. 참석 여부는 활동 페이지에서 투표를 통해 사전에 알려주시면 됩니다. 불참 시에도 별도의 불이익은 없습니다.',
    },
    {
        question: '회비와 가입비는 어떻게 되며 어디에 사용되나요?',
        answer: '가입비와 월 회비는 체육관 대관료, 셔틀콕 구매, 동아리 행사 운영 등에 사용됩니다. 구체적인 금액은 합격 후 안내드리고 있으며, 투명하게 운영하고 있습니다.',
    },
    {
        question: '활동 기간이나 보장 일정은 어떻게 되나요?',
        answer: '활동 기간에 대한 제한은 없으며, 원하시는 기간 동안 자유롭게 활동하실 수 있습니다. 한 학기 이상 활동을 권장하지만 개인 사정에 따라 조정 가능합니다.',
    },
    {
        question: '장비가 없어도 참여할 수 있나요?',
        answer: '배드민턴화는 필수이며, 라켓은 동아리에서 여분을 보유하고 있어 처음에는 빌려 사용하실 수 있습니다. 활동을 지속하시게 되면 개인 라켓 구매를 권장합니다.',
    },
];

const KAKAO_CHANNEL_URL = 'https://open.kakao.com/o/sf2p7ipg';

export default function InquiryPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFAQ = FAQ_DATA.filter(
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
                            {/* 파일 확장자는 실제 프로젝트 환경에 맞게 사용해 주세요 (요청하신 대로 .svg로 표기) */}
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
                    {filteredFAQ.length > 0 ? (
                        filteredFAQ.map((faq, index) => {
                            const originalIndex = FAQ_DATA.indexOf(faq);
                            const isOpen = openIndex === originalIndex;

                            return (
                                <div
                                    key={originalIndex}
                                    className="bg-white rounded-[16px] sm:rounded-[24px] border border-gray-100 shadow-sm overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => toggleFAQ(originalIndex)}
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
                                        <div className="px-5 sm:px-8 pb-5 sm:pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
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

                {/* 모바일 전용 푸터 섹션 (sm:hidden 속성으로 데스크탑에서는 숨김 처리) */}
                <div className="sm:hidden p-4">
                    {/* 로고 이미지 경로는 실제 프로젝트 환경에 맞게 수정해 주세요 */}
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