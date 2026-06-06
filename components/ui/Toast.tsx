'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    variant: ToastVariant;
}

interface ToastContextType {
    showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
    success: 'bg-[#4B7332] text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-700 text-white',
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev, { id, message, variant }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {items.map((t) => (
                    <ToastBubble key={t.id} item={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(item.id), 3500);
        return () => clearTimeout(timer);
    }, [item.id, onDismiss]);

    return (
        <div
            role="status"
            className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-lg font-bold text-sm flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-top-2 duration-200 ${VARIANT_STYLES[item.variant]}`}
        >
            <span className="text-base leading-none" aria-hidden="true">{VARIANT_ICONS[item.variant]}</span>
            <span className="flex-1">{item.message}</span>
            <button
                onClick={() => onDismiss(item.id)}
                aria-label="닫기"
                className="text-white/80 hover:text-white text-base leading-none"
            >
                ×
            </button>
        </div>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
}
