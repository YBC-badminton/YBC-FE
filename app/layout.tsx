import "./globals.css";
import type { Metadata } from "next";
import { Agbalumo } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/ui/Toast";

// 히어로 디스플레이 서체 (Figma: "YBC badminton club")
const agbalumo = Agbalumo({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-agbalumo",
});

export const metadata: Metadata = {
  title: "YBC Badminton Club",
  description: "양질의 배드민턴 추구 — YBC 배드민턴 클럽",
  icons: { apple: "/images/apple-touch-icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={agbalumo.variable}>
      <body className="antialiased font-sans">
        {/* 여기에 (admin)이나 (main)의 레이아웃이 들어옵니다. */}
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
