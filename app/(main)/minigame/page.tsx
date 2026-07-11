"use client";

import React, { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";

// --- 인터페이스 정의 ---
interface GameResult {
  id: string;
  gameId?: number; // 서버 게임 ID (POST /games 응답). 있으면 수정 시 서버에도 반영
  title: string;
  teamA: { names: string[]; score: number };
  teamB: { names: string[]; score: number };
  targetScore: number;
  date: string;
  createdAt: number; // 저장 시각(ms). 생성 후 1주일 뒤 자동 삭제 기준
}

// 브라우저 localStorage 저장 키 & 자동 삭제 기간(1주일)
// 서버에 /games 목록 조회(GET) 엔드포인트가 없어, 화면에 보여줄 "최근 기록"은 이 기기 캐시로 유지한다.
const STORAGE_KEY = "ybc-minigame-records";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// 날짜/시간 포맷 헬퍼 (서버 요청용)
const pad2 = (n: number) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const timeStr = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

// 승자 판별: "A" | "B" | "DRAW"
function getWinner(g: GameResult): "A" | "B" | "DRAW" {
  if (g.teamA.score > g.teamB.score) return "A";
  if (g.teamB.score > g.teamA.score) return "B";
  return "DRAW";
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
    gameId?: number; // 서버 게임 ID (생성 성공 시)
    startedAt: string; // 경기 시작 시각 (종료 API startTime용)
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

  // 기록 수정 상태 (수정 중인 경기 id + 편집 중인 점수)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScoreA, setEditScoreA] = useState("");
  const [editScoreB, setEditScoreB] = useState("");

  const scoreboardRef = useRef<HTMLDivElement>(null);

  // 최초 로드 시 localStorage에서 기록을 불러오며, 저장 후 1주일이 지난 경기는 자동 삭제
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: GameResult[] = JSON.parse(raw);
      const now = Date.now();
      const fresh = parsed.filter(
        (g) => g.createdAt && now - g.createdAt < ONE_WEEK_MS,
      );
      // localStorage는 SSR 시점엔 없어 초기값으로 못 쓰므로, 마운트 후 동기화한다
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGames(fresh);
      // 만료된 기록이 있었다면 정리된 목록을 즉시 다시 저장
      if (fresh.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      }
    } catch {
      // 파싱 실패 시 조용히 무시하고 빈 목록 유지
    }
  }, []);

  // 기록이 바뀔 때마다 localStorage에 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch {
      /* 저장 용량 초과 등은 무시 */
    }
  }, [games]);

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

  const finalizeGame = async (finalA: number, finalB: number) => {
    if (!activeGame) return;
    const winnerNames = (finalA > finalB ? activeGame.teamA : activeGame.teamB).join(" & ");

    // 서버에 경기 종료 반영 (PATCH /games/{gameId}/end). gameId가 있을 때만.
    if (activeGame.gameId) {
      try {
        await api.patch(`/games/${activeGame.gameId}/end`, {
          gameDate: todayStr(),
          startTime: activeGame.startedAt,
          endTime: timeStr(),
          team1Score: finalA,
          team2Score: finalB,
          winnerTeam: finalA > finalB ? "TEAM1" : "TEAM2",
        });
      } catch {
        console.warn("경기 종료 API 실패 — 기록은 로컬에만 저장됩니다.");
      }
    }

    const newResult: GameResult = {
      id: Date.now().toString(),
      gameId: activeGame.gameId,
      title: activeGame.title,
      teamA: { names: activeGame.teamA, score: finalA },
      teamB: { names: activeGame.teamB, score: finalB },
      targetScore: activeGame.targetScore,
      date: new Date().toLocaleString(),
      createdAt: Date.now(),
    };
    setGames([newResult, ...games]);
    alert(`🏆 ${winnerNames} 승리! (${finalA} : ${finalB})`);
    if (document.fullscreenElement) document.exitFullscreen();
    setActiveGame(null);
  };

  // --- 기록 수정 / 삭제 ---
  const startEdit = (game: GameResult) => {
    setEditingId(game.id);
    setEditScoreA(String(game.teamA.score));
    setEditScoreB(String(game.teamB.score));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditScoreA("");
    setEditScoreB("");
  };

  const saveEdit = async (id: string) => {
    const a = Number(editScoreA);
    const b = Number(editScoreB);
    if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0) {
      alert("점수를 올바르게 입력해주세요.");
      return;
    }

    const target = games.find((g) => g.id === id);

    // 서버에 완료 경기 수정 반영 (PATCH /games/{gameId}). gameId가 있을 때만.
    if (target?.gameId) {
      try {
        await api.patch(`/games/${target.gameId}`, {
          title: target.title,
          team1Member1: target.teamA.names[0],
          team1Member2: target.teamA.names[1],
          team2Member1: target.teamB.names[0],
          team2Member2: target.teamB.names[1],
          team1Score: a,
          team2Score: b,
        });
      } catch {
        console.warn("경기 수정 API 실패 — 로컬에만 반영됩니다.");
      }
    }

    setGames(
      games.map((g) =>
        g.id === id
          ? { ...g, teamA: { ...g.teamA, score: a }, teamB: { ...g.teamB, score: b } }
          : g,
      ),
    );
    cancelEdit();
  };

  const deleteGame = (id: string) => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    setGames(games.filter((g) => g.id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleCreateGame = async () => {
    if (!newGameTitle || playerNames.some(n => !n)) {
      alert("정보를 모두 입력해주세요.");
      return;
    }

    // 서버에 경기 생성 (POST /games). 실패해도 로컬로 진행 가능하도록 방어.
    let gameId: number | undefined;
    try {
      const res = await api.post("/games", {
        title: newGameTitle,
        team1Member1: playerNames[0],
        team1Member2: playerNames[1],
        team2Member1: playerNames[2],
        team2Member2: playerNames[3],
        targetScore,
      });
      gameId = res.data?.gameId;
    } catch {
      // 서버 연결 실패 시에도 점수판은 사용 가능 (기록은 로컬에만 저장)
      console.warn("경기 생성 API 실패 — 로컬 모드로 진행합니다.");
    }

    setActiveGame({
      gameId,
      startedAt: timeStr(),
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
          <button onClick={() => setIsCreating(true)} className="bg-[#A1C852] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#93bd41] active:scale-95 transition">새 경기</button>
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
            <button onClick={handleCreateGame} className="w-full py-4 bg-[#A1C852] text-white rounded-xl font-bold shadow-lg shadow-green-50 hover:bg-[#93bd41] active:scale-95 transition">시작하기</button>
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
                <span className="bg-green-100 text-[#5b6b0f] px-3 py-0.5 rounded-full text-[9px] font-black uppercase w-fit mb-1">{activeGame.title}</span>
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
          <div className="flex items-baseline justify-between mb-3 ml-1">
            <h3 className="text-lg font-black text-slate-800">최근 기록</h3>
            <span className="text-[10px] font-bold text-slate-300">기록은 1주일간 보관돼요</span>
          </div>
          <div className="grid gap-2.5">
            {games.length === 0 ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[24px] py-16 text-center">
                  <p className="text-slate-300 font-bold text-xs">기록된 경기가 없습니다.</p>
               </div>
            ) : (
              games.map((game) => {
                const winner = getWinner(game);
                const isEditing = editingId === game.id;
                return (
                  <div key={game.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-left min-w-0">
                        <p className="text-sm font-black truncate">{game.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{game.date}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(game.id)} className="px-3 py-1.5 rounded-lg bg-[#A1C852] text-white text-[11px] font-black active:scale-95 transition">저장</button>
                            <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-black active:scale-95 transition">취소</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(game)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-black hover:bg-slate-100 active:scale-95 transition">수정</button>
                            <button onClick={() => deleteGame(game.id)} className="px-3 py-1.5 rounded-lg bg-slate-50 text-red-400 text-[11px] font-black hover:bg-red-50 active:scale-95 transition">삭제</button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 팀별 결과 (승리 팀 강조 + WIN 배지) */}
                    <div className="mt-3 flex items-stretch gap-2">
                      <TeamResult
                        names={game.teamA.names}
                        score={game.teamA.score}
                        won={winner === "A"}
                        accent="blue"
                        editing={isEditing}
                        editValue={editScoreA}
                        onEditChange={setEditScoreA}
                      />
                      <div className="flex items-center text-slate-300 font-black text-sm">VS</div>
                      <TeamResult
                        names={game.teamB.names}
                        score={game.teamB.score}
                        won={winner === "B"}
                        accent="red"
                        editing={isEditing}
                        editValue={editScoreB}
                        onEditChange={setEditScoreB}
                      />
                    </div>
                  </div>
                );
              })
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

// 기록 카드의 팀별 결과 (승리 팀 강조 + 수정 모드 시 점수 인풋)
function TeamResult({
  names,
  score,
  won,
  accent,
  editing,
  editValue,
  onEditChange,
}: {
  names: string[];
  score: number;
  won: boolean;
  accent: "blue" | "red";
  editing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
}) {
  const accentText = accent === "blue" ? "text-blue-500" : "text-red-500";
  return (
    <div
      className={`flex-1 min-w-0 rounded-xl p-3 border transition-colors ${
        won
          ? "bg-[#f2f8e1] border-[#cfe39a]"
          : "bg-slate-50 border-transparent"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`text-[11px] font-black truncate ${accentText}`}>{names.join(" & ")}</span>
        {won && (
          <span className="shrink-0 bg-[#A1C852] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">WIN</span>
        )}
      </div>
      {editing ? (
        <input
          type="number"
          inputMode="numeric"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-16 text-center font-black text-xl bg-white border border-slate-200 rounded-lg py-1 outline-none focus:ring-1 focus:ring-[#A1C852]"
        />
      ) : (
        <p className={`font-black text-2xl ${won ? "text-[#5b6b0f]" : "text-slate-400"}`}>{score}</p>
      )}
    </div>
  );
}