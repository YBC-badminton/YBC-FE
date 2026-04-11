'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/axios';

// 계정 유형: 관리자 / 일반 회원 / 지원자
type UserRole = 'admin' | 'member' | 'applicant';

interface User {
    role: UserRole;
    name: string;
    email?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    loginAdmin: (id: string, password: string) => Promise<void>;
    loginKakao: () => Promise<void>;
    loginApplicant: (name: string, phone: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// localStorage 헬퍼
function saveAuth(user: User, token?: string) {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) {
        localStorage.setItem('accessToken', token);
    }
}

function clearAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
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

    // 1. 관리자 로그인
    const loginAdmin = useCallback(async (id: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/auth/admin', { id, password });
            const newUser: User = {
                role: 'admin',
                name: res.data.name,
            };
            saveAuth(newUser, res.data.accessToken);
            setUser(newUser);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || '아이디 또는 비밀번호가 올바르지 않습니다.';
            setError(message);
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
            const res = await api.get('/api/auth/kakao');
            window.location.href = res.data.redirectUrl;
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || '카카오 로그인 중 오류가 발생했습니다.';
            setError(message);
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
            const res = await api.post('/api/auth/applicant', { name, phone });
            const newUser: User = {
                role: 'applicant',
                name: res.data.name,
                phone,
            };
            saveAuth(newUser);
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
    const logout = useCallback(() => {
        clearAuth();
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
