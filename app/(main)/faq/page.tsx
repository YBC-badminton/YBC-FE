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

const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xnxaxcG';

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
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-12">

                {/* 헤더 + 검색 통합 카드 */}
                <div className="max-w-3xl mx-auto bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 sm:p-10 space-y-6">
                    <div className="space-y-2">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-wider">FAQ</span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">양배추 지원 시 자주 묻는 질문</h1>
                        <p className="text-sm sm:text-base text-slate-400 font-bold leading-relaxed">
                            양배추에 지원하시는 분들이 자주 묻는 질문을 모아보았습니다.<br className="hidden sm:block" />
                            그래도 궁금하신 사항이 있으시면 공식 소통창구로 문의해주세요!
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="양배추 공식 소통창구"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
                            />
                        </div>
                        <a
                            href={KAKAO_CHANNEL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-sm whitespace-nowrap flex items-center"
                        >
                            문의하기
                        </a>
                    </div>
                </div>

                {/* FAQ 아코디언 */}
                <div className="max-w-3xl mx-auto space-y-3">
                    {filteredFAQ.length > 0 ? (
                        filteredFAQ.map((faq, index) => {
                            const originalIndex = FAQ_DATA.indexOf(faq);
                            const isOpen = openIndex === originalIndex;

                            return (
                                <div
                                    key={originalIndex}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => toggleFAQ(originalIndex)}
                                        className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left gap-4"
                                    >
                                        <span className="text-[15px] font-bold text-slate-700 leading-relaxed">
                                            {faq.question}
                                        </span>
                                        <span className={`text-slate-300 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 sm:px-8 pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="pt-2 border-t border-gray-50">
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed pt-4">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-slate-400 font-bold">검색 결과가 없습니다.</p>
                            <p className="text-sm text-slate-300 mt-2">다른 키워드로 검색하거나 직접 문의해 주세요.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
