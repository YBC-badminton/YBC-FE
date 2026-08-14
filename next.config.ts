import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. 기존 프록시 리라이트 규칙 유지
  async rewrites() {
    return [
      {
        source: "/proxy/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: "/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // 2. Vercel 및 브라우저 정적 자산(이미지, 폰트 등) 장기 캐싱 설정 (1년)
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // 3. Next.js Image Optimization 캐시 유지 기간 및 외부 API 이미지 도메인 허용
  images: {
    // Vercel에서 최적화된 이미지 캐시 유지 기간 (기본 30일)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 백엔드 S3, CloudFront 등 외부 URL에서 사진을 불러올 때 필요
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;