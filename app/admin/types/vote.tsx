// types/vote.ts
export interface VoteReservation {
  id?: string;             // 대기열 아이템 식별자 (백엔드 생성)
  type: 'regular' | 'extra'; // 정기활동 | 다른날 활동
  day: string;             // 요일
  title: string;           // 제목
  date: string;            // 날짜
  startTime: string;       // 운동 시작 시간
  endTime: string;         // 운동 종료 시간
  location: string;        // 장소
  voteStart: string;       // 투표 시작 일시
  voteEnd: string;         // 투표 종료 일시
  createdAt?: string;      // 예약 생성 시간
}