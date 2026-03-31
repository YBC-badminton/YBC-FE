'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FormData {
    name: string;
    gender: '남' | '여' | '';
    residence: string;
    age: string;
    phone: string;
    email: string;
    school: string;
    major: string;
    introduction: string;
    motivation: string;
    equipment: string;
    interviewTimes: string[];
    referral: string;
    referralDetail: string;
    operatorInterest: boolean;
    finalRemarks: string;
}

const INTERVIEW_OPTIONS = [
    '2월 21일(토) 13:30~14:30',
    '2월 21일(토) 14:30~15:30',
];

const REFERRAL_OPTIONS = ['에브리타임', '캠퍼스픽', '인스타그램', '기타'];

export default function ApplyPage() {
    const [form, setForm] = useState<FormData>({
        name: '',
        gender: '',
        residence: '',
        age: '',
        phone: '',
        email: '',
        school: '',
        major: '',
        introduction: '',
        motivation: '',
        equipment: '',
        interviewTimes: [],
        referral: '',
        referralDetail: '',
        operatorInterest: false,
        finalRemarks: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (field: keyof FormData, value: string | boolean | string[]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckbox = (option: string) => {
        setForm(prev => ({
            ...prev,
            interviewTimes: prev.interviewTimes.includes(option)
                ? prev.interviewTimes.filter(t => t !== option)
                : [...prev.interviewTimes, option],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.gender || !form.residence || !form.age || !form.phone || !form.email || !form.school || !form.major || !form.introduction || !form.motivation || !form.equipment || form.interviewTimes.length === 0 || !form.referral) {
            alert('모든 필수 항목을 입력해 주세요.');
            return;
        }

        if (form.referral === '기타' && !form.referralDetail) {
            alert('기타 경로를 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                timestamp: new Date().toISOString(),
            };
            console.log('지원서 전송 데이터:', payload);
            // await axios.post('/api/apply', payload);

            setIsSubmitted(true);
        } catch {
            alert('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 제출 완료 화면
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none flex items-center justify-center">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-[#F2F8E1] rounded-full flex items-center justify-center mx-auto border border-[#E2EBC8]">
                        <svg className="w-10 h-10 text-[#4B7332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">지원 완료!</h2>
                    <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
                        양배추 배드민턴 동아리에 지원해 주셔서 감사합니다.<br />
                        면접 일정은 입력하신 전화번호로 안내드리겠습니다.
                    </p>
                    <Link href="/">
                        <button className="mt-4 bg-[#4B7332] text-white font-bold px-10 py-3.5 rounded-full shadow-md hover:bg-[#3d5d28] transition-all duration-300">
                            홈으로 돌아가기
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none">
            <div className="max-w-screen-xl mx-auto space-y-12">

                {/* 헤더 - activities, reviews 스타일 통일 */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800">지원하기</h1>
                    <p className="text-slate-400 font-bold">양배추 배드민턴 동아리에 오신 것을 환영합니다! 아래 양식을 작성하여 지원해 주세요.</p>
                </div>

                {/* 폼 - 가독성을 위해 max-w-3xl 제한 */}
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10">

                    {/* 기본 정보 */}
                    <FormSection title="기본 정보" description="지원자의 기본 정보를 입력해 주세요.">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormInput
                                label="성함"
                                required
                                value={form.name}
                                onChange={v => handleChange('name', v)}
                                placeholder="홍길동"
                            />
                            <FormRadioGroup
                                label="성별"
                                required
                                options={['남', '여']}
                                value={form.gender}
                                onChange={v => handleChange('gender', v)}
                            />
                        </div>

                        <FormInput
                            label="거주지"
                            required
                            value={form.residence}
                            onChange={v => handleChange('residence', v)}
                            placeholder="서울시 강남구"
                            description="구 단위로 작성해 주세요."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormInput
                                label="나이"
                                required
                                value={form.age}
                                onChange={v => handleChange('age', v)}
                                placeholder="24"
                                type="number"
                                description="만 나이 적용 전의 나이를 기입해 주세요."
                            />
                            <FormInput
                                label="전화번호"
                                required
                                value={form.phone}
                                onChange={v => handleChange('phone', v)}
                                placeholder="010-1234-5678"
                                type="tel"
                                description="합격 통지 및 카톡방 초대에 사용됩니다."
                            />
                        </div>

                        <FormInput
                            label="이메일"
                            required
                            value={form.email}
                            onChange={v => handleChange('email', v)}
                            placeholder="example@email.com"
                            type="email"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormInput
                                label="학교"
                                required
                                value={form.school}
                                onChange={v => handleChange('school', v)}
                                placeholder="OO대학교"
                            />
                            <FormInput
                                label="학과"
                                required
                                value={form.major}
                                onChange={v => handleChange('major', v)}
                                placeholder="컴퓨터공학과"
                            />
                        </div>
                    </FormSection>

                    {/* 자기소개 및 지원 동기 */}
                    <FormSection title="자기소개 및 지원 동기" description="본인에 대해 자유롭게 알려주세요.">
                        <FormTextarea
                            label="자기소개"
                            required
                            value={form.introduction}
                            onChange={v => handleChange('introduction', v)}
                            placeholder="형식에 구애받지 않고 자유롭게 적어주시면 됩니다."
                            rows={5}
                        />
                        <FormTextarea
                            label="지원 동기"
                            required
                            value={form.motivation}
                            onChange={v => handleChange('motivation', v)}
                            placeholder="본 동아리에 지원하게 된 동기를 적어주세요."
                            rows={4}
                        />
                    </FormSection>

                    {/* 장비 정보 */}
                    <FormSection title="장비 정보" description="배드민턴 활동에 필요한 장비 정보를 알려주세요.">
                        <FormInput
                            label="보유한 라켓, 신발 등 장비 명"
                            required
                            value={form.equipment}
                            onChange={v => handleChange('equipment', v)}
                            placeholder="예) 요넥스 아크세이버 11, 요넥스 파워쿠션 65Z"
                            description="배드민턴화는 필수입니다. 라켓이 없으신 경우 '없음'으로 기입해 주세요."
                        />
                    </FormSection>

                    {/* 면접 시간 */}
                    <FormSection title="면접 시간" description="가능하신 시간에 전부 체크해 주시면 됩니다.">
                        <FormCheckboxGroup
                            label="면접 가능 시간"
                            required
                            options={INTERVIEW_OPTIONS}
                            value={form.interviewTimes}
                            onChange={handleCheckbox}
                        />
                    </FormSection>

                    {/* 추가 정보 */}
                    <FormSection title="추가 정보">
                        <FormRadioGroup
                            label="어떻게 양배추를 알게 되셨나요?"
                            required
                            options={REFERRAL_OPTIONS}
                            value={form.referral}
                            onChange={v => handleChange('referral', v)}
                            direction="vertical"
                        />
                        {form.referral === '기타' && (
                            <FormInput
                                label="기타 경로"
                                required
                                value={form.referralDetail}
                                onChange={v => handleChange('referralDetail', v)}
                                placeholder="예) 지인 소개"
                            />
                        )}

                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.operatorInterest}
                                    onChange={e => handleChange('operatorInterest', e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-slate-300 accent-[#4B7332]"
                                />
                                <div>
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition">운영진 지원을 희망합니다</span>
                                    <p className="text-xs text-slate-400 mt-1">동아리 운영에 관심이 있으시다면 체크해 주세요. (선택)</p>
                                </div>
                            </label>
                        </div>

                        <FormTextarea
                            label="마지막으로 하고 싶은 말"
                            value={form.finalRemarks}
                            onChange={v => handleChange('finalRemarks', v)}
                            placeholder="자유롭게 적어주세요. (선택)"
                            rows={3}
                        />
                    </FormSection>

                    {/* 제출 버튼 */}
                    <div className="pt-4 pb-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#4B7332] text-white font-bold text-base sm:text-lg py-4 sm:py-5 rounded-2xl shadow-md hover:bg-[#3d5d28] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '제출 중...' : '지원서 제출하기'}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4 font-bold">
                            제출 후 수정이 불가하오니 내용을 꼼꼼히 확인해 주세요.
                        </p>
                    </div>
                </form>

            </div>
        </div>
    );
}

// --- 재사용 컴포넌트 ---

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
                {description && <p className="text-sm text-slate-400 font-bold mt-1">{description}</p>}
            </div>
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5 sm:space-y-6">
                {children}
            </div>
        </div>
    );
}

function FormInput({ label, required, value, onChange, placeholder, type = 'text', description }: {
    label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; description?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {description && <p className="text-xs text-slate-400">{description}</p>}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition"
            />
        </div>
    );
}

function FormTextarea({ label, required, value, onChange, placeholder, rows = 4 }: {
    label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4B7332]/20 focus:border-[#4B7332]/40 transition resize-none"
            />
        </div>
    );
}

function FormRadioGroup({ label, required, options, value, onChange, direction = 'horizontal' }: {
    label: string; required?: boolean; options: string[]; value: string; onChange: (v: string) => void; direction?: 'horizontal' | 'vertical';
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className={`flex ${direction === 'vertical' ? 'flex-col gap-2.5' : 'flex-wrap gap-3'}`}>
                {options.map(option => (
                    <label
                        key={option}
                        className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 sm:py-3 rounded-xl border text-sm font-bold transition-all ${
                            value === option
                                ? 'border-[#4B7332] bg-[#F2F8E1] text-[#4B7332] shadow-sm'
                                : 'border-gray-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            value === option ? 'border-[#4B7332]' : 'border-slate-300'
                        }`}>
                            {value === option && <div className="w-2 h-2 rounded-full bg-[#4B7332]" />}
                        </div>
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
}

function FormCheckboxGroup({ label, required, options, value, onChange }: {
    label: string; required?: boolean; options: string[]; value: string[]; onChange: (option: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="flex flex-col gap-2.5">
                {options.map(option => (
                    <label
                        key={option}
                        className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 sm:py-3 rounded-xl border text-sm font-bold transition-all ${
                            value.includes(option)
                                ? 'border-[#4B7332] bg-[#F2F8E1] text-[#4B7332] shadow-sm'
                                : 'border-gray-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                        <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 ${
                            value.includes(option) ? 'border-[#4B7332] bg-[#4B7332]' : 'border-slate-300'
                        }`}>
                            {value.includes(option) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );
}
