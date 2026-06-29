import type { NextConfig } from "next";

const API_URL = process.env.API_URL || 'http://localhost:8080'; // 기본값 설정

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/proxy/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: "/proxy/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
