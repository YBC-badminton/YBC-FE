'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

// 계정 유형: 관리자 / 일반 회원 / 지원자
type UserRole = 'admin' | 'member' | 'applicant';

interface User {
    role: UserRole;
    name: string;
    // admin: ID 기반 로그인
    // member: 카카오 로그인 후 받는 정보
    // applicant: 이름 + 전화번호로 조회
    email?: string;
    phone?: string;
    accessToken?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    // 관리자 로그인
    loginAdmin: (id: string, password: string) => Promise<void>;
    // 카카오 로그인 (회원)
    loginKakao: () => Promise<void>;
    // 지원자 조회
    loginApplicant: (name: string, phone: string) => Promise<void>;
    // 로그아웃
    logout: () => void;
    // 에러 초기화
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    // 1. 관리자 로그인
    const loginAdmin = useCallback(async (id: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/auth/admin', { id, password });
            setUser({
                role: 'admin',
                name: res.data.name,
                accessToken: res.data.accessToken,
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다.');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. 카카오 로그인 (회원)
    const loginKakao = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 카카오 OAuth 리다이렉트 URL을 백엔드에서 받아오는 구조
            const res = await axios.get('/api/auth/kakao');
            window.location.href = res.data.redirectUrl;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || '카카오 로그인 중 오류가 발생했습니다.');
            } else {
                setError('카카오 로그인 중 오류가 발생했습니다.');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. 지원자 조회
    const loginApplicant = useCallback(async (name: string, phone: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/auth/applicant', { name, phone });
            setUser({
                role: 'applicant',
                name: res.data.name,
                phone,
            });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || '일치하는 지원 정보를 찾을 수 없습니다.');
            } else {
                setError('조회 중 오류가 발생했습니다.');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 로그아웃
    const logout = useCallback(() => {
        setUser(null);
        setError(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error, loginAdmin, loginKakao, loginApplicant, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
