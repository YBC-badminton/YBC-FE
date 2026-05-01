'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface RecruitmentListItem {
    recruitmentId: number;
    term: string;
}

interface RecruitmentDetail {
    recruitmentId: number;
    term: string;
    startAt: string;
    endAt: string;
    firstResultDate: string;
    finalResultDate: string;
    interviewDate: string;
    interviewLocation: string;
    interviewFirstTime: string;
    interviewSecondTime: string;
    otDate: string;
    membershipFee: number;
    activityPeriod: number;
}

interface RecruitmentForm {
    term: string;
    startAt: string;
    endAt: string;
    firstResultDate: string;
    finalResultDate: string;
    interviewDate: string;
    interviewLocation: string;
    interviewFirstTime: string;
    interviewSecondTime: string;
    otDate: string;
    membershipFee: number | '';
    activityPeriod: number | '';
}

const emptyForm: RecruitmentForm = {
    term: '', startAt: '', endAt: '', firstResultDate: '', finalResultDate: '',
    interviewDate: '', interviewLocation: '', interviewFirstTime: '', interviewSecondTime: '',
    otDate: '', membershipFee: '', activityPeriod: '',
};

export default function RecruitmentPage() {
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'detail'>('list');
    const [schedules, setSchedules] = useState<RecruitmentListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<RecruitmentForm>(emptyForm);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // GET /admin/recruitments
    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<RecruitmentListItem[]>('/admin/recruitments');
            setSchedules(res.data);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '모집 일정 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // Click item → load detail and fill form
    const handleSelectDetail = async (item: RecruitmentListItem) => {
        setSelectedId(item.recruitmentId);
        setDetailLoading(true);
        setViewMode('detail');
        try {
            // The spec doesn't have a single detail endpoint, so we use the list + local data
            // For now, fill what we have. If there's a detail endpoint later, use it here.
            // Use PATCH response format to populate
            const res = await api.get<RecruitmentDetail>(`/admin/recruitments/${item.recruitmentId}`);
            const d = res.data;
            setForm({
                term: d.term,
                startAt: d.startAt?.slice(0, 16) || '',
                endAt: d.endAt?.slice(0, 16) || '',
                firstResultDate: d.firstResultDate || '',
                finalResultDate: d.finalResultDate || '',
                interviewDate: d.interviewDate || '',
                interviewLocation: d.interviewLocation || '',
                interviewFirstTime: d.interviewFirstTime || '',
                interviewSecondTime: d.interviewSecondTime || '',
                otDate: d.otDate || '',
                membershipFee: d.membershipFee,
                activityPeriod: d.activityPeriod,
            });
        } catch {
            // If detail endpoint doesn't exist, just show the term
            setForm({ ...emptyForm, term: item.term });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm({
            ...form,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
        });
    };

    // POST /admin/recruitments or PATCH /admin/recruitments/{id}
    const handleSubmit = async () => {
        if (!form.term) return alert('기수 정보를 입력해주세요.');
        setSaving(true);
        try {
            const payload = {
                ...form,
                startAt: form.startAt ? form.startAt + (form.startAt.length === 16 ? ':00' : '') : '',
                endAt: form.endAt ? form.endAt + (form.endAt.length === 16 ? ':00' : '') : '',
            };
            if (viewMode === 'add') {
                await api.post('/admin/recruitments', payload);
            } else if (selectedId) {
                await api.patch(`/admin/recruitments/${selectedId}`, payload);
            }
            alert('모집 일정이 성공적으로 저장되었습니다.');
            setViewMode('list');
            setForm(emptyForm);
            setSelectedId(null);
            fetchList();
        } catch {
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 py-6 sm:py-8 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">모집 일정 관리</h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">동아리 모집 일정을 설정하고 관리하세요.</p>
                </div>
                {viewMode === 'list' && (
                    <button
                        onClick={() => { setForm(emptyForm); setSelectedId(null); setViewMode('add'); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                    >
                        <span className="text-blue-500 text-lg">+</span> 모집 일정 추가하기
                    </button>
                )}
            </div>

            {/* 목록 보기 */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {loading && <p className="text-center py-10 text-slate-400 font-bold">불러오는 중...</p>}
                    {error && <p className="text-center py-10 text-red-500 font-bold">{error}</p>}
                    {!loading && schedules.map((item) => (
                        <div
                            key={item.recruitmentId}
                            onClick={() => handleSelectDetail(item)}
                            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:border-blue-200 transition-all cursor-pointer flex justify-between items-center group"
                        >
                            <span className="text-base sm:text-lg font-black text-slate-800">{item.term}</span>
                            <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                    {!loading && !error && schedules.length === 0 && (
                        <p className="text-center py-10 text-slate-400">등록된 모집 일정이 없습니다.</p>
                    )}
                </div>
            )}

            {/* 추가/상세 폼 */}
            {viewMode !== 'list' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-10 space-y-8 sm:space-y-10">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-lg sm:text-xl font-black text-slate-800">
                            {viewMode === 'add' ? '새 일정 추가' : `${form.term} 정보 수정`}
                        </h2>
                        <button onClick={() => { setViewMode('list'); setForm(emptyForm); }} className="text-xs sm:text-sm font-bold text-slate-400 hover:text-red-500">취소</button>
                    </div>

                    {detailLoading ? (
                        <p className="text-center py-10 text-slate-400 font-bold">불러오는 중...</p>
                    ) : (
                        <>
                            <FormSection title="기본 정보">
                                <InputField label="기수" name="term" value={form.term} onChange={handleChange} placeholder="예) 10.5기" />
                            </FormSection>

                            <FormSection title="모집 기간">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <InputField label="모집 시작" name="startAt" type="datetime-local" value={form.startAt} onChange={handleChange} />
                                    <InputField label="모집 마감" name="endAt" type="datetime-local" value={form.endAt} onChange={handleChange} />
                                </div>
                            </FormSection>

                            <FormSection title="면접 정보">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <InputField label="면접 날짜" name="interviewDate" type="date" value={form.interviewDate} onChange={handleChange} />
                                    <InputField label="면접 장소" name="interviewLocation" value={form.interviewLocation} onChange={handleChange} placeholder="예) 마포구 청년센터 3층" />
                                    <InputField label="앞타임" name="interviewFirstTime" value={form.interviewFirstTime} onChange={handleChange} placeholder="예) 13:00 ~ 15:00" />
                                    <InputField label="뒷타임" name="interviewSecondTime" value={form.interviewSecondTime} onChange={handleChange} placeholder="예) 15:30 ~ 18:00" />
                                </div>
                            </FormSection>

                            <FormSection title="발표 일정">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <InputField label="1차 발표일" name="firstResultDate" type="date" value={form.firstResultDate} onChange={handleChange} />
                                    <InputField label="최종 발표일" name="finalResultDate" type="date" value={form.finalResultDate} onChange={handleChange} />
                                </div>
                            </FormSection>

                            <FormSection title="활동 정보">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <InputField label="회비 (원)" name="membershipFee" type="number" value={form.membershipFee} onChange={handleChange} placeholder="예) 50000" />
                                    <InputField label="활동 기간 (개월)" name="activityPeriod" type="number" value={form.activityPeriod} onChange={handleChange} placeholder="예) 6" />
                                </div>
                            </FormSection>

                            <FormSection title="OT 정보">
                                <InputField label="OT 날짜" name="otDate" type="date" value={form.otDate} onChange={handleChange} />
                            </FormSection>

                            <div className="flex justify-end pt-4 sm:pt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? '저장 중...' : '저장하기'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-5 sm:space-y-6">
            <h2 className="text-base sm:text-lg font-black text-slate-800 border-l-4 border-blue-500 pl-3">{title}</h2>
            <div className="space-y-4 px-1">{children}</div>
        </div>
    );
}

function InputField({ label, name, type = 'text', value, onChange, placeholder, readOnly }: {
    label: string; name: string; type?: string; value: string | number | ''; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; readOnly?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 ml-1">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full p-3.5 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none transition-all ${
                    readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                }`}
            />
        </div>
    );
}
