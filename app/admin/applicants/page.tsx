'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import { ApplicationDetail, type ApplicantDetail, type ApplicationStatus } from '@/components/admin/ApplicationDetail';

// API 응답 타입 (spec 기준)
interface ApplicantListItem {
    applicationId: number;
    name: string;
    term: string;
    isReapplicant: boolean;
    gender: string;
    age: number;
    university: string;
    major: string;
    phone: string;
    createdAt: string;
    status: ApplicationStatus;
}

interface ApplicantsResponse {
    applicants: ApplicantListItem[];
    totalCount: number;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
    NONE: '없음',
    FIRST_PASS: '1차합격',
    FINAL_PASS: '최종합격',
    FAIL: '불합격',
    HOLD: '보류',
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
    NONE: 'bg-gray-100 text-gray-500',
    FIRST_PASS: 'bg-blue-50 text-blue-600',
    FINAL_PASS: 'bg-green-50 text-green-600',
    FAIL: 'bg-red-50 text-red-500',
    HOLD: 'bg-yellow-50 text-yellow-600',
};

export default function ApplicantsPage() {
    const { showToast } = useToast();
    const [applicants, setApplicants] = useState<ApplicantListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [termFilter, setTermFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [detail, setDetail] = useState<ApplicantDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // GET /admin/applications
    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<ApplicantsResponse>('/admin/applications');
            setApplicants(res.data.applicants);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '지원자 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    // GET /admin/applications/{applicationId}
    const fetchDetail = async (applicationId: number) => {
        if (expandedId === applicationId) {
            setExpandedId(null);
            setDetail(null);
            return;
        }
        setExpandedId(applicationId);
        setDetailLoading(true);
        try {
            const res = await api.get<ApplicantDetail>(`/admin/applications/${applicationId}`);
            setDetail(res.data);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    // PATCH /admin/applications/{applicationId}
    const updateStatus = async (applicationId: number, status: ApplicationStatus) => {
        try {
            await api.patch(`/admin/applications/${applicationId}`, { status });
            setApplicants(prev =>
                prev.map(a => a.applicationId === applicationId ? { ...a, status } : a)
            );
            if (detail && detail.applicationId === applicationId) {
                setDetail({ ...detail, status });
            }
            showToast('지원자 상태가 변경되었습니다.', 'success');
        } catch {
            showToast('상태 변경에 실패했습니다.', 'error');
        }
    };

    const termOptions = Array.from(new Set(applicants.map((a) => a.term).filter(Boolean)))
        .sort((a, b) => b.localeCompare(a, 'ko', { numeric: true }));

    const filteredApplicants = applicants.filter(
        (a) =>
            (termFilter === 'all' || a.term === termFilter) &&
            (a.name.includes(searchQuery) ||
                a.university.includes(searchQuery) ||
                a.major.includes(searchQuery))
    );

    const firstPassCount = filteredApplicants.filter(a => a.status === 'FIRST_PASS').length;
    const finalPassCount = filteredApplicants.filter(a => a.status === 'FINAL_PASS').length;

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
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-4 rounded-xl">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">지원자 조회</h1>
                <p className="text-sm text-gray-500 mt-1">합격 여부를 선택해 주세요.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="이름 또는 학교 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                    />
                </div>
                <select
                    value={termFilter}
                    onChange={(e) => setTermFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer sm:w-40"
                >
                    <option value="all">전체 기수</option>
                    {termOptions.map((term) => (
                        <option key={term} value={term}>{term}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
                    <p className="text-[10px] sm:text-sm text-gray-400 mb-1">전체</p>
                    <p className="text-lg sm:text-3xl font-bold text-gray-800">{filteredApplicants.length}명</p>
                </div>
                <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
                    <p className="text-[10px] sm:text-sm text-gray-400 mb-1">1차 합격</p>
                    <p className="text-lg sm:text-3xl font-bold text-blue-600">{firstPassCount}명</p>
                </div>
                <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left">
                    <p className="text-[10px] sm:text-sm text-gray-400 mb-1">최종 합격</p>
                    <p className="text-lg sm:text-3xl font-bold text-green-600">{finalPassCount}명</p>
                </div>
            </div>

            {/* 데스크탑 전용 테이블 */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-100 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">이름</th>
                            <th className="p-4 font-medium">기수</th>
                            <th className="p-4 font-medium">성별/나이</th>
                            <th className="p-4 font-medium">학교/학과</th>
                            <th className="p-4 font-medium">연락처</th>
                            <th className="p-4 font-medium">지원일</th>
                            <th className="p-4 font-medium text-center">상태</th>
                            <th className="p-4 font-medium text-center">상세</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                        {filteredApplicants.map((applicant) => (
                            <React.Fragment key={applicant.applicationId}>
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-900">
                                        {applicant.name}
                                        {applicant.isReapplicant && (
                                            <span className="ml-1 text-[10px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-bold">재지원</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">{applicant.term}</td>
                                    <td className="p-4 text-sm">{applicant.gender} / {applicant.age}세</td>
                                    <td className="p-4">
                                        <div className="text-sm">{applicant.university}</div>
                                        <div className="text-xs text-gray-400">{applicant.major}</div>
                                    </td>
                                    <td className="p-4 text-sm">{applicant.phone}</td>
                                    <td className="p-4 text-sm">{applicant.createdAt?.slice(0, 10)}</td>
                                    <td className="p-4 text-center">
                                        <select
                                            value={applicant.status}
                                            onChange={(e) => updateStatus(applicant.applicationId, e.target.value as ApplicationStatus)}
                                            className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLOR[applicant.status]}`}
                                        >
                                            {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => fetchDetail(applicant.applicationId)} className="text-blue-600 text-sm hover:text-blue-800 transition flex items-center gap-1 mx-auto">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expandedId === applicant.applicationId ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                        </button>
                                    </td>
                                </tr>
                                {expandedId === applicant.applicationId && (
                                    <tr>
                                        <td colSpan={8} className="bg-gray-50 p-8 border-t border-b border-gray-200/50">
                                            {detailLoading ? (
                                                <p className="text-center text-slate-400 font-bold py-4">상세 정보 불러오는 중...</p>
                                            ) : detail ? (
                                                <ApplicationDetail detail={detail} />
                                            ) : (
                                                <p className="text-center text-red-400 font-bold py-4">상세 정보를 불러올 수 없습니다.</p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 전용 카드 리스트 */}
            <div className="lg:hidden space-y-4">
                {filteredApplicants.map((applicant) => (
                    <div key={applicant.applicationId} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {applicant.name}
                                    {applicant.isReapplicant && (
                                        <span className="ml-1 text-[10px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-bold">재지원</span>
                                    )}
                                    <span className="text-xs font-normal text-gray-400 ml-1">{applicant.gender} / {applicant.age}세</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">{applicant.university} · {applicant.term}</p>
                            </div>
                            <button onClick={() => fetchDetail(applicant.applicationId)} className="p-1 text-gray-400">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${expandedId === applicant.applicationId ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                        </div>

                        <div className="flex gap-2 mt-4 border-t pt-4">
                            <select
                                value={applicant.status}
                                onChange={(e) => updateStatus(applicant.applicationId, e.target.value as ApplicationStatus)}
                                className={`flex-1 text-xs font-bold px-3 py-2 rounded-xl border-0 cursor-pointer ${STATUS_COLOR[applicant.status]}`}
                            >
                                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {expandedId === applicant.applicationId && (
                            <div className="mt-4 pt-6 border-t border-dashed border-gray-200">
                                {detailLoading ? (
                                    <p className="text-center text-slate-400 font-bold py-4">상세 정보 불러오는 중...</p>
                                ) : detail ? (
                                    <ApplicationDetail detail={detail} isMobile />
                                ) : (
                                    <p className="text-center text-red-400 font-bold py-4">상세 정보를 불러올 수 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
