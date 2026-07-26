"use client";

import React from "react";
import { MEMBER_ONLY_MESSAGE } from "../../lib/authErrors";

interface MemberOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function MemberOnlyModal({
  isOpen,
  onClose,
  message,
}: MemberOnlyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 mx-6 p-8 space-y-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-800">
            {message || MEMBER_ONLY_MESSAGE}
          </h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            가입 문의는 동아리 운영진에게 연락해 주세요.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#5b6b0f] text-white font-bold rounded-2xl hover:bg-[#46530c] transition-all shadow-md text-sm"
        >
          확인
        </button>
      </div>
    </div>
  );
}
