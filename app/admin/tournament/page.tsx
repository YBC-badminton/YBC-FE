'use client';

import React, { useState, useMemo, useRef } from 'react';
import { mockActivities } from './mock';
import html2canvas from 'html2canvas'; // 이미지 저장용

// 1. 데이터 구조 정의
interface Participant {
    name: string;
    gender: '남' | '여';
}

interface Activity {
    id: string;
    title: string;
    date: string;
    location: string;
    participants: Participant[];
}

export default function TournamentPage() {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [currentCourt, setCurrentCourt] = useState('1코트');
    //완료된 활동 ID들을 관리하는 상태 (실제 서비스에서는 DB 데이터 기반)
    const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
    
    // 이미지 캡처를 위한 Ref
    const printRef = useRef<HTMLDivElement>(null);

    // 2. 코트별 배치 인원 관리 (Participant 객체 배열로 관리)
    const [assignments, setAssignments] = useState<Record<string, Participant[]>>({
        '1코트': [], '2코트': [], '3코트': [], '4코트': []
    });

    // 3. 가변 경기 수를 지원하는 초기 대진표 생성 함수
    const createEmptyRow = () => [null, null, null, null];
    const initialBracket = () => [
        createEmptyRow(), createEmptyRow(), createEmptyRow(), createEmptyRow()
    ];
    
    // 4. 코트별 대진표 상태 관리 (Participant 객체 또는 null 저장)
    const [courtBrackets, setCourtBrackets] = useState<Record<string, (Participant | null)[][]>>({
        '1코트': initialBracket(), '2코트': initialBracket(), '3코트': initialBracket(), '4코트': initialBracket(),
    });

    // 5. 진행도 계산
    const progress = useMemo(() => {
        const totalSlots = Object.values(courtBrackets).flat(2).length;
        if (totalSlots === 0) return 0;
        const filledSlots = Object.values(courtBrackets).flat(2).filter(n => n !== null).length;
        return Math.floor((filledSlots / totalSlots) * 100);
    }, [courtBrackets]);

    // --- 핸들러 로직 ---

    const handleSelectActivity = (activity: Activity) => {
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

    const handleMatchCount = (type: 'plus' | 'minus') => {
        if (currentCourt === '전체') return;
        setCourtBrackets(prev => {
            const currentRows = [...prev[currentCourt]];
            if (type === 'plus') {
                if (currentRows.length >= 10) return prev;
                return { ...prev, [currentCourt]: [...currentRows, createEmptyRow()] };
            } else {
                if (currentRows.length <= 1) return prev;
                const lastRowEmpty = currentRows[currentRows.length - 1].every(cell => cell === null);
                if (!lastRowEmpty && !window.confirm("마지막 경기에 배치된 인원이 있습니다. 삭제하시겠습니까?")) {
                    return prev;
                }
                return { ...prev, [currentCourt]: currentRows.slice(0, -1) };
            }
        });
    };

    const handleAssign = (person: Participant) => {
        if (currentCourt === '전체') return alert('코트를 선택해 주세요.');
        setAssignments(prev => ({ ...prev, [currentCourt]: [...prev[currentCourt], person] }));
    };

    const handleRemoveMember = (court: string, person: Participant) => {
        setAssignments(prev => ({ ...prev, [court]: prev[court].filter(p => p.name !== person.name) }));
        setCourtBrackets(prev => {
            const updated = prev[court].map(row => row.map(cell => cell?.name === person.name ? null : cell));
            return { ...prev, [court]: updated };
        });
    };

    const onDragStart = (e: React.DragEvent, person: Participant) => {
        e.dataTransfer.setData('memberData', JSON.stringify(person));
    };

    const onDrop = (e: React.DragEvent, row: number, col: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('memberData');
        
        if (data) {
            const person: Participant = JSON.parse(data);
            
            // 1. 현재 선택된 코트의 해당 줄(row) 데이터를 가져옵니다.
            const currentRow = courtBrackets[currentCourt][row];

            // 2. 해당 줄에 이미 같은 이름이 있는지 확인합니다.
            const isDuplicate = currentRow.some(cell => cell?.name === person.name);

            if (isDuplicate) {
                // 중복된 경우 경고창을 띄우고 로직을 중단합니다.
                alert(`[중복 주의] ${person.name}님은 이미 이 경기에 배치되어 있습니다.`);
                return;
            }

            // 3. 중복이 아닐 경우에만 배치를 진행합니다.
            setCourtBrackets(prev => {
                const newB = [...prev[currentCourt].map(r => [...r])];
                newB[row][col] = person;
                return { ...prev, [currentCourt]: newB };
            });
        }
    };

    const handleClearAll = () => {
        if (currentCourt === '전체') return;
        if (window.confirm(`${currentCourt}의 대진표와 배치된 인원을 모두 초기화하시겠습니까?`)) {
            setCourtBrackets(prev => ({ ...prev, [currentCourt]: initialBracket() }));
            setAssignments(prev => ({ ...prev, [currentCourt]: [] }));
        }
    };

    const unassigned = selectedActivity?.participants.filter(
        (p) => !Object.values(assignments).flat().some(a => a.name === p.name)
    ) || [];

    // --- 랜덤 배치 핸들러 ---
    const handleRandomAssign = () => {
        const currentMembers = assignments[currentCourt];
        
        if (currentMembers.length < 4) {
            alert('랜덤 배치를 위해서는 최소 4명의 멤버가 코트에 배치되어야 합니다.');
            return;
        }

        if (!window.confirm(`현재 설정된 ${courtBrackets[currentCourt].length}경기를 중복 없이 랜덤 배치하시겠습니까?`)) {
            return;
        }

        const rowCount = courtBrackets[currentCourt].length;
        const newBracket: (Participant | null)[][] = [];

        // 1. 랜덤하게 섞인 전체 인원 풀 준비
        let pool: Participant[] = [];
        
        for (let r = 0; r < rowCount; r++) {
            const currentRow: (Participant | null)[] = [null, null, null, null];
            
            for (let c = 0; c < 4; c++) {
                // 풀이 비었거나 적절한 인원이 없을 때 다시 셔플하여 보충
                if (pool.length === 0) {
                    pool = [...currentMembers].sort(() => Math.random() - 0.5);
                }

                // 2. 현재 줄(currentRow)에 없는 사람을 풀에서 찾기
                let candidateIdx = pool.findIndex(p => !currentRow.some(cell => cell?.name === p.name));

                // 만약 풀에 있는 모든 사람이 현재 줄에 이미 있다면 (인원이 아주 적은 경우)
                // 어쩔 수 없이 첫 번째 사람을 꺼내고, 풀을 다시 섞어 보충
                if (candidateIdx === -1) {
                    pool = [...currentMembers].sort(() => Math.random() - 0.5);
                    candidateIdx = pool.findIndex(p => !currentRow.some(cell => cell?.name === p.name));
                }

                // 최종 결정된 인원을 배치하고 풀에서 제거
                const selectedPerson = pool.splice(candidateIdx, 1)[0];
                currentRow[c] = selectedPerson;
            }
            newBracket.push(currentRow as Participant[]);
        }

        setCourtBrackets(prev => ({
            ...prev,
            [currentCourt]: newBracket
        }));
    };

    // --- 대진 확정 및 백엔드 전송 핸들러 ---
    const handleSaveTournament = async () => {
        if (!selectedActivity) return;

        try {
            // 1. 백엔드 전송 데이터 구성
            const payload = {
                activityId: selectedActivity.id,
                brackets: courtBrackets, // 코트별 대진 정보
                timestamp: new Date().toISOString()
            };

            console.log("백엔드로 전송될 데이터:", payload);
            // const response = await axios.post('/api/tournament/save', payload);
            
            // 2. 전송 완료 처리 (Mock)
            alert('대진 정보가 백엔드로 성공적으로 전송되었습니다.');
            setCompletedActivityIds(prev => [...prev, selectedActivity.id]);
            
            // 3. 목록으로 돌아가기
            setSelectedActivity(null);
        } catch (error) {
            alert('전송 중 오류가 발생했습니다.');
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 text-left">
            {!selectedActivity ? (
                <div className="space-y-6">
                    <header>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">대진 관리</h1>
                        <p className="text-gray-500 font-medium">투표가 완료된 운동을 선택하세요.</p>
                    </header>
                    <div className="grid grid-cols-1 gap-6">
                        {mockActivities.map((activity) => {
                            const isCompleted = completedActivityIds.includes(activity.id);
                            return (
                                <div 
                                    key={activity.id}
                                    onClick={() => handleSelectActivity(activity as Activity)}
                                    className={`bg-white p-10 rounded-[24px] border ${isCompleted ? 'border-green-500 bg-green-50/30' : 'border-gray-100'} shadow-sm hover:border-blue-500 cursor-pointer transition-all group relative`}
                                >
                                    {isCompleted && (
                                        <span className="absolute top-6 right-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            대진 작성 완료
                                        </span>
                                    )}
                                    <h3 className={`text-2xl font-bold ${isCompleted ? 'text-green-700' : 'text-gray-800'} mb-4 group-hover:text-blue-600 transition`}>
                                        {activity.title}
                                    </h3>
                                    <div className="text-[15px] text-gray-500 space-y-2 leading-relaxed font-medium">
                                        <p>날짜: {activity.date}</p>
                                        <p>참가 인원: {activity.participants.length}명</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border p-8">
                        <header className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{selectedActivity.title}</h1>
                                <button onClick={() => setSelectedActivity(null)} className="text-gray-400 text-sm font-bold mt-2 hover:text-gray-600">
                                    ← 목록으로
                                </button>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#dadada]">
                                <span className="text-xs font-bold text-gray-600">전체 진행도</span>
                                <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden flex items-center">
                                    <div className="h-full bg-[#8DE45C] transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-lg font-bold text-gray-800 w-12">{progress}%</span>
                            </div>
                        </header>

                        <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-8">
                            {['1코트', '2코트', '3코트', '4코트', '전체'].map(c => (
                                <button key={c} onClick={() => setCurrentCourt(c)} className={`px-8 py-2 rounded-md text-sm font-bold ${currentCourt === c ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* 미배치 인원 섹션 (성별 표시 추가) */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">미배치 인원 ({unassigned.length})</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                {unassigned.map((p) => (
                                    <button 
                                        key={p.name} 
                                        onClick={() => handleAssign(p)} 
                                        className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs flex justify-between items-center hover:border-blue-500 transition shadow-sm"
                                    >
                                        <span className="font-bold text-gray-700">{p.name}</span>
                                        <span className={`text-[10px] font-medium ${p.gender === '남' ? 'text-blue-400' : 'text-red-400'}`}>
                                            {p.gender}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 현재 코트 멤버 섹션 */}
                        {currentCourt !== '전체' && (
                            <div className="bg-blue-50/50 rounded-xl p-6 border-2 border-dashed border-blue-100">
                                <p className="text-xs font-bold text-blue-500 mb-4">현재 코트 배치 멤버 (드래그하여 대진표에 배치)</p>
                                <div className="flex flex-wrap gap-2">
                                    {assignments[currentCourt].map(p => (
                                        <div key={p.name} draggable onDragStart={(e) => onDragStart(e, p)} className="bg-white border-2 border-blue-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-grab shadow-sm transition hover:scale-105">
                                            <span>{p.name}</span>
                                            <span className="text-[10px] opacity-40 font-medium">{p.gender}</span>
                                            <button onClick={() => handleRemoveMember(currentCourt, p)} className="text-gray-300 hover:text-red-500 font-bold ml-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {currentCourt === '전체' ? (
                        <section className="animate-in fade-in duration-500 space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-blue-600">전체 코트 대진 현황</h3>
                                
                                <div className="flex gap-3">
                                    {/* [핵심] 진행도 100%일 때만 전송 버튼 노출 */}
                                    {progress === 100 && (
                                        <button 
                                            onClick={handleSaveTournament}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl text-sm font-bold animate-bounce shadow-lg"
                                        >
                                            ✅ 대진 확정 및 전송
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* 캡처할 영역 지정 (ref 추가) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-3xl">
                                {Object.entries(courtBrackets).map(([courtName, rows]) => (
                                    <div key={courtName} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                                            <span className="text-lg font-bold text-gray-800">{courtName}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {rows.map((row, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                                    <div className="flex flex-1 justify-center gap-2">
                                                        <span className="text-xs font-bold text-gray-700">{row[0]?.name || '미정'}</span>
                                                        <span className="text-gray-300">:</span>
                                                        <span className="text-xs font-bold text-gray-700">{row[1]?.name || '미정'}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-200 mx-2">VS</span>
                                                    <div className="flex flex-1 justify-center gap-2">
                                                        <span className="text-xs font-bold text-gray-700">{row[2]?.name || '미정'}</span>
                                                        <span className="text-gray-300">:</span>
                                                        <span className="text-xs font-bold text-gray-700">{row[3]?.name || '미정'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <section className="bg-white rounded-2xl shadow-sm border p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-xl font-bold text-gray-800">{currentCourt} 대진표 구성</h3>
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-400">경기 수</span>
                                        <button onClick={() => handleMatchCount('minus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg text-gray-600 hover:text-red-500">-</button>
                                        <span className="text-lg font-bold text-gray-800 w-6 text-center">{courtBrackets[currentCourt].length}</span>
                                        <button onClick={() => handleMatchCount('plus')} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg text-gray-600 hover:text-blue-500">+</button>
                                    </div>
                                </div>
                                {/* 버튼 그룹 */}
                                <div className="flex gap-2">
                                    {/* 랜덤 배치 버튼 */}
                                    <button 
                                        onClick={handleRandomAssign}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                                    >
                                        랜덤 배치
                                    </button>
                                    {/* 모두 비우기 버튼 */}
                                    <button 
                                        onClick={handleClearAll} 
                                        className="bg-white border hover:bg-gray-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                                    >
                                        모두 비우기
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[24px] p-12 space-y-6 shadow-md border border-gray-50">
                                {courtBrackets[currentCourt].map((rowArr, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center justify-center gap-4 animate-in slide-in-from-top-2">
                                        <span className="text-[10px] font-bold text-gray-300 w-8">G{rowIndex + 1}</span>
                                        <BracketCell person={rowArr[0]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 0)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][0] = null;
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <BracketCell person={rowArr[1]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 1)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][1] = null;
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <span className="text-3xl font-bold text-gray-200 mx-2">:</span>
                                        <BracketCell person={rowArr[2]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 2)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][2] = null;
                                            setCourtBrackets(prev => ({ ...prev, [currentCourt]: nb }));
                                        }} />
                                        <BracketCell person={rowArr[3]} onDrop={(e: React.DragEvent) => onDrop(e, rowIndex, 3)} onClear={() => {
                                            const nb = [...courtBrackets[currentCourt].map(r => [...r])]; nb[rowIndex][3] = null;
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

function BracketCell({ person, onDrop, onClear }: { person: Participant | null, onDrop: (e: React.DragEvent) => void, onClear: () => void }) {
    return (
        <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={onDrop} 
            className={`w-32 h-14 rounded-xl border-2 flex items-center justify-center relative transition-all ${
                person ? 'border-green-400 bg-green-50 shadow-sm' : 'border-gray-100 bg-gray-50 border-dashed'
            }`}
        >
            {person ? (
                <>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-800">{person.name}</span>
                        <span className={`text-[9px] font-bold ${person.gender === '남' ? 'text-blue-400' : 'text-red-400'}`}>
                            {person.gender}
                        </span>
                    </div>
                    <button onClick={onClear} className="absolute -top-2 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm hover:text-red-500 font-bold transition">✕</button>
                </>
            ) : <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Drag Here</span>}
        </div>
    );
}