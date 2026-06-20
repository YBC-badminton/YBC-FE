'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, ChevronDown, ChevronUp, Mail, Phone, Edit2, Check, X } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

const GENDER_LABEL: Record<string, string> = {
    MALE: '남',
    FEMALE: '여',
};

interface MemberSummary {
    totalMembers: number;
    mapoResidentCount: number;
}

interface Member {
    memberId: number;
    name: string;
    university: string;
    phone: string;
    email: string;
    gender: 'MALE' | 'FEMALE';
    age: string;
    term: string;
    isMapoResident: boolean;
}

interface MembersResponse {
    summary: MemberSummary;
    members: Member[];
}

export default function MembersPage() {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<MemberSummary | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [termFilter, setTermFilter] = useState('all');
    const [showMapoOnly, setShowMapoOnly] = useState(false);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Member>>({});

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<MembersResponse>('/admin/members');
            setSummary(res.data.summary);
            setMembers(res.data.members);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '부원 목록을 불러오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSaveEdit = async (memberId: number) => {
        try {
            // API 명세에 맞게 모든 필드 전송
            await api.patch(`/admin/members/${memberId}`, editForm);
            setEditingId(null);
            fetchMembers();
            showToast('부원 정보가 수정되었습니다.', 'success');
        } catch {
            showToast('수정에 실패했습니다.', 'error');
        }
    };

    const handleDelete = async (memberId: number, name: string) => {
        if (!confirm(`${name} 부원을 삭제하시겠습니까?`)) return;
        try {
            await api.delete(`/admin/members/${memberId}`);
            fetchMembers();
            showToast(`${name} 부원이 삭제되었습니다.`, 'success');
        } catch {
            showToast('삭제에 실패했습니다.', 'error');
        }
    };

    const termCounts = members.reduce<Record<string, number>>((acc, m) => {
        if (m.term) acc[m.term] = (acc[m.term] || 0) + 1;
        return acc;
    }, {});
    
    const termOptions = Object.keys(termCounts).sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        return !isNaN(na) && !isNaN(nb) ? nb - na : a.localeCompare(b);
    });

    const filteredMembers = members.filter(m => {
        const matchesSearch = searchQuery === '' || m.name.includes(searchQuery) || m.university.includes(searchQuery);
        const matchesTerm = termFilter === 'all' || m.term === termFilter;
        const matchesMapo = !showMapoOnly || m.isMapoResident === true;
        return matchesSearch && matchesTerm && matchesMapo;
    });

    if (loading && members.length === 0) return <div className="py-20 text-center text-slate-400 font-bold">불러오는 중...</div>;
    if (error) return <div className="p-10 text-red-500 font-bold text-center">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-800">부원 명단</h1>
                <div className="text-sm text-gray-500 mt-2 font-bold">
                    전체 부원: {summary?.totalMembers || 0}명 
                    <span className="mx-2 text-gray-300">|</span> 
                    마포구 거주자: {summary?.mapoResidentCount || 0}명
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="이름 또는 학교 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    </div>
                    
                    <select
                        value={termFilter}
                        onChange={(e) => setTermFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white font-bold text-gray-700"
                    >
                        <option value="all">전체 기수</option>
                        {termOptions.map(term => (
                            <option key={term} value={term}>{term}기 ({termCounts[term]}명)</option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50">
                        <input 
                            type="checkbox" 
                            checked={showMapoOnly} 
                            onChange={(e) => setShowMapoOnly(e.target.checked)} 
                            className="w-4 h-4 text-blue-600 rounded" 
                        />
                        <span className="font-bold text-gray-700">마포구 거주자</span>
                    </label>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left hidden lg:table">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">이름</th>
                            <th className="p-4">성별</th>
                            <th className="p-4">나이</th>
                            <th className="p-4">학교</th>
                            <th className="p-4">기수</th>
                            <th className="p-4">연락처</th>
                            <th className="p-4">이메일</th>
                            <th className="p-4">마포구</th>
                            <th className="p-4 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredMembers.map((m) => (
                            <tr key={m.memberId} className="hover:bg-gray-50">
                                {editingId === m.memberId ? (
                                    <>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                                        <td className="p-2"><select className="w-full border p-1 rounded" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value as 'MALE' | 'FEMALE'})}><option value="MALE">남</option><option value="FEMALE">여</option></select></td>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.age || ''} onChange={e => setEditForm({...editForm, age: e.target.value})} /></td>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.university || ''} onChange={e => setEditForm({...editForm, university: e.target.value})} /></td>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.term || ''} onChange={e => setEditForm({...editForm, term: e.target.value})} /></td>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></td>
                                        <td className="p-2"><input className="w-full border p-1 rounded" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} /></td>
                                        <td className="p-2 text-center"><input type="checkbox" checked={!!editForm.isMapoResident} onChange={e => setEditForm({...editForm, isMapoResident: e.target.checked})} /></td>
                                        <td className="p-2 flex gap-2 justify-center">
                                            <button onClick={() => handleSaveEdit(m.memberId)} className="text-blue-600 font-bold"><Check className="w-5 h-5"/></button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-bold"><X className="w-5 h-5"/></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-bold">{m.name}</td>
                                        <td className="p-4">{GENDER_LABEL[m.gender]}</td>
                                        <td className="p-4">{m.age}년생</td>
                                        <td className="p-4">{m.university}</td>
                                        <td className="p-4">{m.term}</td>
                                        <td className="p-4">{m.phone}</td>
                                        <td className="p-4">{m.email}</td>
                                        <td className="p-4 text-center">{m.isMapoResident ? 'O' : 'X'}</td>
                                        <td className="p-4 flex gap-3 justify-center">
                                            <button onClick={() => { setEditingId(m.memberId); setEditForm(m); }} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(m.memberId, m.name)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* 모바일 뷰 */}
                <div className="lg:hidden divide-y">
                    {filteredMembers.map((m) => (
                        <div key={m.memberId} className="p-4 space-y-2">
                            <div className="font-black text-lg">{m.name} ({m.term}기)</div>
                            <div className="text-sm text-gray-600">{m.university} · {m.phone}</div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => { setEditingId(m.memberId); setEditForm(m); }} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">수정</button>
                                <button onClick={() => handleDelete(m.memberId, m.name)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm">삭제</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}