'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage } from '../../lib/uploadImage';

interface ImageUploaderProps {
    /** 현재 이미지 URL (없으면 빈 문자열) */
    value: string;
    /** 업로드가 끝나면 새 imageUrl로 호출됩니다. 삭제 시 '' 로 호출됩니다. */
    onChange: (url: string) => void;
    /** 업로드 실패 등 에러 메시지를 표시하고 싶을 때 */
    onError?: (message: string) => void;
    /** 미리보기 영역 높이 클래스 (기본 h-40) */
    heightClass?: string;
    className?: string;
}

export default function ImageUploader({
    value,
    onChange,
    onError,
    heightClass = 'h-40',
    className = '',
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            onError?.('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        setIsUploading(true);
        try {
            // 먼저 /admin/images로 업로드한 뒤 반환된 imageUrl을 상위로 전달합니다.
            const url = await uploadImage(file, value || undefined);
            onChange(url);
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                '이미지 업로드에 실패했습니다.';
            onError?.(message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleSelect}
                className="hidden"
            />
            {value ? (
                <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-gray-200 bg-slate-50 group`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="업로드된 이미지" className="w-full h-full object-cover" />
                    {/* 이미지 변경은 "삭제 후 새로 업로드" 방식으로만 가능합니다. */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            disabled={isUploading}
                            className="bg-red-500/90 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-red-500 transition disabled:opacity-50 flex items-center gap-1"
                        >
                            <X className="w-3.5 h-3.5" /> 삭제
                        </button>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#A1C852] animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full ${heightClass} rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 hover:border-[#A1C852] hover:bg-[#f7f9f5] transition flex flex-col items-center justify-center gap-2 text-slate-400 disabled:opacity-60`}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-6 h-6 text-[#A1C852] animate-spin" />
                            <span className="text-xs font-bold text-slate-500">업로드 중...</span>
                        </>
                    ) : (
                        <>
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-xs font-bold">이미지 업로드</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
