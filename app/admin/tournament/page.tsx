'use client';

import React, { useState, useMemo } from 'react';
import { mockActivities } from './mock';

export default function TournamentPage() {
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [currentCourt, setCurrentCourt] = useState('1코트');

    // 1. 코트별 배치 인원 관리
    const [assignments, setAssignments] = useState<Record<string, string[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    // 2. 가변 경기 수를 지원하는 초기 대진표 생성 함수
    const createEmptyRow = () => ['', '', '', ''];
    const initialBracket = () => [
        createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()
    ];
    
    // 3. 코트별 대진표 상태 관리 (활동별 초기화 대응)
    const [courtBrackets, setCourtBrackets] = useState<Record<string, string[][]>>({
        '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
    });

    // 4. 진행도 계산 (전체 슬롯 대비 채워진 슬롯 비율)
    const progress = useMemo(() => {
        const totalSlots = Object.values(courtBrackets).flat(2).length;
        if (totalSlots === 0) return 0;
        const filledSlots = Object.values(courtBrackets).flat(2).filter(n => n !== '').length;
        return Math.floor((filledSlots / totalSlots) * 100);
    }, [courtBrackets]);

    // --- 핸들러 로직 ---

    // 활동 선택: 활동 변경 시 모든 데이터 초기화 (데이터 섞임 방지)
    const handleSelectActivity = (activity: any) => {
        if (selectedActivity?.id !== activity.id) {
            if (selectedActivity && !window.confirm("다른 활동으로 이동하시겠습니까? 현재 작성 중인 대진표는 초기화됩니다.")) {
                return;
            }
            setAssignments({ '1코트': [], '2코트': [], '3코트': [], '4코트': [] });
            setCourtBrackets({
                '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
            });
            setCurrentCourt('1코트');
        }
        setSelectedActivity(activity);
    };

    // 경기 수 조절 (+, -)
    const handleMatchCount = (type: 'plus' | 'minus') => {
        if (currentCourt === '전체') return;
        setCourtBrackets(prev => {
            const currentRows = [...prev[currentCourt]];
            if (type === 'plus') {
                if (currentRows.length >= 10) return prev; // 최대 10경기
                return { ...prev, [currentCourt]: [...currentRows, createEmptyRow()] };
            } else {
                if (currentRows.length <= 1) return prev; // 최소 1경기
                const lastRowEmpty = currentRows[currentRows.length - 1].every(cell => cell === '');
                if (!lastRowEmpty && !window.confirm("마지막 경기에 배치된 인원이 있습니다. 삭제하시겠습니까?")) {
                    return prev;
                }
                return { ...prev, [currentCourt]: currentRows.slice(0, -1) };
            }
        });
    };

    // 인원 배치 (미배치 -> 코트 멤버)
    const handleAssign = (name: string) => {
        if (currentCourt === '전체') return alert('코트를 선택해 주세요.');
        setAssignments(prev => ({ ...prev, [currentCourt]: [...prev[currentCourt], name] }));
    };

    // 멤버 삭제 (코트 멤버 및 대진표에서 제거)
    const handleRemoveMember = (court: string, name: string) => {
        setAssignments(prev => ({ ...prev, [court]: prev[court].filter(n => n !== name) }));
        setCourtBrackets(prev => {
            const updated = prev[court].map(row => row.map(cell => cell === name ? '' : cell));
            return { ...prev, [court]: updated };
        });
    };

    // 드래그 앤 드롭 로직
    const onDragStart = (e: React.DragEvent, name: string) => {
        e.dataTransfer.setData('memberName', name);
    };

    const onDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const name = e.dataTransfer.getData('memberName');
        if (name) {
            setCourtBrackets(prev => {
                const newB = [...prev[currentCourt].map(r => [...r])];
                newB[row][col] = name;
                return { ...prev, [currentCourt]: newB };
            });
        }
    };

    // 전체 초기화 (현재 코트)
    const handleClearAll = () => {
        if (currentCourt === '전체') return;
        if (window.confirm(`${currentCourt}의 대진표와 배치된 인원을 모두 초기화하시겠습니까?`)) {
            setCourtBrackets(prev => ({ ...prev, [currentCourt]: initialBracket() }));
            setAssignments(prev => ({ ...prev, [currentCourt]: [] }));
        }
    };

    const unassigned = selectedActivity?.participants.filter(
        (n: string) => !Object.values(assignments).flat().includes(n)
    ) || [];

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 text-left">
            {!selectedActivity ? (
                /* [화면 1] 투표 완료 목록 */
                <div className="space-y-6">
                    <header>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">대진 관리</h1>
                        <p className="text-gray-500 font-medium">투표가 완료된 운동을 선택하세요.</p>
                    </header>
                    <div className="grid grid-cols-1 gap-6">
                        {mockActivities.map((activity) => (
                            <div 
                                key={activity.id}
                                onClick={() => handleSelectActivity(activity)}
                                className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-sm hover:border-blue-500 cursor-pointer transition-all group"
                            >
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition">
                                    {activity.title}
                                </h3>
                                <div className="text-[15px] text-gray-500 space-y-2 leading-relaxed font-medium">
                                    <p>날짜: {activity.date}</p>
                                    <p>장소: {activity.location}</p>
                                    <p>참가 인원: {activity.participants.length}명</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* [화면 2] 대진 작성 상세 */
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border p-8">
                        <header className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{selectedActivity.title}</h1>
                                <button onClick={() => setSelectedActivity(null)} className="text-gray-400 text-sm font-bold mt-2 hover:text-gray-600">
                                    ← 목록으로
                                </button>
                            </div>
                            
                            {/* 진행도 바 */}
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#dadada]">
                                <span className="text-xs font-bold text-gray-600">전체 진행도</span>
                                <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden flex items-center">
                                    <div className="h-full bg-[#8DE45C] transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-lg font-bold text-gray-800 w-12">{progress}%</span>
                            </div>
                        </header>

                        {/* 코트 탭 메뉴 */}
                        <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-8">
                            {['1코트', '2코트', '3코트', '4코트', '전체'].map(c => (
                                <button key={c} onClick={() => setCurrentCourt(c)} className={`px-8 py-2 rounded-md text-sm font-bold ${currentCourt === c ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* 미배치 인원 섹션 */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">미배치 인원 ({unassigned.length})</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {unassigned.map((name: string) => (
                                    <button key={name} onClick={() => handleAssign(name)} className="bg-white border py-2 rounded text-xs hover:border-blue-500 transition shadow-sm">
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 현재 코트 멤버 섹션 */}
                        {currentCourt !== '전체' && (
                            <div className="bg-blue-50/50 rounded-xl p-6 border-2 border-dashed border-blue-100">
                                <p className="text-xs font-bold text-blue-500 mb-4">현재 코트 배치 멤버 (드래그하여 대진표에 배치)</p>
                                <div className="flex flex-wrap gap-2">
                                    {assignments[currentCourt].map(name => (
                                        <div key={name} draggable onDragStart={(e) => onDragStart(e, name)} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-grab shadow-sm transition hover:scale-105">
                                            {name}
                                            <button onClick={() => handleRemoveMember(currentCourt, name)} className="text-gray-300 hover:text-red-500 font-bold ml-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {currentCourt === '전체' ? (
                        /* 전체 탭 현황 */
                        <section className="animate-in fade-in duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-blue-600">전체 코트 대진 현황</h3>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-bold">
                                    총 {Object.values(courtBrackets).flat(2).filter(n => n !== '').length}명 배치됨
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(courtBrackets).map(([courtName, rows]) => (
                                    <div key={courtName} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                                            <span className="text-lg font-bold text-gray-800">{courtName}</span>
                                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                                                {rows.flat().filter(n => n !== '').length} 슬롯 채움
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {rows.map((row, idx) => {
                                                const isRowEmpty = row.every(cell => cell === '');
                                                return (
                                                    <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${isRowEmpty ? 'bg-gray-50/50' : 'bg-gray-50'}`}>
                                                        <div className="flex flex-1 justify-center gap-2">
                                                            <span className={`text-xs font-bold ${row[0] ? 'text-gray-700' : 'text-gray-300'}`}>{row[0] || '미정'}</span>
                                                            <span className="text-gray-300">:</span>
                                                            <span className={`text-xs font-bold ${row[1] ? 'text-gray-700' : 'text-gray-300'}`}>{row[1] || '미정'}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-200 mx-2">VS</span>
                                                        <div className="flex flex-1 justify-center gap-2">
                                                            <span className={`text-xs font-bold ${row[2] ? 'text-gray-700' : 'text-gray-300'}`}>{row[2] || '미정'}</span>
                                                            <span className="text-gray-300">:</span>
                                                            <span className={`text-xs font-bold ${row[3] ? 'text-gray-700' : 'text-gray-300'}`}>{row[3] || '미정'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        /* 개별 코트 대진표 구성 */
                        <section className="bg-white rounded-2xl shadow-sm border p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-xl font-bold text-gray-800">{currentCourt} 대진표 구성</h3>
                                    
                                    {/* 경기 수 조절 버튼 */}
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400">경기 수</span>
                                        <button onClick={() => handleMatchCount('minus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg text-gray-600 hover:text-red-500">-</button>
                                        <span className="text-lg font-bold text-gray-800 w-6 text-center">{courtBrackets[currentCourt].length}</span>
                                        <button onClick={() => handleMatchCount('plus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg text-gray-600 hover:text-blue-500">+</button>
                                    </div>
                                </div>
                                
                                <button onClick={handleClearAll} className="bg-white border hover:bg-gray-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                                    모두 비우기
                                </button>
                            </div>
                            <div className="bg-white rounded-[24px] p-12 space-y-6 shadow-md border border-gray-50">
                                {courtBrackets[currentCourt].map((rowArr, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center justify-center gap-4 animate-in slide-in-from-top-2">
                                        <span className="text-[10px] font-bold text-gray-300 w-8">G{rowIndex + 1}</span>
                                        <BracketCell name={rowArr[0]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 0)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][0] = '';
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <BracketCell name={rowArr[1]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 1)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][1] = '';
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <span className="text-3xl font-bold text-gray-200 mx-2">:</span>
                                        <BracketCell name={rowArr[2]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 2)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][2] = '';
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <BracketCell name={rowArr[3]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 3)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][3] = '';
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function BracketCell({ name, onDrop, onClear }: { name: string, onDrop: (e: React.DragEvent) => void, onClear: () => void }) {
    return (
        <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={onDrop} 
            className={`w-32 h-14 rounded-xl border-2 flex items-center justify-center relative transition-all ${
                name ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-100 bg-gray-50 border-dashed'
            }`}
        >
            {name ? (
                <>
                    <span className="text-sm font-bold text-gray-800">{name}</span>
                    <button onClick={onClear} className="absolute -top-2 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm hover:text-red-500 font-bold transition">✕</button>
                </>
            ) : <span className="text-[10px] text-gray-300 font-bold uppercase">Drag Here</span>}
        </div>
    );
}