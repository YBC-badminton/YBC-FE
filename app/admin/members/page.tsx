'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';

const GENDER_LABEL: Record<string, string> = {
    MALE: '남',
    FEMALE: '여',
};

interface MemberSummary {
    totalMembers: number;
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
    isMapoResident: boolean; // 💡 마포구 거주 여부 필드 추가
}

interface MembersResponse {
    summary: MemberSummary;
    members: Member[];
}

interface MemberForm {
    name: string;
    university: string;
    phone: string;
    email: string;
    gender: 'MALE' | 'FEMALE';
    age: string;
    term: string;
}

export default function MembersPage() {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<MemberSummary | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [termFilter, setTermFilter] = useState('all');
    const [showMapoOnly, setShowMapoOnly] = useState(false); // 💡 마포구 필터 상태
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MemberForm>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<MemberForm>({
        name: '', university: '', phone: '', email: '', gender: 'MALE', age: '', term: '',
    });

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

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchMembers();
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/admin/members/search`, { params: { name: searchQuery } });
            const data = Array.isArray(res.data) ? res.data : [res.data];
            setMembers(data);
        } catch {
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async (memberId: number) => {
        try {
            await api.patch(`/admin/members/${memberId}`, editForm);
            setEditingId(null);
            setEditForm({});
            fetchMembers();
            showToast('부원 정보가 수정되었습니다.', 'success');
        } catch {
            showToast('수정에 실패했습니다.', 'error');
        }
    };

    const handleAdd = async () => {
        try {
            await api.post('/admin/members', addForm);
            setShowAddForm(false);
            setAddForm({ name: '', university: '', phone: '', email: '', gender: 'MALE', age: '', term: '' });
            fetchMembers();
            showToast('부원이 추가되었습니다.', 'success');
        } catch {
            showToast('부원 추가에 실패했습니다.', 'error');
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

    const startEdit = (member: Member) => {
        setEditingId(member.memberId);
        setEditForm({
            name: member.name, university: member.university, phone: member.phone,
            email: member.email, gender: member.gender, age: member.age, term: member.term,
        });
    };

    // 필터링 및 통계 계산
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
                <p className="text-sm text-gray-500 mt-1">동아리 부원 정보를 관리하세요.</p>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="이름 또는 학교 검색"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                        {termOptions.map(term => <option key={term} value={term}>{term} ({termCounts[term]}명)</option>)}
                    </select>

                    <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={showMapoOnly} onChange={(e) => setShowMapoOnly(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="font-bold text-gray-700">마포구 거주자</span>
                    </label>

                    <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md active:scale-95 text-sm">
                        + 부원 추가
                    </button>
                </div>
            </div>

            {/* 리스트 (데스크탑/모바일 생략 없이 작성) */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left hidden lg:table">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">이름</th>
                            <th className="p-4">성별</th>
                            <th className="p-4">나이</th>
                            <th className="p-4">학교</th>
                            <th className="p-4">전화번호</th>
                            <th className="p-4">기수</th>
                            <th className="p-4 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredMembers.map((member) => (
                            <tr key={member.memberId} className="hover:bg-gray-50">
                                <td className="p-4 font-bold">{member.name}</td>
                                <td className="p-4">{GENDER_LABEL[member.gender]}</td>
                                <td className="p-4">{member.age}년생</td>
                                <td className="p-4">{member.university}</td>
                                <td className="p-4">{member.phone}</td>
                                <td className="p-4">{member.term}</td>
                                <td className="p-4 text-center space-x-2">
                                    <button onClick={() => handleDelete(member.memberId, member.name)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* 모바일 뷰 */}
                <div className="lg:hidden p-4 space-y-4">
                    {filteredMembers.map((member) => (
                        <div key={member.memberId} className="border p-4 rounded-xl space-y-2">
                            <h3 className="font-black text-lg">{member.name}</h3>
                            <p className="text-sm">{member.university} · {member.term}</p>
                            <button onClick={() => handleDelete(member.memberId, member.name)} className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm">삭제</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}