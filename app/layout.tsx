import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        {/* 여기에 (admin)이나 (main)의 레이아웃이 들어옵니다. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
