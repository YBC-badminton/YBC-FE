'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Mail, Phone, Edit2, Check, X, Plus } from 'lucide-react';
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

type MemberForm = Omit<Member, 'memberId'>;

const EMPTY_FORM: MemberForm = {
    name: '', university: '', phone: '', email: '', gender: 'MALE', age: '', term: '', isMapoResident: false,
};

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

    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<MemberForm>(EMPTY_FORM);

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

    const handleAdd = async () => {
        if (!addForm.name || !addForm.phone) {
            showToast('이름과 연락처는 필수입니다.', 'error');
            return;
        }
        try {
            await api.post('/admin/members', addForm);
            setAddForm(EMPTY_FORM);
            setShowAddForm(false);
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

                    <button
                        onClick={() => setShowAddForm(v => !v)}
                        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> 부원 추가
                    </button>
                </div>

                {showAddForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="font-black text-gray-800 mb-4">새 부원 추가</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <input placeholder="이름" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <input placeholder="학교" value={addForm.university} onChange={(e) => setAddForm({ ...addForm, university: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <input placeholder="전화번호" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <input placeholder="이메일" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as 'MALE' | 'FEMALE' })} className="p-2.5 border rounded-lg text-sm bg-white">
                                <option value="MALE">남</option>
                                <option value="FEMALE">여</option>
                            </select>
                            <input placeholder="나이 (예: 01)" value={addForm.age} onChange={(e) => setAddForm({ ...addForm, age: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <input placeholder="기수 (예: 10)" value={addForm.term} onChange={(e) => setAddForm({ ...addForm, term: e.target.value })} className="p-2.5 border rounded-lg text-sm" />
                            <label className="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm bg-white cursor-pointer">
                                <input type="checkbox" checked={addForm.isMapoResident} onChange={(e) => setAddForm({ ...addForm, isMapoResident: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="font-bold text-gray-700">마포구 거주</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }} className="px-4 py-2 text-sm font-bold text-gray-500 border rounded-lg hover:bg-gray-50">취소</button>
                            <button onClick={handleAdd} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">추가 완료</button>
                        </div>
                    </div>
                )}
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
                                        <td className="p-3 w-24"><input className="w-full border p-1 rounded text-sm" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                                        <td className="p-3 w-16"><select className="w-full border p-1 rounded text-sm" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value as 'MALE' | 'FEMALE'})}><option value="MALE">남</option><option value="FEMALE">여</option></select></td>
                                        <td className="p-3 w-20"><input className="w-full border p-1 rounded text-sm" value={editForm.age || ''} onChange={e => setEditForm({...editForm, age: e.target.value})} /></td>
                                        <td className="p-3 w-32"><input className="w-full border p-1 rounded text-sm" value={editForm.university || ''} onChange={e => setEditForm({...editForm, university: e.target.value})} /></td>
                                        <td className="p-3 w-20"><input className="w-full border p-1 rounded text-sm" value={editForm.term || ''} onChange={e => setEditForm({...editForm, term: e.target.value})} /></td>
                                        <td className="p-3 w-40"><input className="w-full border p-1 rounded text-sm" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></td>
                                        <td className="p-3 w-40"><input className="w-full border p-1 rounded text-sm" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} /></td>
                                        <td className="p-3 w-16 text-center"><input type="checkbox" checked={!!editForm.isMapoResident} onChange={e => setEditForm({...editForm, isMapoResident: e.target.checked})} /></td>
                                        <td className="p-3 w-24 flex justify-center items-center h-full gap-2">
                                            <button onClick={() => handleSaveEdit(m.memberId)} className="text-blue-600 font-bold"><Check className="w-5 h-5"/></button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 font-bold"><X className="w-5 h-5"/></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-bold w-24"><p className="p-[1px]">{m.name}</p></td>
                                        <td className="p-4 w-16"><p className="p-[1px]">{GENDER_LABEL[m.gender]}</p></td>
                                        <td className="p-4 w-20"><p className="p-[1px]">{m.age}년생</p></td>
                                        <td className="p-4 w-32"><p className="p-[1px]">{m.university}</p></td>
                                        <td className="p-4 w-20"><p className="p-[1px]">{m.term}</p></td>
                                        <td className="p-4 w-40"><p className="p-[1px]">{m.phone}</p></td>
                                        <td className="p-4 w-40 truncate"><p className="p-[1px]">{m.email}</p></td>
                                        <td className="p-4 w-16 text-center"><p className="p-[1px]">{m.isMapoResident ? 'O' : 'X'}</p></td>
                                        <td className="p-4 w-24 flex justify-center items-center gap-3">
                                            <button onClick={() => { setEditingId(m.memberId); setEditForm(m); }} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(m.memberId, m.name)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 모바일 카드 리스트 */}
                <div className="lg:hidden divide-y divide-gray-100">
                    {filteredMembers.map((m) => (
                        <div key={m.memberId} className="p-4">
                            {editingId === m.memberId ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input className="border p-2 rounded text-sm" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="이름" />
                                        <select className="border p-2 rounded text-sm bg-white" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value as 'MALE' | 'FEMALE' })}>
                                            <option value="MALE">남</option>
                                            <option value="FEMALE">여</option>
                                        </select>
                                        <input className="border p-2 rounded text-sm" value={editForm.age || ''} onChange={e => setEditForm({ ...editForm, age: e.target.value })} placeholder="나이" />
                                        <input className="border p-2 rounded text-sm" value={editForm.term || ''} onChange={e => setEditForm({ ...editForm, term: e.target.value })} placeholder="기수" />
                                        <input className="border p-2 rounded text-sm col-span-2" value={editForm.university || ''} onChange={e => setEditForm({ ...editForm, university: e.target.value })} placeholder="학교" />
                                        <input className="border p-2 rounded text-sm col-span-2" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="연락처" />
                                        <input className="border p-2 rounded text-sm col-span-2" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="이메일" />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={!!editForm.isMapoResident} onChange={e => setEditForm({ ...editForm, isMapoResident: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="font-bold text-gray-700">마포구 거주</span>
                                    </label>
                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => handleSaveEdit(m.memberId)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm"><Check className="w-4 h-4" /> 저장</button>
                                        <button onClick={() => setEditingId(null)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-500 rounded-lg font-bold text-sm"><X className="w-4 h-4" /> 취소</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-black text-lg text-gray-800">
                                                {m.name}
                                                <span className="ml-2 text-sm font-bold text-gray-400">{m.term}기 · {GENDER_LABEL[m.gender]} · {m.age}년생</span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-500 mt-0.5">{m.university}</div>
                                        </div>
                                        <div className="flex gap-3 shrink-0">
                                            <button onClick={() => { setEditingId(m.memberId); setEditForm(m); }} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(m.memberId, m.name)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1.5 text-sm font-bold text-gray-600">
                                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {m.phone}</div>
                                        <div className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 text-gray-400 shrink-0" /> {m.email}</div>
                                        <div className="text-xs text-gray-500">마포구 거주: {m.isMapoResident ? 'O' : 'X'}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {filteredMembers.length === 0 && (
                        <div className="p-8 text-center text-gray-400 font-bold text-sm">부원이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}