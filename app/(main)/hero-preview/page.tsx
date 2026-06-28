import Link from "next/link";

/**
 * 히어로 리디자인 프로토타입 (Figma 32:1314)
 * 목적: 벡터 기반 풀블리드 히어로가 다양한 폭에서 견디는지 검증.
 *
 * 전략 (통짜 스케일 X):
 *  1) 배경(하늘·언덕·코트)은 가로 밴드형 → object-cover 로 비율 유지하며 채움(크롭만, 왜곡 없음).
 *  2) 캐릭터는 각각 투명 SVG → 브레이크포인트별 위치/크기.
 *  3) 모바일은 캐릭터 1마리만 노출(가로 구도를 세로로 욱여넣지 않음).
 *
 * 브라우저 폭을 줄였다 늘리며 확인하세요.
 */
export default function HeroPreviewPage() {
  return (
    <main className="bg-white">
      <div className="px-6 py-3 text-center text-xs sm:text-sm text-subtle font-semibold border-b border-line">
        프로토타입 — 브라우저 폭을 천천히 줄였다 늘려보세요 (모바일 / 태블릿 / 데스크톱 구도 전환)
      </div>

      <section className="relative w-full overflow-hidden min-h-[540px] sm:min-h-[460px] lg:min-h-[600px]">
        {/* 1) 배경: 비율 유지하며 cover (찌그러짐 없음, 가로 밴드라 좌우 크롭은 자연스러움) */}
        <img
          src="/images/hero/bg.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 w-full h-full object-cover object-bottom pointer-events-none select-none"
        />

        {/* 2) 전경 텍스트 + CTA */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pt-12 sm:pt-14 lg:pt-20 gap-3 sm:gap-4">
          <h1 className="font-black text-brand-dark text-6xl sm:text-7xl lg:text-8xl tracking-tight drop-shadow-sm leading-none">
            양배추
          </h1>
          <p className="text-base sm:text-xl font-semibold text-brand-ink tracking-tight">
            양질의 배드민턴 추구
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <Link
              href="/apply"
              className="bg-brand text-white text-sm sm:text-base font-bold px-7 py-3 rounded-full shadow-[var(--shadow-card)] hover:bg-brand-hover transition-colors"
            >
              지원하기
            </Link>
            <Link
              href="/activities"
              className="bg-white text-ink text-sm sm:text-base font-bold px-7 py-3 rounded-full shadow-[var(--shadow-card)] hover:bg-brand-soft transition-colors"
            >
              정기모임 보기
            </Link>
          </div>
        </div>

        {/* 3) 캐릭터 — 데스크톱(md+): 3마리 분산 배치 (% 폭 + max-w 상한) */}
        <img
          src="/images/mascot-walk.svg"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute z-10 bottom-0 left-[3%] w-[16%] max-w-[210px] pointer-events-none select-none"
        />
        <img
          src="/images/hero/char-mid.svg"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute z-10 bottom-0 left-1/2 -translate-x-1/2 w-[20%] max-w-[270px] pointer-events-none select-none"
        />
        <img
          src="/images/hero/char-right.svg"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute z-10 bottom-0 right-[4%] w-[17%] max-w-[240px] pointer-events-none select-none"
        />

        {/* 3') 캐릭터 — 모바일(md 미만): 1마리만 (우하단) */}
        <img
          src="/images/hero/char-right.svg"
          alt=""
          aria-hidden="true"
          className="md:hidden absolute z-10 bottom-0 right-1 w-[46%] max-w-[220px] pointer-events-none select-none"
        />
      </section>

      <div className="max-w-screen-md mx-auto px-6 py-10 text-sm leading-relaxed text-muted space-y-3">
        <h2 className="text-lg font-bold text-ink">검증 포인트</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><b>찌그러짐 없음</b>: 배경은 <code>object-cover</code>라 어떤 폭에서도 비율 유지(좌우 크롭만). 가로 밴드 구성이라 크롭이 티 안 남.</li>
          <li><b>모바일 구도 분리</b>: md 미만에선 캐릭터 1마리만. 가로 3마리 구도를 세로로 욱여넣지 않음.</li>
          <li><b>유한한 복잡도</b>: 브레이크포인트 2개(모바일/데스크톱) + %·max-w. 모든 폭을 계산하지 않음.</li>
          <li><b>성능 주의</b>: char-mid(190KB)+char-right(227KB)+mascot-walk(204KB) ≈ 0.6MB. 실제 적용 시 SVGO 최적화 또는 PNG/WebP 래스터화 권장.</li>
        </ul>
      </div>
    </main>
  );
}
