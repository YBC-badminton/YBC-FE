"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ==========================================
// 1. 카테고리별 활동 데이터 (하드코딩)
// ==========================================
const ACTIVITIES_DATA: Record<string, any[]> = {
  "regular": [
    { 
      id: "r1", 
      title: "2026년 3월 2주차 화요 정기전", 
      date: "2026.03.10", 
      images: [
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200",
        "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200"
      ], 
      content: "이번 화요 정기전에는 총 24분의 부원님들이 참석해주셨습니다!\n\n봄을 맞이하여 새롭게 짠 복식 조로 미니 게임을 진행했는데, 다들 실력이 엄청나네요. 특히 A조 결승전은 듀스까지 가는 접전 끝에 정말 명경기가 나왔습니다. \n\n다치지 말고 즐턴합시다 🏸" 
    },
    { 
      id: "r2", 
      title: "2026년 3월 1주차 토요 새벽반", 
      date: "2026.03.07", 
      images: [
        "https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?q=80&w=1200"
      ], 
      content: "주말 아침 7시부터 열정이 넘치는 코트였습니다!\n\n가볍게 난타로 몸을 풀고 2시간 꽉 채워서 게임을 진행했습니다. 이른 시간에도 많은 분이 참여해주셔서 활기찬 주말 시작이었습니다!" 
    },
  ],
  "tournament": [
    { 
      id: "t1", 
      title: "제 5회 양배추배 자체 토너먼트", 
      date: "2026.02.28", 
      images: ["https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200"], 
      content: "치열했던 상반기 자체 토너먼트 대회가 무사히 마무리되었습니다.\n\n조별 우승자분들 모두 축하드리며, 아쉽게 탈락하신 분들도 멋진 경기력 보여주셔서 감사합니다. 다음 대회는 가을에 열립니다!" 
    },
  ],
  "cabbage-day": [
    { 
      id: "c1", 
      title: "2026 양배추의 날! 봄맞이 체육대회", 
      date: "2026.01.15", 
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200"], 
      content: "배드민턴 라켓은 잠시 내려놓고! 부원들끼리 친목을 다지는 '양배추의 날' 행사를 진행했습니다. 즐거운 레크리에이션과 맛있는 음식을 함께 나눴습니다." 
    },
  ],
  "party": [
    { 
      id: "p1", 
      title: "3월 신입부원 환영 회식", 
      date: "2026.03.12", 
      images: ["https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200"], 
      content: "올해 새로 가입하신 신입 부원분들과 함께하는 환영 회식이 있었습니다. 양배추 클럽에 오신 것을 진심으로 환영합니다!" 
    },
  ],
  "flash": [
    { 
      id: "f1", 
      title: "주말 올림픽공원 야외 번개 ⚡", 
      date: "2026.03.14", 
      images: ["https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?q=80&w=1200"], 
      content: "날씨가 너무 좋아서 급하게 친 야외 번개! 실내와는 다른 야외 배드민턴의 매력을 느낄 수 있었습니다." 
    },
  ],
};

const CATEGORY_MAP: Record<string, string> = {
  "regular": "정식 복식 경기",
  "tournament": "자체 경기",
  "cabbage-day": "양배추의 날",
  "party": "뒷풀이",
  "flash": "번개 운동",
};

// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function CategoryActivityPage(props: any) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // Next.js 파라미터 비동기 처리 (타이밍 이슈 해결)
  useEffect(() => {
    const unwrapParams = async () => {
      const resolved = await props.params;
      if (resolved && resolved.category) {
        setCategoryId(resolved.category);
      }
    };
    unwrapParams();
  }, [props.params]);

  // 카테고리 변경 시 데이터 로드
  useEffect(() => {
    if (categoryId && ACTIVITIES_DATA[categoryId]) {
      setPosts(ACTIVITIES_DATA[categoryId]);
    } else {
      setPosts([]);
    }
    setSelectedPost(null);
  }, [categoryId]);

  const handleBackToList = () => {
    setSelectedPost(null);
    setCurrentImgIdx(0);
  };

  if (!categoryId) return <div className="min-h-screen bg-white" />;
  const categoryName = CATEGORY_MAP[categoryId] || "활동 기록";

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* [헤더] 왼쪽 버튼 / 중앙 타이틀 정렬 */}
        <div className="relative flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
          
          {/* 1. 왼쪽 영역 (버튼 위치 고정) */}
          <div className="flex-none w-[100px] sm:w-[150px] text-left">
            {!selectedPost ? (
              <Link 
                href="/past-activities" 
                className="text-gray-400 font-bold hover:text-[#1E8A44] transition flex items-center gap-1.5 shrink-0 text-sm sm:text-base"
              >
                <span className="text-xl leading-none">←</span> 
                <span className="hidden sm:inline font-black">전체 활동으로</span>
                <span className="inline sm:hidden font-black">전체</span>
              </Link>
            ) : (
              <button 
                onClick={handleBackToList}
                className="text-[#1E8A44] font-bold hover:text-[#156331] transition flex items-center gap-1.5 shrink-0 text-sm sm:text-base"
              >
                <span className="text-xl leading-none">←</span> 
                <span className="hidden sm:inline font-black">목록으로</span>
                <span className="inline sm:hidden font-black">목록</span>
              </button>
            )}
          </div>

          {/* 2. 중앙 영역 (타이틀 정가운데) */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-4xl font-black text-[#1E8A44] uppercase tracking-tight mb-2">
              {categoryName}
            </h1>
            <div className="w-12 h-1 bg-[#1E8A44] rounded-full mx-auto" />
          </div>

          {/* 3. 오른쪽 영역 (좌측과 균형을 맞추기 위한 빈 공간) */}
          <div className="flex-none w-[100px] sm:w-[150px]" />
        </div>

        {/* --- [A] 목록 보기 모드 (카드 중앙 정렬) --- */}
        {!selectedPost ? (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-wrap justify-center gap-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="group relative bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all w-full sm:w-[320px] shrink-0"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={post.images[0]} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E8A44]/90 via-[#1E8A44]/20 to-transparent opacity-70" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-6 w-full z-10 text-left">
                    <p className="text-[12px] font-black text-green-300 mb-1">{post.date}</p>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                      {post.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- [B] 상세 보기 모드 --- */
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
            {/* 이미지 슬라이더 */}
            <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-xl bg-slate-900 group">
              <img src={selectedPost.images[currentImgIdx]} className="w-full h-full object-cover" alt="활동" />
              {selectedPost.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setCurrentImgIdx(prev => (prev === 0 ? selectedPost.images.length - 1 : prev - 1))} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full text-white flex items-center justify-center">＜</button>
                  <button onClick={() => setCurrentImgIdx(prev => (prev === selectedPost.images.length - 1 ? 0 : prev + 1))} className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full text-white flex items-center justify-center">＞</button>
                </div>
              )}
              {selectedPost.images.length > 1 && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedPost.images.map((_: any, idx: number) => (
                      <div key={idx} className={`w-2 h-2 rounded-full transition-all ${currentImgIdx === idx ? "bg-white w-4" : "bg-white/50"}`} />
                    ))}
                 </div>
              )}
            </div>

            {/* 본문 텍스트 박스 */}
            <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">{selectedPost.title}</h2>
                <p className="text-sm font-bold text-slate-400">{selectedPost.date} | 운영진 기록</p>
              </div>
              <div className="w-full h-px bg-gray-100" />
              <p className="text-slate-600 text-lg leading-loose whitespace-pre-wrap font-medium">
                {selectedPost.content}
              </p>
            </div>
          </div>
        )}

        {/* 게시물이 없을 때 */}
        {posts.length === 0 && !selectedPost && (
          <div className="text-center py-32 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100 mt-8">
             <p className="text-gray-400 font-bold">아직 등록된 활동 기록이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}