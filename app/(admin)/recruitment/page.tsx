"use client";

import React, { useState } from "react";

interface RecruitmentSchedule {
  id: string;
  generation: string;
  recruitStartDate: string;
  recruitEndDate: string;
  recruitStartTime: string;
  recruitEndTime: string;
  interviewDate1: string;
  interviewDate2: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewLocation: string;
  firstAnnouncementDate: string;
  finalAnnouncementDate: string;
  fee: string;
  semester: string;
  activityDay: string;
  otDate: string;
  otTime: string;
  groupChatInviteDate?: string;
}

const initialForm: RecruitmentSchedule = {
  id: "",
  generation: "",
  recruitStartDate: "",
  recruitEndDate: "",
  recruitStartTime: "",
  recruitEndTime: "",
  interviewDate1: "",
  interviewDate2: "",
  interviewStartTime: "",
  interviewEndTime: "",
  interviewLocation: "",
  firstAnnouncementDate: "",
  finalAnnouncementDate: "",
  fee: "",
  semester: "",
  activityDay: "",
  otDate: "",
  otTime: "",
  groupChatInviteDate: "",
};

export default function RecruitmentPage() {
  const [viewMode, setViewMode] = useState<"list" | "add" | "detail">("list");
  const [schedules, setSchedules] = useState<RecruitmentSchedule[]>([
    { ...initialForm, id: "1", generation: "10기" },
    { ...initialForm, id: "2", generation: "11기" },
    { ...initialForm, id: "3", generation: "12기" },
    { ...initialForm, id: "4", generation: "13기" },
  ]);
  const [form, setForm] = useState<RecruitmentSchedule>(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectDetail = (schedule: RecruitmentSchedule) => {
    setForm(schedule);
    setViewMode("detail");
  };

  const handleSubmit = async () => {
    if (!form.generation) return alert("기수 정보를 입력해주세요.");
    try {
      const payload = { ...form, id: form.id || Date.now().toString() };
      if (viewMode === "add") {
        setSchedules([payload, ...schedules]);
      } else {
        setSchedules(schedules.map(s => s.id === form.id ? payload : s));
      }
      alert("모집 일정이 성공적으로 저장되었습니다.");
      setViewMode("list");
      setForm(initialForm);
    } catch (error) {
      alert("전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 py-6 sm:py-8 font-sans">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">모집 일정 관리</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">동아리 모집 일정을 설정하고 관리하세요.</p>
        </div>
        {viewMode === "list" && (
          <button
            onClick={() => { setForm(initialForm); setViewMode("add"); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
          >
            <span className="text-blue-500 text-lg">+</span> 모집 일정 추가하기
          </button>
        )}
      </div>

      {/* --- [A] 목록 보기 화면 --- */}
      {viewMode === "list" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {schedules.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectDetail(item)}
              className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:border-blue-200 transition-all cursor-pointer flex justify-between items-center group"
            >
              <span className="text-base sm:text-lg font-black text-slate-800">{item.generation}</span>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* --- [B] 추가/상세 보기 화면 --- */}
      {viewMode !== "list" && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5 sm:p-10 space-y-8 sm:space-y-10 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-800">
              {viewMode === "add" ? "새 일정 추가" : `${form.generation} 정보 수정`}
            </h2>
            <button onClick={() => setViewMode("list")} className="text-xs sm:text-sm font-bold text-slate-400 hover:text-red-500">취소</button>
          </div>

          <FormSection title="기본 정보">
            <InputField label="기수 *" name="generation" value={form.generation} onChange={handleChange} placeholder="예) 10기" />
          </FormSection>

          <FormSection title="모집 기간">
            {/* 모바일에서 날짜/시간 입력 편의를 위해 2열 유지하되 간격 조절 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <InputField label="모집 시작일 *" name="recruitStartDate" type="date" value={form.recruitStartDate} onChange={handleChange} />
                <InputField label="모집 시작 시간 *" name="recruitStartTime" type="time" value={form.recruitStartTime} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <InputField label="모집 마감일 *" name="recruitEndDate" type="date" value={form.recruitEndDate} onChange={handleChange} />
                <InputField label="모집 마감 시간 *" name="recruitEndTime" type="time" value={form.recruitEndTime} onChange={handleChange} />
              </div>
            </div>
          </FormSection>

          <FormSection title="면접 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField label="면접 장소 *" name="interviewLocation" value={form.interviewLocation} onChange={handleChange} />
              <InputField label="면접 날짜 *" name="interviewDate1" type="date" value={form.interviewDate1} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <InputField label="면접 앞타임 *" name="interviewStartTime" type="time" value={form.interviewStartTime} onChange={handleChange} />
                <InputField label="면접 뒷타임 *" name="interviewEndTime" type="time" value={form.interviewEndTime} onChange={handleChange} />
              </div>
            </div>
            <InputField label="면접 노출용 표기" name="interviewEndTimeDisplay" value={`${form.interviewStartTime}-${form.interviewEndTime}`} readOnly placeholder="예) 15:30-16:30" />
          </FormSection>

          <FormSection title="발표 일정">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
              <InputField label="1차 발표일 *" name="firstAnnouncementDate" type="date" value={form.firstAnnouncementDate} onChange={handleChange} />
              <InputField label="톡방 초대일 *" name="groupChatInviteDate" type="date" value={form.groupChatInviteDate} onChange={handleChange} />
              <InputField label="최종 발표일 *" name="finalAnnouncementDate" type="date" value={form.finalAnnouncementDate} onChange={handleChange} />
            </div>
          </FormSection>

          <FormSection title="활동 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField label="회비 (원) *" name="fee" value={form.fee} onChange={handleChange} placeholder="예) 30000" />
              <InputField label="활동 기간 (개월) *" name="semester" value={form.semester} onChange={handleChange} placeholder="예) 6" />
            </div>
          </FormSection>

          <FormSection title="OT 정보">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <InputField label="OT 날짜 *" name="otDate" type="date" value={form.otDate} onChange={handleChange} />
              <InputField label="OT 시간 *" name="otTime" type="time" value={form.otTime} onChange={handleChange} />
            </div>
          </FormSection>

          {/* 저장 버튼 하단 버튼 디자인 */}
          <div className="flex justify-end pt-4 sm:pt-6">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-black text-slate-800 border-l-4 border-blue-500 pl-3">
        {title}
      </h2>
      <div className="space-y-4 px-1">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, readOnly }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] sm:text-[11px] font-black text-slate-400 ml-1">
        {label} {label.includes("*") && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full p-3.5 border border-slate-200 rounded-2xl text-[14px] font-bold text-slate-700 outline-none transition-all ${
          readOnly 
          ? 'bg-slate-50 cursor-not-allowed' 
          : 'bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
        }`}
      />
    </div>
  );
}