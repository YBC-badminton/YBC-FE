"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// --- 서버 API 응답용 인터페이스 ---
interface ServerGameItem {
  gameId: number;
  memberId?: number;
  title: string;
  writer?: string;
  team1Member1: string;
  team1Member2: string;
  team2Member1: string;
  team2Member2: string;
  team1Score: number;
  team2Score: number;
  winnerTeam?: "TEAM1" | "TEAM2" | "DRAW";
  startTime: string;
  endTime?: string;
  isCreator?: boolean;
}

interface ServerGamesResponse {
  games: ServerGameItem[];
}

// --- 클라이언트 내부 화면 표현용 인터페이스 ---
interface GameResult {
  id: string;
  gameId: number;
  title: string;
  teamA: { names: string[]; score: number };
  teamB: { names: string[]; score: number };
  targetScore: number;
  date: string;
  isCreator: boolean;
  writer?: string;
  memberId?: number;
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
  const { user } = useAuth();
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);

  const [activeGame, setActiveGame] = useState<{
    gameId: number;
    startedAt: string;
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

  // --- 미니게임 목록 조회 ---
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ServerGamesResponse>("/games");
      const serverList = res.data?.games || [];

      const formatted: GameResult[] = serverList.map((item) => {
        // 💡 백엔드 응답 데이터와 현재 유저 정보(as any 단언) 비교로 권한 체크
        let checkCreator = false;
        if (typeof item.isCreator === "boolean") {
          checkCreator = item.isCreator;
        } else if (user) {
          const authUser = user as any;
          if (item.memberId && authUser.memberId) {
            checkCreator = Number(item.memberId) === Number(authUser.memberId);
          } else if (item.writer) {
            checkCreator =
              item.writer === authUser.name || item.writer === authUser.nickname;
          }
        }

        return {
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
          targetScore: 25,
          date: formatDisplayDate(item.startTime),
          isCreator: checkCreator,
          writer: item.writer,
          memberId: item.memberId,
        };
      });

      setGames(formatted);
    } catch (err) {
      console.error("미니게임 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // --- 전체 화면 및 가로 고정 ---
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
    fetchGames();
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
      const msg =
        err?.response?.data?.message || "경기 생성 중 오류가 발생했습니다.";
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
              <X className="w-5 h-5" />
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

      {/* 3. 최근 기록 */}
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
                  return (
                    <div
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#A1C852]/50 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-left min-w-0">
                          <p className="text-sm font-black truncate text-slate-800">
                            {game.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {game.date} {game.writer && `· 작성자: ${game.writer}`}
                          </p>
                        </div>
                      </div>

                      {/* 팀별 결과 카드 */}
                      <div className="mt-3 flex items-stretch gap-2">
                        <TeamResult
                          names={game.teamA.names}
                          score={game.teamA.score}
                          won={winner === "A"}
                          accent="blue"
                        />
                        <div className="flex items-center text-slate-300 font-black text-sm">
                          VS
                        </div>
                        <TeamResult
                          names={game.teamB.names}
                          score={game.teamB.score}
                          won={winner === "B"}
                          accent="red"
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

      {/* 💡 리뷰 페이지 방식과 동일하게 isAuthor 전달 */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          isAuthor={
            !!user &&
            (selectedGame.isCreator ||
              user.name === selectedGame.writer ||
              (user as any).nickname === selectedGame.writer ||
              (!!selectedGame.memberId &&
                (user as any).memberId === selectedGame.memberId))
          }
          onChanged={() => {
            fetchGames();
            setSelectedGame(null);
          }}
        />
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

// 목록용 팀 결과 카드
function TeamResult({
  names,
  score,
  won,
  accent,
}: {
  names: string[];
  score: number;
  won: boolean;
  accent: "blue" | "red";
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
      <p
        className={`font-black text-2xl ${
          won ? "text-[#5b6b0f]" : "text-slate-400"
        }`}
      >
        {score}
      </p>
    </div>
  );
}

// 💡 미니게임 상세/수정/삭제 모달
function GameDetailModal({
  game,
  onClose,
  isAuthor,
  onChanged,
}: {
  game: GameResult;
  onClose: () => void;
  isAuthor: boolean;
  onChanged: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  // 수정용 폼 상태
  const [editTitle, setEditTitle] = useState(game.title);
  const [editTeamA1, setEditTeamA1] = useState(game.teamA.names[0] || "");
  const [editTeamA2, setEditTeamA1_2] = useState(game.teamA.names[1] || "");
  const [editTeamB1, setEditTeamB1] = useState(game.teamB.names[0] || "");
  const [editTeamB2, setEditTeamB2] = useState(game.teamB.names[1] || "");
  const [editScoreA, setEditScoreA] = useState(String(game.teamA.score));
  const [editScoreB, setEditScoreB] = useState(String(game.teamB.score));

  const saveEdit = async () => {
    const scoreA = Number(editScoreA);
    const scoreB = Number(editScoreB);

    if (!editTitle.trim()) {
      alert("경기 제목을 입력해 주세요.");
      return;
    }
    if (
      Number.isNaN(scoreA) ||
      Number.isNaN(scoreB) ||
      scoreA < 0 ||
      scoreB < 0
    ) {
      alert("점수를 올바르게 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      await api.patch(`/games/${game.gameId}`, {
        title: editTitle.trim(),
        team1Member1: editTeamA1.trim(),
        team1Member2: editTeamA2.trim(),
        team2Member1: editTeamB1.trim(),
        team2Member2: editTeamB2.trim(),
        team1Score: scoreA,
        team2Score: scoreB,
      });
      alert("수정되었습니다.");
      setIsEditing(false);
      onChanged();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "경기 수정 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 기록을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/games/${game.gameId}`);
      alert("삭제되었습니다.");
      onChanged();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "삭제 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  const winner = getWinner(game);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-xl p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] relative shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 헤더 섹션 */}
        <div className="mb-6 space-y-2 text-left">
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#f2f8e1] text-[#5b6b0f]">
            MINIGAME MATCH
          </span>

          {isEditing ? (
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-400 block mb-1">
                경기 제목
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#A1C852]"
              />
            </div>
          ) : (
            <h2 className="text-xl sm:text-3xl font-black text-slate-800 break-keep pr-8">
              {game.title}
            </h2>
          )}

          <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-2">
            <span>작성자: {game.writer || "익명"}</span>
            <span>일시: {game.date}</span>
          </div>
        </div>

        {/* 경기 본문 / 수정 영역 */}
        <div className="py-6 border-y border-slate-100 my-4">
          {isEditing ? (
            <div className="space-y-5 text-left">
              {/* 팀 A 수정 */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <label className="text-xs font-black text-blue-500 block mb-2">
                  TEAM A (블루)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="선수 1"
                    value={editTeamA1}
                    onChange={(e) => setEditTeamA1(e.target.value)}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="선수 2"
                    value={editTeamA2}
                    onChange={(e) => setEditTeamA1_2(e.target.value)}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    점수:
                  </span>
                  <input
                    type="number"
                    value={editScoreA}
                    onChange={(e) => setEditScoreA(e.target.value)}
                    className="w-20 p-2 bg-white border border-gray-200 rounded-xl text-center font-black text-lg outline-none"
                  />
                </div>
              </div>

              {/* 팀 B 수정 */}
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <label className="text-xs font-black text-red-500 block mb-2">
                  TEAM B (레드)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="선수 1"
                    value={editTeamB1}
                    onChange={(e) => setEditTeamB1(e.target.value)}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="선수 2"
                    value={editTeamB2}
                    onChange={(e) => setEditTeamB2(e.target.value)}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    점수:
                  </span>
                  <input
                    type="number"
                    value={editScoreB}
                    onChange={(e) => setEditScoreB(e.target.value)}
                    className="w-20 p-2 bg-white border border-gray-200 rounded-xl text-center font-black text-lg outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {/* 팀 A 결과 */}
              <div
                className={`flex-1 p-4 rounded-2xl text-center border ${
                  winner === "A"
                    ? "bg-[#f2f8e1] border-[#cfe39a]"
                    : "bg-slate-50 border-transparent"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-xs font-black text-blue-500 truncate">
                    {game.teamA.names.join(" & ") || "Team A"}
                  </span>
                  {winner === "A" && (
                    <span className="bg-[#A1C852] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      WIN
                    </span>
                  )}
                </div>
                <p
                  className={`text-4xl font-black ${
                    winner === "A" ? "text-[#5b6b0f]" : "text-slate-400"
                  }`}
                >
                  {game.teamA.score}
                </p>
              </div>

              <div className="font-black text-slate-300 text-lg">VS</div>

              {/* 팀 B 결과 */}
              <div
                className={`flex-1 p-4 rounded-2xl text-center border ${
                  winner === "B"
                    ? "bg-[#f2f8e1] border-[#cfe39a]"
                    : "bg-slate-50 border-transparent"
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-xs font-black text-red-500 truncate">
                    {game.teamB.names.join(" & ") || "Team B"}
                  </span>
                  {winner === "B" && (
                    <span className="bg-[#A1C852] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      WIN
                    </span>
                  )}
                </div>
                <p
                  className={`text-4xl font-black ${
                    winner === "B" ? "text-[#5b6b0f]" : "text-slate-400"
                  }`}
                >
                  {game.teamB.score}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 모달 하단 수정/삭제 버튼 */}
        {isAuthor && (
          <div className="flex gap-3 justify-end pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={busy}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-slate-600 rounded-full font-bold hover:bg-gray-200 text-sm transition"
                >
                  취소
                </button>
                <button
                  onClick={saveEdit}
                  disabled={busy}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#A1C852] text-white rounded-full font-bold hover:bg-[#93bd41] text-sm transition"
                >
                  <Check className="w-4 h-4" /> 저장
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-slate-600 rounded-full font-bold hover:bg-gray-200 text-sm transition"
                >
                  <Pencil className="w-4 h-4" /> 수정
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-full font-bold hover:bg-red-100 text-sm transition"
                >
                  <Trash2 className="w-4 h-4" /> 삭제
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}