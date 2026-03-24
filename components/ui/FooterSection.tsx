export default function FooterSection() {
    return (
        <section className="border-t border-gray-100 py-8 px-12">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center text-sm font-semibold tracking-tight text-slate-400">
                
                <div className="flex items-center opacity-60">
                <img 
                    src="/images/logo.png" 
                    alt="YBC Logo" 
                    className="h-7 w-auto object-contain grayscale" 
                />
                </div>

                <p>
                Copyright © 2026 YBC Badminton Club. All Rights Reserved.
                </p>
            </div>
        </section>
    );
}