// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/proxy/'], // 관리자 및 프록시 경로는 검색 제외
        },
        sitemap: 'https://ybcbadminton.co.kr/sitemap.xml',
    };
}