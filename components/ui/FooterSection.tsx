import Link from 'next/link';

// TODO: 실제 운영진 연락처/채널 정보로 교체
const CONTACT_EMAIL = 'contact@ybc-badminton.com';
const INSTAGRAM_URL = 'https://instagram.com/ybc_badminton';
const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_ybc';

export default function FooterSection() {
    return (
        <section className="border-t border-gray-100 py-10 px-12">
            <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 text-sm font-semibold tracking-tight text-slate-400">

                {/* Top row: 로고 + SNS 아이콘 */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center opacity-60">
                        <img
                            src="/images/logo.png"
                            alt="YBC Logo"
                            className="h-7 w-auto object-contain grayscale"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <InstagramIcon />
                        </a>
                        <a
                            href={KAKAO_CHANNEL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="카카오톡 채널"
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <KakaoIcon />
                        </a>
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            aria-label="이메일 문의"
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <MailIcon />
                        </a>
                    </div>
                </div>

                {/* Bottom row: 문의 + 정책/저작권 */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="hover:text-slate-600 transition-colors"
                        >
                            문의: {CONTACT_EMAIL}
                        </a>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <Link
                            href="/faq"
                            className="hover:text-slate-600 transition-colors"
                        >
                            자주 묻는 질문
                        </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <Link
                            href="/policy/privacy"
                            className="hover:text-slate-600 transition-colors"
                        >
                            개인정보 처리방침
                        </Link>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <p>Copyright © 2026 YBC Badminton Club. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function InstagramIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function KakaoIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 3C6.48 3 2 6.6 2 10.8c0 2.7 1.74 5.07 4.39 6.42-.18.66-.66 2.5-.76 2.89-.12.49.18.49.38.36.16-.1 2.5-1.7 3.51-2.39.81.12 1.65.18 2.48.18 5.52 0 10-3.6 10-7.86C22 6.6 17.52 3 12 3z" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 6l-10 7L2 6" />
        </svg>
    );
}
