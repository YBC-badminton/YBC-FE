'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/axios';

type UserRole = 'member' | 'applicant';

interface User {
    id?: number;
    role: UserRole;
    name: string;
    email?: string;
    phone?: string;
    provider?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    loginKakao: () => Promise<void>;
    handleKakaoCallback: (accessToken: string, refreshToken: string) => Promise<void>;
    loginApplicant: (name: string, phone: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- localStorage 헬퍼 ---
function saveTokens(accessToken: string, refreshToken?: string) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
    }
}

function saveUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

function loadUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 마운트 시 localStorage에서 유저 정보 복원
    useEffect(() => {
        const stored = loadUser();
        if (stored) {
            setUser(stored);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    // 내 정보 조회 (카카오 로그인 후 유저 정보 가져오기)
    const fetchMe = useCallback(async (): Promise<User> => {
        const res = await api.get('/api/v1/auth/me');
        const data = res.data;
        return {
            id: data.id,
            role: 'member',
            name: data.nickname,
            email: data.email,
            provider: data.provider,
        };
    }, []);

    // 카카오 로그인 — 1단계: loginUrl 받아서 리다이렉트
    const loginKakao = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/api/v1/auth/kakao/login-url');
            window.location.href = res.data.loginUrl;
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || '카카오 로그인 중 오류가 발생했습니다.';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 카카오 로그인 — 2단계: 콜백에서 토큰 받은 후 유저 정보 조회
    const handleKakaoCallback = useCallback(async (accessToken: string, refreshToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            saveTokens(accessToken, refreshToken);
            const newUser = await fetchMe();
            saveUser(newUser);
            setUser(newUser);
        } catch (err: unknown) {
            clearAuth();
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || '로그인 정보를 가져오는 중 오류가 발생했습니다.';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [fetchMe]);

    // 지원자 조회
    const loginApplicant = useCallback(async (name: string, phone: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/auth/applicant', { name, phone });
            const newUser: User = {
                role: 'applicant',
                name: res.data.name,
                phone,
            };
            saveUser(newUser);
            setUser(newUser);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || '일치하는 지원 정보를 찾을 수 없습니다.';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 로그아웃
    const logout = useCallback(async () => {
        try {
            await api.post('/api/v1/auth/logout');
        } catch {
            // 로그아웃 API 실패해도 클라이언트 측은 정리
        }
        clearAuth();
        setUser(null);
        setError(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error, loginKakao, handleKakaoCallback, loginApplicant, logout, clearError }}>
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
