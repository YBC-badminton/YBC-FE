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
        <div className="min-h-screen bg-white py-12 px-5 sm:px-6 lg:px-24 font-sans select-none text-left">
            <div className="max-w-[760px] mx-auto">

                {/* 헤더 안내 카드 (사진과 동일한 곡률, 여백, 폰트 적용) */}
                <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-gray-200 p-8 sm:p-12 mb-6">
                    <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                        FAQ
                    </span>
                    <h1 className="text-[24px] sm:text-[28px] font-black text-slate-800 mt-2 mb-4 tracking-tight break-keep">
                        양배추 지원 시 자주 묻는 질문
                    </h1>
                    <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium leading-[1.6] break-keep mb-8 sm:mb-10">
                        양배추에 지원하시는 분들이 자주 묻는 질문을 모아보았습니다.<br className="hidden sm:block" />
                        그래도 궁금하신 사항이 있으시면 공식 소통창구로 문의해주세요!
                    </p>

                    {/* 카카오 채널 문의하기 버튼 */}
                    <button
                        onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] text-[#191919] font-bold text-[15px] py-4 rounded-[16px] hover:bg-[#F4DC00] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                    >
                        {/* 사진과 일치하는 꽉 찬 카카오톡 말풍선 아이콘 */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c-5.523 0-10 3.51-10 7.84 0 2.81 1.84 5.26 4.67 6.64-.16.55-.95 3.32-.98 3.53-.02.13.06.2.14.15.11-.06 3.63-2.43 4.22-2.84.63.09 1.28.14 1.95.14 5.523 0 10-3.51 10-7.84S17.523 3 12 3z" />
                        </svg>
                        카카오 채널로 문의하기
                    </button>
                </div>

                {/* FAQ 아코디언 리스트 */}
                <div className="space-y-3 sm:space-y-4">
                    {filteredFAQ.length > 0 ? (
                        filteredFAQ.map((faq, index) => {
                            const originalIndex = FAQ_DATA.indexOf(faq);
                            const isOpen = openIndex === originalIndex;

                            return (
                                <div
                                    key={originalIndex}
                                    className="bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200 overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => toggleFAQ(originalIndex)}
                                        className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left gap-4"
                                    >
                                        <span className="text-[15px] sm:text-[16px] font-bold text-[#333D4B] leading-snug break-keep">
                                            {faq.question}
                                        </span>
                                        {/* 사진과 일치하는 얇고 둥근 V 모양 아이콘 */}
                                        <span className={`text-slate-300 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>

                                    {/* 펼쳐지는 답변 내용 */}
                                    {isOpen && (
                                        <div className="px-6 sm:px-8 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <p className="text-[14px] sm:text-[15px] text-[#6B7684] font-medium leading-[1.6] break-keep">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center bg-white rounded-[24px] border border-dashed border-gray-200">
                            <p className="text-slate-400 font-bold">검색 결과가 없습니다.</p>
                            <p className="text-sm text-slate-300 mt-2">다른 키워드로 검색하거나 직접 문의해 주세요.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}