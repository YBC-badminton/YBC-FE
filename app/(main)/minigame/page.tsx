"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// --- 서버 API 응답용 인터페이스 ---
interface ServerGameItem {
  gameId: number;
  title: string;
  team1Member1: string;
  team1Member2: string;
  team2Member1: string;
  team2Member2: string;
  team1Score: number;
  team2Score: number;
  winnerTeam: "TEAM1" | "TEAM2" | "DRAW";
  startTime: string;
  endTime?: string;
  isCreator?: boolean; // 서버에서 반환하는 본인 작성 여부
}

interface ServerGamesResponse {
  games: ServerGameItem[];
}

// --- 클라이언트 내부 화면 표현용 인터페이스 ---
interface GameResult {
  id: string;
  gameId: number; // 서버 게임 ID
  title: string;
  teamA: { names: string[]; score: number };
  teamB: { names: string[]; score: number };
  targetScore: number;
  date: string;
  isCreator: boolean; // 수정/삭제 권한 판단용
}

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

// "2026-07-19T14:00:00" -> "2026.07.19 14:00" 포맷 변환
const formatDisplayDate = (isoStr: string) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  } catch {
    return isoStr;
  }
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeGame, setActiveGame] = useState<{
    gameId: number; // 서버 게임 ID
    startedAt: string; // 경기 시작 시각
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

  // --- 1. 미니게임 목록 조회 API 호출 ---
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ServerGamesResponse>("/games");
      const serverList = res.data?.games || [];

      // 서버 응답 데이터를 화면 구조에 맞게 매핑
      const formatted: GameResult[] = serverList.map((item) => ({
        id: String(item.gameId),
        gameId: item.gameId,
        title: item.title,
        teamA: {
          names: [item.team1Member1, item.team1Member2].filter(Boolean),
          score: item.team1Score ?? 0,
        },
        teamB: {
          names: [item.team2Member1, item.team2Member2].filter(Boolean),
          score: item.team2Score ?? 0,
        },
        targetScore: 25, // 서버에 별도 targetScore가 없을 경우 기본값
        date: formatDisplayDate(item.startTime),
        isCreator: item.isCreator ?? true, // 서버 권한 체크 필드 (기본값 true)
      }));

      setGames(formatted);
    } catch (err) {
      console.error("미니게임 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

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

    setHistory([
      ...history,
      {
        scoreA: activeGame.scoreA,
        scoreB: activeGame.scoreB,
        servingTeam: activeGame.servingTeam,
      },
    ]);

    const isA = team === "A";
    const nextScoreA = isA ? activeGame.scoreA + 1 : activeGame.scoreA;
    const nextScoreB = !isA ? activeGame.scoreB + 1 : activeGame.scoreB;

    let isGameOver = false;
    const target = activeGame.targetScore;

    if (nextScoreA === 31 || nextScoreB === 31) isGameOver = true;
    else if (nextScoreA >= 24 && nextScoreB >= 24) {
      if (Math.abs(nextScoreA - nextScoreB) >= 2) isGameOver = true;
    } else if (nextScoreA >= target || nextScoreB >= target) isGameOver = true;

    setActiveGame({
      ...activeGame,
      scoreA: nextScoreA,
      scoreB: nextScoreB,
      servingTeam: team,
      isFinished: isGameOver,
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
    const winnerNames = (
      finalA > finalB ? activeGame.teamA : activeGame.teamB
    ).join(" & ");

    // 서버에 경기 종료 반영 (PATCH /games/{gameId}/end)
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
      } catch (err) {
        console.error("경기 종료 API 실패:", err);
      }
    }

    alert(`🏆 ${winnerNames} 승리! (${finalA} : ${finalB})`);
    if (document.fullscreenElement) document.exitFullscreen();
    setActiveGame(null);
    fetchGames(); // 목록 새로고침
  };

  // --- 기록 수정 / 삭제 (본인 생성 경기만 가능) ---
  const startEdit = (game: GameResult) => {
    if (!game.isCreator) {
      alert("경기 결과를 수정할 권한이 없습니다.");
      return;
    }
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
    if (!target) return;

    if (!target.isCreator) {
      alert("경기 결과를 수정할 권한이 없습니다.");
      return;
    }

    // 서버에 완료 경기 수정 반영 (PATCH /games/{gameId})
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
      alert("수정되었습니다.");
      cancelEdit();
      fetchGames(); // 목록 재조회
    } catch (err: any) {
      const msg = err?.response?.data?.message || "경기 수정 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  const deleteGame = async (game: GameResult) => {
    if (!game.isCreator) {
      alert("경기 결과를 삭제할 권한이 없습니다.");
      return;
    }

    if (!confirm("이 기록을 삭제할까요?")) return;

    try {
      await api.delete(`/games/${game.gameId}`);
      alert("삭제되었습니다.");
      if (editingId === game.id) cancelEdit();
      fetchGames(); // 목록 재조회
    } catch (err: any) {
      const msg = err?.response?.data?.message || "삭제 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  const handleCreateGame = async () => {
    if (!newGameTitle || playerNames.some((n) => !n.trim())) {
      alert("정보를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await api.post("/games", {
        title: newGameTitle,
        team1Member1: playerNames[0],
        team1Member2: playerNames[1],
        team2Member1: playerNames[2],
        team2Member2: playerNames[3],
        targetScore,
      });

      const gameId = res.data?.gameId;

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
    } catch (err: any) {
      const msg = err?.response?.data?.message || "경기 생성 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-left py-20 font-sans overflow-x-hidden">
      <header className="mb-6 flex justify-between items-end px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
            양배추 미니게임
          </h1>
        </div>
        {!activeGame && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#A1C852] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#93bd41] active:scale-95 transition"
          >
            새 경기
          </button>
        )}
      </header>

      {/* 1. 게임 생성 폼 */}
      {isCreating && (
        <section className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 mb-8 relative animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">경기 정보 입력</h2>
            <button
              onClick={() => setIsCreating(false)}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="space-y-4 text-left">
            <input
              type="text"
              placeholder="경기 제목"
              className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold"
              value={newGameTitle}
              onChange={(e) => setNewGameTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 text-left">
              {playerNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`선수 ${i + 1}`}
                  className="p-4 bg-gray-50 rounded-xl outline-none font-bold text-sm"
                  value={name}
                  onChange={(e) => {
                    const p = [...playerNames];
                    p[i] = e.target.value;
                    setPlayerNames(p);
                  }}
                />
              ))}
            </div>
            <select
              className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
            >
              <option value={11}>11점</option>
              <option value={21}>21점</option>
              <option value={25}>25점</option>
            </select>
            <button
              onClick={handleCreateGame}
              className="w-full py-4 bg-[#A1C852] text-white rounded-xl font-bold shadow-lg shadow-green-50 hover:bg-[#93bd41] active:scale-95 transition"
            >
              시작하기
            </button>
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
              <span className="bg-green-100 text-[#5b6b0f] px-3 py-0.5 rounded-full text-[9px] font-black uppercase w-fit mb-1">
                {activeGame.title}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {activeGame.isFinished
                  ? "Finished"
                  : `${activeGame.targetScore} PTS Match`}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-50 text-slate-400 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0 || activeGame.isFinished}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] transition ${
                  history.length > 0 && !activeGame.isFinished
                    ? "bg-slate-100 text-slate-600"
                    : "bg-gray-50 text-gray-200"
                }`}
              >
                ↩ UNDO
              </button>
            </div>
          </div>

          <div className="flex flex-1 gap-2 sm:gap-6 items-stretch overflow-hidden">
            <div
              onClick={() => handleScoreUpdate("A")}
              className={`flex-1 text-center p-2 rounded-[24px] transition-all flex flex-col justify-between border-2 ${
                activeGame.servingTeam === "A"
                  ? "bg-blue-50/30 border-blue-100"
                  : "bg-white border-transparent"
              }`}
            >
              <div className="text-blue-500 font-black text-[10px] bg-blue-50 py-1 px-2 rounded-lg w-fit mx-auto mt-2 truncate max-w-[90%]">
                {activeGame.teamA.join(" & ")}
              </div>
              <div
                className={`font-black select-none leading-none flex items-center justify-center transition-all ${
                  activeGame.servingTeam === "A"
                    ? "text-slate-800"
                    : "text-slate-200"
                }`}
                style={{ fontSize: "min(35vh, 25vw)" }}
              >
                {activeGame.scoreA}
              </div>
              <div
                className={`text-[9px] font-black uppercase mb-2 ${
                  activeGame.servingTeam === "A" && !activeGame.isFinished
                    ? "text-blue-400"
                    : "opacity-0"
                }`}
              >
                Serving
              </div>
            </div>

            <div
              onClick={() => handleScoreUpdate("B")}
              className={`flex-1 text-center p-2 rounded-[24px] transition-all flex flex-col justify-between border-2 ${
                activeGame.servingTeam === "B"
                  ? "bg-red-50/30 border-red-100"
                  : "bg-white border-transparent"
              }`}
            >
              <div className="text-red-500 font-black text-[10px] bg-red-50 py-1 px-2 rounded-lg w-fit mx-auto mt-2 truncate max-w-[90%]">
                {activeGame.teamB.join(" & ")}
              </div>
              <div
                className={`font-black select-none leading-none flex items-center justify-center transition-all ${
                  activeGame.servingTeam === "B"
                    ? "text-slate-800"
                    : "text-slate-200"
                }`}
                style={{ fontSize: "min(35vh, 25vw)" }}
              >
                {activeGame.scoreB}
              </div>
              <div
                className={`text-[9px] font-black uppercase mb-2 ${
                  activeGame.servingTeam === "B" && !activeGame.isFinished
                    ? "text-red-400"
                    : "opacity-0"
                }`}
              >
                Serving
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm("중단할까요?")) setActiveGame(null);
            }}
            className="mt-2 text-gray-300 text-[8px] font-black uppercase tracking-widest"
          >
            Discard Match
          </button>
        </section>
      )}

      {/* 3. 최근 기록 (서버 API 조회 연동) */}
      {!activeGame && !isCreating && (
        <section className="mt-6 text-left">
          <div className="flex items-baseline justify-between mb-3 ml-1">
            <h3 className="text-lg font-black text-slate-800">최근 기록</h3>
            <span className="text-[10px] font-bold text-slate-400">
              최신순 목록
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-sm">
              기록을 불러오는 중...
            </div>
          ) : (
            <div className="grid gap-2.5">
              {games.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[24px] py-16 text-center">
                  <p className="text-slate-300 font-bold text-xs">
                    기록된 경기가 없습니다.
                  </p>
                </div>
              ) : (
                games.map((game) => {
                  const winner = getWinner(game);
                  const isEditing = editingId === game.id;
                  return (
                    <div
                      key={game.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-left min-w-0">
                          <p className="text-sm font-black truncate">
                            {game.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {game.date}
                          </p>
                        </div>

                        {/* 💡 수정/삭제 권한 체크: 작성자 본인만 버튼 노출 */}
                        {game.isCreator && (
                          <div className="flex items-center gap-1 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(game.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#A1C852] text-white text-[11px] font-black active:scale-95 transition"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-black active:scale-95 transition"
                                >
                                  취소
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(game)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-black hover:bg-slate-100 active:scale-95 transition"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => deleteGame(game)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-50 text-red-400 text-[11px] font-black hover:bg-red-50 active:scale-95 transition"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
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
                        <div className="flex items-center text-slate-300 font-black text-sm">
                          VS
                        </div>
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
          )}
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
        <span className={`text-[11px] font-black truncate ${accentText}`}>
          {names.join(" & ")}
        </span>
        {won && (
          <span className="shrink-0 bg-[#A1C852] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            WIN
          </span>
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
        <p
          className={`font-black text-2xl ${
            won ? "text-[#5b6b0f]" : "text-slate-400"
          }`}
        >
          {score}
        </p>
      )}
    </div>
  );
}