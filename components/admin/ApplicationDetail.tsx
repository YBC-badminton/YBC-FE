'use client';

import React from 'react';

// 지원서 상태
export type ApplicationStatus = 'NONE' | 'FIRST_PASS' | 'FINAL_PASS' | 'FAIL' | 'HOLD';

// GET /admin/applications/{applicationId} 응답 타입 (지원자 조회 · 면접 관리 공용)
export interface ApplicantDetail {
    applicationId: number;
    name: string;
    address: string;
    gender: string;
    age: number;
    phone: string;
    university: string;
    major: string;
    introduction: string;
    motivation: string;
    equipment: string;
    interviewAvailableTimes: string[];
    discoverySource: string;
    discoveryEtc: string;
    wantsStaff: boolean;
    finalComment: string;
    createdAt: string;
    status: ApplicationStatus;
    email: string;
}

// 지원서 상세 내용 (지원자 조회 페이지와 면접 관리 페이지에서 공용으로 사용)
export function ApplicationDetail({ detail, isMobile = false }: { detail: ApplicantDetail; isMobile?: boolean }) {
    return (
        <div className={`space-y-3 text-slate-700 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
            <h4 className="text-base font-bold text-slate-900 mb-6">지원서 상세 정보</h4>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-8'}`}>
                <InfoItem label="지원일" value={detail.createdAt?.slice(0, 16).replace('T', ' ')} />
                <InfoItem label="거주지" value={detail.address} />
                <InfoItem label="면접 가능 시간" value={detail.interviewAvailableTimes?.join(', ') || '-'} />
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-8'} border-t border-gray-200/60 pt-6`}>
                <InfoItem label="이메일" value={detail.email || '-'} />
                <InfoItem label="연락처" value={detail.phone} />
            </div>

            <div className="border-t border-gray-200/60 pt-6 space-y-2">
                <InfoItem label="자기소개" value={detail.introduction} full />
                <InfoItem label="지원 동기" value={detail.motivation} full />
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-8'} border-t border-gray-200/60 pt-6`}>
                <InfoItem label="보유 장비" value={detail.equipment} />
                <InfoItem label="알게 된 경로" value={`${detail.discoverySource}${detail.discoveryEtc ? ` - ${detail.discoveryEtc}` : ''}`} />
            </div>

            <div className="border-t border-gray-200/60 pt-6">
                <InfoItem label="운영진 지원 여부" value={detail.wantsStaff ? '예' : '아니오'} />
            </div>

            <div className="border-t border-gray-200/60 pt-6">
                <InfoItem label="마지막으로 하고 싶은 말" value={detail.finalComment} full />
            </div>
        </div>
    );
}

function InfoItem({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
    return (
        <div className={`${full ? 'col-span-full' : ''}`}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
            <p className="text-[14px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{value || '-'}</p>
        </div>
    );
}
