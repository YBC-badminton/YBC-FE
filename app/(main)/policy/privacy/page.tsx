import React from 'react';

export const metadata = {
    title: '개인정보 처리방침 | YBC',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 lg:px-24 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800">개인정보 처리방침</h1>
                    <p className="text-sm font-bold text-slate-400">시행일: 2026년 5월 24일</p>
                </header>

                <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-4">
                    <p className="text-[15px] leading-7 text-slate-700">
                        YBC 배드민턴 클럽(이하 &quot;클럽&quot;)은 회원의 개인정보를 중요시하며, <span className="font-bold">「개인정보 보호법」</span>을 준수하고 있습니다. 클럽은 본 개인정보 처리방침을 통하여 회원이 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
                    </p>
                </section>

                <Article number="1" title="개인정보의 처리 목적">
                    <p>클럽은 다음의 목적을 위하여 개인정보를 처리합니다.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 부정 이용 방지</li>
                        <li>모임 운영: 정기/번개 모임 참여 여부 확인, 출결 관리, 참여 인원 관리</li>
                        <li>신규 회원 모집: 지원서 접수 및 심사</li>
                        <li>게스트 관리: 모임 게스트 신청 및 참여 관리</li>
                        <li>민원 처리 및 공지사항 전달</li>
                    </ul>
                </Article>

                <Article number="2" title="수집하는 개인정보 항목">
                    <p>클럽은 서비스 제공에 필요한 최소한의 개인정보를 다음과 같이 수집합니다.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>회원 (카카오 로그인): 카카오 소셜 ID, 이메일, 닉네임</li>
                        <li>지원자: 이름, 휴대폰 번호</li>
                        <li>게스트: 이름, 성별, 실력 등급</li>
                        <li>모임 참여 기록: 참석/불참 여부, 참여 일시</li>
                    </ul>
                </Article>

                <Article number="3" title="개인정보의 보유 및 이용 기간">
                    <ul className="list-disc pl-6 space-y-1">
                        <li>회원 정보: 회원 탈퇴 시까지</li>
                        <li>지원자 정보: 지원 절차 완료 후 1년</li>
                        <li>게스트 및 모임 참여 기록: 해당 모임 종료 후 1년</li>
                    </ul>
                    <p className="text-sm text-slate-500">단, 관련 법령에 의한 보관 의무가 있는 경우 해당 기간까지 보관합니다.</p>
                </Article>

                <Article number="4" title="정보주체의 권리·의무 및 행사 방법">
                    <p>회원은 클럽에 대해 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>개인정보 열람 요구</li>
                        <li>오류 정정 요구</li>
                        <li>삭제 요구</li>
                        <li>처리 정지 요구</li>
                    </ul>
                    <p>권리 행사는 클럽 운영진에게 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 클럽은 이에 대해 지체 없이 조치하겠습니다.</p>
                </Article>

                <Article number="5" title="개인정보의 파기 절차 및 방법">
                    <p>보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>전자적 파일 형태: 복구 및 재생이 불가능하도록 영구 삭제</li>
                        <li>종이 문서: 분쇄 또는 소각</li>
                    </ul>
                </Article>

                <Article number="6" title="개인정보 보호를 위한 안전성 확보 조치">
                    <ul className="list-disc pl-6 space-y-1">
                        <li>관리적 조치: 접근 권한자 최소화, 정기 점검</li>
                        <li>기술적 조치: 접근 통제, 인증 토큰 관리, 보안 통신(HTTPS) 사용</li>
                        <li>물리적 조치: 자료 보관 장소 통제</li>
                    </ul>
                </Article>

                <Article number="7" title="개인정보 보호책임자">
                    <p>클럽은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>개인정보 보호책임자: [운영진 담당자 이름]</li>
                        <li>연락처: [운영진 이메일]</li>
                    </ul>
                </Article>

                <Article number="8" title="개인정보 처리방침의 변경">
                    <p>본 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경 사항의 시행 7일 전부터 공지사항을 통하여 고지합니다.</p>
                </Article>
            </div>
        </div>
    );
}

function Article({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-4">
            <h2 className="text-xl font-black text-slate-800">
                <span className="text-[#5b6b0f]">{number}.</span> {title}
            </h2>
            <div className="text-[15px] leading-7 text-slate-700 space-y-3">
                {children}
            </div>
        </section>
    );
}
