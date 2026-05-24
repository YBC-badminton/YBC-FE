import Link from 'next/link';

export default function FooterSection() {
    return (
        <section className="border-t border-gray-100 py-8 px-12">
            <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-semibold tracking-tight text-slate-400">

                <div className="flex items-center opacity-60">
                <img
                    src="/images/logo.png"
                    alt="YBC Logo"
                    className="h-7 w-auto object-contain grayscale"
                />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                    <Link
                        href="/policy/privacy"
                        className="hover:text-slate-600 transition-colors"
                    >
                        개인정보 처리방침
                    </Link>
                    <p>
                    Copyright © 2026 YBC Badminton Club. All Rights Reserved.
                    </p>
                </div>
            </div>
        </section>
    );
}