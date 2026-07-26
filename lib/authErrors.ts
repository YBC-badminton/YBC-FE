export const MEMBER_ONLY_MESSAGE = '동아리 부원만 로그인할 수 있습니다.';

/** 부원이 아닌 계정으로 로그인을 시도했을 때 발생하는 에러 */
export class NotMemberError extends Error {
    constructor(message: string = MEMBER_ONLY_MESSAGE) {
        super(message);
        this.name = 'NotMemberError';
    }
}

/** 서버가 403으로 거부한 경우 — 부원이 아닌 계정 */
export function isNotMemberError(err: unknown): boolean {
    if (err instanceof NotMemberError) return true;
    return (err as { response?: { status?: number } })?.response?.status === 403;
}
