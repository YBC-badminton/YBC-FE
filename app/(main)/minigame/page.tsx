"use client";

import React, { useState, useRef } from "react";

// --- 인터페이스 정의 ---
interface GameResult {
  id: string;
  title: string;
  teamA: { names: string[]; score: number };
  teamB: { names: string[]; score: number };
  targetScore: number;
  date: string;
}

interface GameState {
  scoreA: number;
  scoreB: number;
  servingTeam: "A" | "B";
}

export default function BadmintonGameManager() {
  const [games, setGames] = useState<GameResult[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeGame, setActiveGame] = useState<{
    title: string;
    teamA: string[];
    teamB: string[];
    targetScore: number;
    scoreA: number;
    scoreB: number;
    servingTeam: "A" | "B";
    isFinished: boolean;
  } | null>(null);

  const [history, setHistory] = useState<GameState[]>([]);
  const [newGameTitle, setNewGameTitle] = useState("");
  const [playerNames, setPlayerNames] = useState(["", "", "", ""]);
  const [targetScore, setTargetScore] = useState(25);

  const scoreboardRef = useRef<HTMLDivElement>(null);

  // --- 전체 화면 및 가로 고정 핸들러 ---
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await scoreboardRef.current?.requestFullscreen();
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock("landscape").catch(() => {});
        }
      } catch (err: any) {
        alert(`전체 화면 실패: ${err.message}`);
      }
    } else {
      document.exitFullscreen();
    }
  };

  const handleScoreUpdate = (team: "A" | "B") => {
    if (!activeGame || activeGame.isFinished) return;

    setHistory([...history, { 
      scoreA: activeGame.scoreA, 
      scoreB: activeGame.scoreB, 
      servingTeam: activeGame.servingTeam 
    }]);
    
    const isA = team === "A";
    const nextScoreA = isA ? activeGame.scoreA + 1 : activeGame.scoreA;
    const nextScoreB = !isA ? activeGame.scoreB + 1 : activeGame.scoreB;

    let isGameOver = false;
    const target = activeGame.targetScore;

    if (nextScoreA === 31 || nextScoreB === 31) isGameOver = true;
    else if (nextScoreA >= 24 && nextScoreB >= 24) {
      if (Math.abs(nextScoreA - nextScoreB) >= 2) isGameOver = true;
    }
    else if (nextScoreA >= target || nextScoreB >= target) isGameOver = true;

    setActiveGame({
      ...activeGame,
      scoreA: nextScoreA,
      scoreB: nextScoreB,
      servingTeam: team,
      isFinished: isGameOver
    });

    if (isGameOver) {
      setTimeout(() => finalizeGame(nextScoreA, nextScoreB), 800);
    }
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (history.length === 0 || !activeGame || activeGame.isFinished) return;
    const lastState = history[history.length - 1];
    setActiveGame({
      ...activeGame,
      scoreA: lastState.scoreA,
      scoreB: lastState.scoreB,
      servingTeam: lastState.servingTeam,
      isFinished: false,
    });
    setHistory(history.slice(0, -1));
  };

  const finalizeGame = (finalA: number, finalB: number) => {
    if (!activeGame) return;
    const newResult: GameResult = {
      id: Date.now().toString(),
      title: activeGame.title,
      teamA: { names: activeGame.teamA, score: finalA },
      teamB: { names: activeGame.teamB, score: finalB },
      targetScore: activeGame.targetScore,
      date: new Date().toLocaleString(),
    };
    setGames([newResult, ...games]);
    alert(`${finalA > finalB ? '팀 A' : '팀 B'} 승리!`);
    if (document.fullscreenElement) document.exitFullscreen();
    setActiveGame(null);
  };

  const handleCreateGame = () => {
    if (!newGameTitle || playerNames.some(n => !n)) {
      alert("정보를 모두 입력해주세요.");
      return;
    }
    setActiveGame({
      title: newGameTitle,
      teamA: [playerNames[0], playerNames[1]],
      teamB: [playerNames[2], playerNames[3]],
      targetScore: targetScore,
      scoreA: 0,
      scoreB: 0,
      servingTeam: "A",
      isFinished: false,
    });
    setHistory([]);
    setIsCreating(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-left py-20 font-sans overflow-x-hidden">
      <header className="mb-6 flex justify-between items-end px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">양배추 미니게임</h1>
        </div>
        {!activeGame && !isCreating && (
          <button onClick={() => setIsCreating(true)} className="bg-[#1E8A44] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition">새 경기</button>
        )}
      </header>

      {/* 1. 게임 생성 폼 (닫기 버튼 추가됨) */}
      {isCreating && (
        <section className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 mb-8 relative animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">경기 정보 입력</h2>
            <button 
              onClick={() => setIsCreating(false)}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="space-y-4 text-left">
            <input type="text" placeholder="경기 제목" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" value={newGameTitle} onChange={e => setNewGameTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-3 text-left">
              {playerNames.map((name, i) => (
                <input key={i} type="text" placeholder={`선수 ${i + 1}`} className="p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm" value={name} onChange={e => { const p = [...playerNames]; p[i] = e.target.value; setPlayerNames(p); }} />
              ))}
            </div>
            <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}>
              <option value={11}>11점</option><option value={21}>21점</option><option value={25}>25점</option>
            </select>
            <button onClick={handleCreateGame} className="w-full py-4 bg-[#1E8A44] text-white rounded-xl font-bold shadow-lg shadow-green-50 active:scale-95 transition">시작하기</button>
          </div>
        </section>
      )}

      {/* 2. 점수판 */}
      {activeGame && (
        <section 
          ref={scoreboardRef}
          className="bg-white rounded-[32px] p-4 sm:p-6 shadow-2xl border border-gray-50 relative flex flex-col h-[80vh] sm:h-auto max-h-[100vh] overflow-hidden"
        >
          <div className="flex justify-between items-center mb-2 z-20">
             <div className="flex flex-col">
                <span className="bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-[9px] font-black uppercase w-fit mb-1">{activeGame.title}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {activeGame.isFinished ? "Finished" : `${activeGame.targetScore} PTS Match`}
                </span>
             </div>
             <div className="flex gap-2">
                <button onClick={toggleFullscreen} className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
                <button onClick={handleUndo} disabled={history.length === 0 || activeGame.isFinished} className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${history.length > 0 && !activeGame.isFinished ? 'bg-slate-100 text-slate-600' : 'bg-gray-50 text-gray-200'}`}>↩ UNDO</button>
             </div>
          </div>

          <div className="flex flex-1 gap-2 sm:gap-6 items-stretch overflow-hidden">
            <div 
              onClick={() => handleScoreUpdate("A")}
              className={`flex-1 text-center p-2 rounded-[24px] transition-all flex flex-col justify-between border-2 ${activeGame.servingTeam === 'A' ? 'bg-blue-50/30 border-blue-100' : 'bg-white border-transparent'}`}
            >
              <div className="text-blue-500 font-black text-[10px] bg-blue-50 py-1 px-2 rounded-lg w-fit mx-auto mt-2 truncate max-w-[90%]">{activeGame.teamA.join(" & ")}</div>
              <div className={`font-black select-none leading-none flex items-center justify-center transition-all ${activeGame.servingTeam === 'A' ? 'text-slate-800' : 'text-slate-200'}`} style={{ fontSize: 'min(35vh, 25vw)' }}>
                {activeGame.scoreA}
              </div>
              <div className={`text-[9px] font-black uppercase mb-2 ${activeGame.servingTeam === 'A' && !activeGame.isFinished ? 'text-blue-400' : 'opacity-0'}`}>Serving</div>
            </div>

            <div 
              onClick={() => handleScoreUpdate("B")}
              className={`flex-1 text-center p-2 rounded-[24px] transition-all flex flex-col justify-between border-2 ${activeGame.servingTeam === 'B' ? 'bg-red-50/30 border-red-100' : 'bg-white border-transparent'}`}
            >
              <div className="text-red-500 font-black text-[10px] bg-red-50 py-1 px-2 rounded-lg w-fit mx-auto mt-2 truncate max-w-[90%]">{activeGame.teamB.join(" & ")}</div>
              <div className={`font-black select-none leading-none flex items-center justify-center transition-all ${activeGame.servingTeam === 'B' ? 'text-slate-800' : 'text-slate-200'}`} style={{ fontSize: 'min(35vh, 25vw)' }}>
                {activeGame.scoreB}
              </div>
              <div className={`text-[9px] font-black uppercase mb-2 ${activeGame.servingTeam === 'B' && !activeGame.isFinished ? 'text-red-400' : 'opacity-0'}`}>Serving</div>
            </div>
          </div>
          
          <button onClick={() => { if(confirm("중단할까요?")) setActiveGame(null); }} className="mt-2 text-gray-300 text-[8px] font-black uppercase tracking-widest">Discard Match</button>
        </section>
      )}

      {/* 3. 최근 기록 */}
      {!activeGame && !isCreating && (
        <section className="mt-6 text-left">
          <h3 className="text-lg font-black text-slate-800 mb-3 ml-1">최근 기록</h3>
          <div className="grid gap-2">
            {games.length === 0 ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[24px] py-16 text-center">
                  <p className="text-slate-300 font-bold text-xs">기록된 경기가 없습니다.</p>
               </div>
            ) : (
              games.map(game => (
                <div key={game.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="text-left">
                    <p className="text-sm font-black">{game.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{game.date}</p>
                  </div>
                  <div className="font-black text-blue-600 bg-slate-50 px-3 py-1 rounded-lg">
                    {game.teamA.score} <span className="text-slate-300">:</span> {game.teamB.score}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <style jsx global>{`
        :fullscreen {
          background-color: #ffffff !important;
          padding: 10px !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}</style>
    </div>
  );
}