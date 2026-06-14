import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../components/ui/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <link rel="apple-touch-icon" href="/public/images/mascot.png"></link>
      <body className="antialiased font-sans">
        {/* 여기에 (admin)이나 (main)의 레이아웃이 들어옵니다. */}
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
