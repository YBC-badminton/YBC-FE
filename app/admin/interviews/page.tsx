'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

type InterviewStatus = 'FIRST_PASS' | 'FINAL_PASS' | 'FAIL' | 'HOLD';
type SessionType = 'FIRST_SESSION' | 'SECOND_SESSION';

const SESSION_LABEL: Record<string, string> = {
    'FIRST_SESSION': '앞타임',
    'SECOND_SESSION': '뒷타임',
};

const STATUS_LABEL: Record<InterviewStatus, string> = {
    FIRST_PASS: '1차합격',
    FINAL_PASS: '최종합격',
    FAIL: '불합격',
    HOLD: '보류',
};

interface InterviewSummary {
    totalInterviewees: number;
    passedCount: number;
    failedCount: number;
    holdCount: number;
}

interface InterviewItem {
    applicationId: number;
    name: string;
    availableSessions: SessionType[];
    scheduledAt: SessionType | null;
    status: InterviewStatus;
    memo: string | null;
}

interface InterviewsResponse {
    summary: InterviewSummary;
    interviewList: InterviewItem[];
}

export default function InterviewsPage() {
    const [summary, setSummary] = useState<InterviewSummary | null>(null);
    const [interviewees, setInterviewees] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);

    // GET /admin/interviews
    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<InterviewsResponse>('/admin/interviews');
            setSummary(res.data.summary);
            setInterviewees(res.data.interviewList);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '면접 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const updateLocalField = (applicationId: number, field: string, value: string | null) => {
        setInterviewees(prev =>
            prev.map(i => i.applicationId === applicationId ? { ...i, [field]: value } : i)
        );
    };

    // PATCH /admin/interviews/{applicationId}
    const handleSave = async (person: InterviewItem) => {
        setSavingId(person.applicationId);
        try {
            const res = await api.patch<InterviewsResponse>(`/admin/interviews/${person.applicationId}`, {
                scheduledAt: person.scheduledAt,
                status: person.status,
                memo: person.memo,
            });
            setSummary(res.data.summary);
            setInterviewees(res.data.interviewList);
        } catch {
            alert('저장에 실패했습니다.');
        } finally {
            setSavingId(null);
        }
    };

    const resultColor = (status: InterviewStatus) => {
        switch (status) {
            case 'FINAL_PASS': return 'bg-green-50 text-green-600 border-green-200';
            case 'FAIL': return 'bg-red-50 text-red-600 border-red-200';
            case 'HOLD': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            default: return 'bg-blue-50 text-blue-600 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="py-20 text-center text-slate-400 font-bold">불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-left">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">면접 관리</h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">면접 시간을 배정하고 결과를 입력하세요.</p>
            </div>

            {/* 현황 카드 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 font-black">
                <div className="col-span-3 sm:col-span-1 bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">전체</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-800">{summary?.totalInterviewees ?? 0}명</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">합격</p>
                    <p className="text-xl sm:text-3xl font-bold text-blue-600">{summary?.passedCount ?? 0}명</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">불합격</p>
                    <p className="text-xl sm:text-3xl font-bold text-red-600">{summary?.failedCount ?? 0}명</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] sm:text-sm text-gray-500 mb-1 font-bold uppercase tracking-wider">보류</p>
                    <p className="text-xl sm:text-3xl font-bold text-orange-500">{summary?.holdCount ?? 0}명</p>
                </div>
            </div>

            {/* 데스크탑 테이블 */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">면접자</th>
                            <th className="p-4 font-medium">가능 시간대</th>
                            <th className="p-4 font-medium text-center">배정 시간</th>
                            <th className="p-4 font-medium text-center">결과</th>
                            <th className="p-4 font-medium text-center">비고</th>
                            <th className="p-4 font-medium text-center">저장</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-bold">
                        {interviewees.map((person) => (
                            <tr key={person.applicationId} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-bold text-gray-900">{person.name}</td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        {person.availableSessions.map((session, idx) => (
                                            <span key={idx} className="text-sm text-blue-600 font-medium">
                                                {SESSION_LABEL[session] || session}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <select
                                        value={person.scheduledAt || ''}
                                        onChange={(e) => updateLocalField(person.applicationId, 'scheduledAt', e.target.value || null)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold bg-white"
                                    >
                                        <option value="">미정</option>
                                        {person.availableSessions.map((session, idx) => (
                                            <option key={idx} value={session}>{SESSION_LABEL[session] || session}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    <select
                                        value={person.status}
                                        onChange={(e) => updateLocalField(person.applicationId, 'status', e.target.value)}
                                        className={`px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${resultColor(person.status)}`}
                                    >
                                        {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    <input
                                        type="text"
                                        value={person.memo || ''}
                                        onChange={(e) => updateLocalField(person.applicationId, 'memo', e.target.value)}
                                        placeholder="비고 입력"
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full font-medium"
                                    />
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleSave(person)}
                                        disabled={savingId === person.applicationId}
                                        className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        {savingId === person.applicationId ? '...' : '저장'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 카드 리스트 */}
            <div className="lg:hidden space-y-4">
                {interviewees.map((person) => (
                    <div key={person.applicationId} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left transition-all">
                        <div
                            className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-50"
                            onClick={() => setExpandedId(expandedId === person.applicationId ? null : person.applicationId)}
                        >
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${resultColor(person.status)}`}>
                                    {STATUS_LABEL[person.status]}
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedId === person.applicationId ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className={`transition-all duration-300 ease-in-out ${expandedId === person.applicationId ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-gray-50/50`}>
                            <div className="p-5 pt-0 space-y-4">
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">가능 시간대</p>
                                    <div className="flex flex-wrap gap-2">
                                        {person.availableSessions.map((session, idx) => (
                                            <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-bold border border-blue-100">
                                                {SESSION_LABEL[session] || session}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">배정 시간</p>
                                        <select
                                            value={person.scheduledAt || ''}
                                            onChange={(e) => updateLocalField(person.applicationId, 'scheduledAt', e.target.value || null)}
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">미정</option>
                                            {person.availableSessions.map((session, idx) => (
                                                <option key={idx} value={session}>{SESSION_LABEL[session] || session}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">결과 입력</p>
                                        <select
                                            value={person.status}
                                            onChange={(e) => updateLocalField(person.applicationId, 'status', e.target.value)}
                                            className={`w-full px-3 py-2.5 border rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none ${resultColor(person.status)}`}
                                        >
                                            {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pb-2">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1.5 tracking-wider">비고</p>
                                    <input
                                        type="text"
                                        value={person.memo || ''}
                                        onChange={(e) => updateLocalField(person.applicationId, 'memo', e.target.value)}
                                        placeholder="비고 입력"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white"
                                    />
                                </div>

                                <button
                                    onClick={() => handleSave(person)}
                                    disabled={savingId === person.applicationId}
                                    className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {savingId === person.applicationId ? '저장 중...' : '저장하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
