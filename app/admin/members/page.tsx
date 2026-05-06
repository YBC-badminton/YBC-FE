'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface MemberSummary {
    totalMembers: number;
    court1: number;
    court2: number;
    court3: number;
    court4: number;
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
    court: number | null;
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
    court: number | null;
}

const COURT_COLOR: Record<number, string> = {
    1: 'bg-red-50 text-red-500',
    2: 'bg-orange-50 text-orange-500',
    3: 'bg-blue-50 text-blue-500',
    4: 'bg-green-50 text-green-500',
};

export default function MembersPage() {
    const [summary, setSummary] = useState<MemberSummary | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MemberForm>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<MemberForm>({
        name: '', university: '', phone: '', email: '', gender: 'MALE', age: '', term: '', court: null,
    });

    // GET /admin/members
    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<MembersResponse>('/admin/members');
            setSummary(res.data.summary);
            setMembers(res.data.members);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || '부원 목록을 불��오는 중 오류가 발생했습니다.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // GET /admin/members/search?name=
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchMembers();
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/admin/members/search`, { params: { name: searchQuery } });
            // search can return single or array
            const data = Array.isArray(res.data) ? res.data : [res.data];
            setMembers(data);
        } catch {
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    // PATCH /admin/members/{memberId}
    const handleSaveEdit = async (memberId: number) => {
        try {
            await api.patch(`/admin/members/${memberId}`, editForm);
            setEditingId(null);
            setEditForm({});
            fetchMembers();
        } catch {
            alert('수정에 실패했습니다.');
        }
    };

    // POST /admin/members
    const handleAdd = async () => {
        try {
            await api.post('/admin/members', addForm);
            setShowAddForm(false);
            setAddForm({ name: '', university: '', phone: '', email: '', gender: 'MALE', age: '', term: '', court: null });
            fetchMembers();
        } catch {
            alert('부원 추가에 실패했습니다.');
        }
    };

    // DELETE /admin/members/{memberId}
    const handleDelete = async (memberId: number, name: string) => {
        if (!confirm(`${name} 부원을 삭제하시겠습니까?`)) return;
        try {
            await api.delete(`/admin/members/${memberId}`);
            fetchMembers();
        } catch {
            alert('삭제에 실패했습니다.');
        }
    };

    const startEdit = (member: Member) => {
        setEditingId(member.memberId);
        setEditForm({
            name: member.name,
            university: member.university,
            age: member.age,
            term: member.term,
            court: member.court,
        });
    };

    const filteredMembers = searchQuery && !loading
        ? members
        : members.filter(m =>
            m.name.includes(searchQuery) || m.university.includes(searchQuery)
        );

    if (loading && members.length === 0) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">부원 명단</h1>
                <p className="text-sm text-gray-500 mt-1">동아리 부원 정보를 관리하세요.</p>
            </div>

            {/* 현황 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
                {[
                    { label: '전체 부원', count: `${summary?.totalMembers ?? 0}명`, color: 'text-gray-800' },
                    { label: '1코트', count: `${summary?.court1 ?? 0}명`, color: 'text-red-500' },
                    { label: '2코트', count: `${summary?.court2 ?? 0}명`, color: 'text-orange-500' },
                    { label: '3코트', count: `${summary?.court3 ?? 0}명`, color: 'text-blue-500' },
                    { label: '4코트', count: `${summary?.court4 ?? 0}명`, color: 'text-green-500' },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm text-center sm:text-left ${idx === 0 ? 'col-span-2 lg:col-span-1' : 'col-span-1'}`}
                    >
                        <p className="text-[10px] sm:text-sm text-gray-500 mb-1 whitespace-nowrap">{item.label}</p>
                        <p className={`text-lg sm:text-2xl font-bold ${item.color}`}>{item.count}</p>
                    </div>
                ))}
            </div>

            {/* 검색 및 추가 버튼 */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-96 flex gap-2">
                    <input
                        type="text"
                        placeholder="이름으로 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-md active:scale-95 text-sm"
                >
                    + 부원 추가
                </button>
            </div>

            {/* 부원 추가 폼 */}
            {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">새 부원 추가</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input placeholder="이름" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <input placeholder="학교" value={addForm.university} onChange={(e) => setAddForm({ ...addForm, university: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <input placeholder="전화번호" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <input placeholder="이메일" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as 'MALE' | 'FEMALE' })} className="p-2 border rounded-lg text-sm">
                            <option value="MALE">남성</option>
                            <option value="FEMALE">여성</option>
                        </select>
                        <input placeholder="나이 (예: 01)" value={addForm.age} onChange={(e) => setAddForm({ ...addForm, age: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <input placeholder="기수 (예: 10기)" value={addForm.term} onChange={(e) => setAddForm({ ...addForm, term: e.target.value })} className="p-2 border rounded-lg text-sm" />
                        <select value={addForm.court ?? ''} onChange={(e) => setAddForm({ ...addForm, court: e.target.value ? Number(e.target.value) : null })} className="p-2 border rounded-lg text-sm">
                            <option value="">코트 미정</option>
                            <option value="1">1코트</option>
                            <option value="2">2코트</option>
                            <option value="3">3코트</option>
                            <option value="4">4코트</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                        <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50">취소</button>
                        <button onClick={handleAdd} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">추가</button>
                    </div>
                </div>
            )}

            {/* 데스크탑 테이블 */}
            <div className="hidden lg:block bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-sm uppercase font-bold">
                        <tr>
                            <th className="p-4 font-medium">이름</th>
                            <th className="p-4 font-medium">나이</th>
                            <th className="p-4 font-medium">학교</th>
                            <th className="p-4 font-medium">전화번호</th>
                            <th className="p-4 font-medium">기수</th>
                            <th className="p-4 font-medium">코트</th>
                            <th className="p-4 font-medium text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredMembers.map((member) => (
                            <tr key={member.memberId} className="hover:bg-gray-50 transition">
                                {editingId === member.memberId ? (
                                    <>
                                        <td className="p-4"><input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="p-1 border rounded text-sm w-full" /></td>
                                        <td className="p-4"><input value={editForm.age || ''} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} className="p-1 border rounded text-sm w-16" /></td>
                                        <td className="p-4"><input value={editForm.university || ''} onChange={(e) => setEditForm({ ...editForm, university: e.target.value })} className="p-1 border rounded text-sm w-full" /></td>
                                        <td className="p-4 text-sm">{member.phone}</td>
                                        <td className="p-4"><input value={editForm.term || ''} onChange={(e) => setEditForm({ ...editForm, term: e.target.value })} className="p-1 border rounded text-sm w-20" /></td>
                                        <td className="p-4">
                                            <select value={editForm.court ?? ''} onChange={(e) => setEditForm({ ...editForm, court: e.target.value ? Number(e.target.value) : null })} className="p-1 border rounded text-sm">
                                                <option value="">미정</option>
                                                <option value="1">1코트</option>
                                                <option value="2">2코트</option>
                                                <option value="3">3코트</option>
                                                <option value="4">4코트</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => handleSaveEdit(member.memberId)} className="text-blue-600 text-xs font-bold hover:underline">저장</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs font-bold hover:underline">취소</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-medium text-gray-900">{member.name}</td>
                                        <td className="p-4">{member.age}년생</td>
                                        <td className="p-4">{member.university}</td>
                                        <td className="p-4">{member.phone}</td>
                                        <td className="p-4">{member.term}</td>
                                        <td className="p-4">
                                            {member.court ? (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${COURT_COLOR[member.court] || 'bg-gray-50 text-gray-500'}`}>
                                                    {member.court}코트
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">미정</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button onClick={() => startEdit(member)} className="text-gray-400 hover:text-blue-600 text-xl">✏️</button>
                                            <button onClick={() => handleDelete(member.memberId, member.name)} className="text-gray-400 hover:text-red-500 text-xl">🗑️</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 모바일 카드 리스트 */}
            <div className="lg:hidden space-y-4">
                {filteredMembers.map((member) => (
                    <div key={member.memberId} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="max-w-[60%]">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{member.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 truncate">{member.university}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {member.court ? (
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap ${COURT_COLOR[member.court] || 'bg-gray-50 text-gray-500'}`}>
                                        {member.court}코트
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gray-50 text-gray-400">미정</span>
                                )}
                                <button onClick={() => startEdit(member)} className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
                                    <span className="text-xs">✏️</span>
                                </button>
                                <button onClick={() => handleDelete(member.memberId, member.name)} className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 active:scale-95 transition-all">
                                    <span className="text-xs">🗑️</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t pt-4">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">기수/나이</p>
                                <p className="font-medium text-gray-700">{member.term} · {member.age}년생</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">전화번호</p>
                                <p className="font-medium text-gray-700 text-xs tabular-nums">{member.phone}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
