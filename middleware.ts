import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // /admin 경로 보호: accessToken 쿠키 또는 헤더 확인
    // 클라이언트 측 localStorage 토큰은 미들웨어에서 직접 접근 불가하므로
    // 서버 사이드 검증은 쿠키 기반으로 처리하고,
    // 클라이언트 사이드 가드는 AdminLayout에서 처리
    // TODO: 개발 완료 후 아래 주석 해제하여 인증 보호 활성화
    // if (pathname.startsWith('/admin')) {
    //     const token = request.cookies.get('accessToken')?.value;
    //
    //     if (!token) {
    //         const loginUrl = new URL('/login', request.url);
    //         loginUrl.searchParams.set('redirect', pathname);
    //         return NextResponse.redirect(loginUrl);
    //     }
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
