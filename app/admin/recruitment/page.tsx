'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

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
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'detail'>('list');
    const [schedules, setSchedules] = useState<RecruitmentListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<RecruitmentForm>(emptyForm);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/recruitments');
            const data: any = res.data;
            const list: RecruitmentListItem[] = Array.isArray(data) ? data : (data.recruitments || data.data || []);
            setSchedules(list);
        } catch (err: any) {
            setError(err?.response?.data?.message || '목록을 불러오는 중 오류가 발생했습니다.');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const handleSelectDetail = async (item: RecruitmentListItem) => {
        setSelectedId(item.recruitmentId);
        setDetailLoading(true);
        setViewMode('detail');
        try {
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
            showToast('상세 정보를 불러오지 못했습니다.', 'error');
            setViewMode('list');
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

    const handleSubmit = async () => {
        if (!form.term) {
            showToast('기수 정보를 입력해주세요.', 'error');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                startAt: form.startAt ? `${form.startAt}:00` : '',
                endAt: form.endAt ? `${form.endAt}:00` : '',
            };
            
            if (viewMode === 'add') {
                await api.post('/admin/recruitments', payload);
                showToast('모집 일정이 추가되었습니다.', 'success');
            } else if (selectedId) {
                // 💡 명세서에 따른 PATCH 요청
                await api.patch(`/admin/recruitments/${selectedId}`, payload);
                showToast('모집 일정이 수정되었습니다.', 'success');
            }
            setViewMode('list');
            setForm(emptyForm);
            setSelectedId(null);
            fetchList();
        } catch (err: any) {
            showToast(err?.response?.data?.message || '저장 중 오류가 발생했습니다.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 py-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">모집 일정 관리</h1>
                </div>
                {viewMode === 'list' && (
                    <button onClick={() => { setForm(emptyForm); setSelectedId(null); setViewMode('add'); }} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
                        + 추가하기
                    </button>
                )}
            </div>

            {viewMode === 'list' && (
                <div className="space-y-4">
                    {loading && <p className="text-center py-10">불러오는 중...</p>}
                    {!loading && schedules.map((item) => (
                        <div key={item.recruitmentId} onClick={() => handleSelectDetail(item)} className="bg-white p-6 rounded-2xl border flex justify-between items-center cursor-pointer hover:border-blue-300 transition">
                            <span className="font-black">{item.term}</span>
                        </div>
                    ))}
                </div>
            )}

            {viewMode !== 'list' && (
                <div className="bg-white rounded-3xl border shadow-xl p-10 space-y-8">
                    <h2 className="text-xl font-black">{viewMode === 'add' ? '새 일정 추가' : '일정 수정'}</h2>
                    {detailLoading ? <p>불러오는 중...</p> : (
                        <>
                            <InputField label="기수" name="term" value={form.term} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="시작일" name="startAt" type="datetime-local" value={form.startAt} onChange={handleChange} />
                                <InputField label="마감일" name="endAt" type="datetime-local" value={form.endAt} onChange={handleChange} />
                            </div>
                            <InputField label="면접 장소" name="interviewLocation" value={form.interviewLocation} onChange={handleChange} />
                            <div className="flex justify-end gap-3 pt-6">
                                <button onClick={() => setViewMode('list')} className="px-6 py-3 bg-gray-100 rounded-xl font-bold">취소</button>
                                <button onClick={handleSubmit} disabled={saving} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">{saving ? '저장 중...' : '저장하기'}</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function InputField({ label, name, type = 'text', value, onChange }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black text-slate-400">{label}</label>
            <input name={name} type={type} value={value} onChange={onChange} className="w-full p-3 border rounded-xl font-bold" />
        </div>
    );
}