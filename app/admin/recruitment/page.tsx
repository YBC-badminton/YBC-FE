"use client";

import React, { useState } from "react";

interface RecruitmentSchedule {
  // 기수 정보
  generation: string;
  // 모집 기간
  recruitStartDate: string;
  recruitEndDate: string;
  recruitStartTime: string;
  recruitEndTime: string;
  // 면접 정보
  interviewDate1: string;
  interviewDate2: string;
  interviewStartTime: string;
  interviewEndTime: string;
  interviewLocation: string;
  // 발표 날짜
  firstAnnouncementDate: string;
  finalAnnouncementDate: string;
  // 활동 정보
  fee: string;
  semester: string;
  activityDay: string;
  // OT 정보
  otDate: string;
  otTime: string;
}

const initialForm: RecruitmentSchedule = {
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
};

export default function RecruitmentPage() {
  const [form, setForm] = useState<RecruitmentSchedule>(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // TODO: API 연동
    console.log("submit", form);
    alert("모집 일정이 저장되었습니다.");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">모집 일정 관리</h1>
        <p className="text-gray-500 text-sm mt-1">
          동아리 모집 일정을 설정하고 관리하세요.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-10">
        {/* 기수 정보 */}
        <FormSection title="기수 정보">
          <InputField
            label="기수"
            name="generation"
            value={form.generation}
            onChange={handleChange}
            placeholder="예: 30기"
          />
        </FormSection>

        {/* 모집 기간 */}
        <FormSection title="모집 기간">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="모집 시작일 *"
              name="recruitStartDate"
              type="date"
              value={form.recruitStartDate}
              onChange={handleChange}
            />
            <InputField
              label="모집 마감일 *"
              name="recruitEndDate"
              type="date"
              value={form.recruitEndDate}
              onChange={handleChange}
            />
            <InputField
              label="모집 시작시간"
              name="recruitStartTime"
              type="time"
              value={form.recruitStartTime}
              onChange={handleChange}
            />
            <InputField
              label="모집 마감시간"
              name="recruitEndTime"
              type="time"
              value={form.recruitEndTime}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* 면접 정보 */}
        <FormSection title="면접 정보">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="면접 날짜(1) *"
              name="interviewDate1"
              type="date"
              value={form.interviewDate1}
              onChange={handleChange}
            />
            <InputField
              label="면접 날짜(2)"
              name="interviewDate2"
              type="date"
              value={form.interviewDate2}
              onChange={handleChange}
            />
            <InputField
              label="면접 시작시간"
              name="interviewStartTime"
              type="time"
              value={form.interviewStartTime}
              onChange={handleChange}
            />
            <InputField
              label="면접 종료시간"
              name="interviewEndTime"
              type="time"
              value={form.interviewEndTime}
              onChange={handleChange}
            />
          </div>
          <InputField
            label="면접 장소"
            name="interviewLocation"
            value={form.interviewLocation}
            onChange={handleChange}
            placeholder="예: 학생회관 301호"
          />
        </FormSection>

        {/* 발표 날짜 */}
        <FormSection title="발표 날짜">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="1차 발표일 *"
              name="firstAnnouncementDate"
              type="date"
              value={form.firstAnnouncementDate}
              onChange={handleChange}
            />
            <InputField
              label="최종 발표일 *"
              name="finalAnnouncementDate"
              type="date"
              value={form.finalAnnouncementDate}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* 활동 정보 */}
        <FormSection title="활동 정보">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="회비 금액 *"
              name="fee"
              value={form.fee}
              onChange={handleChange}
              placeholder="예: 50,000"
            />
            <InputField
              label="활동 기간(학기) *"
              name="semester"
              value={form.semester}
              onChange={handleChange}
              placeholder="예: 2026년 1학기"
            />
          </div>
          <InputField
            label="활동 요일"
            name="activityDay"
            value={form.activityDay}
            onChange={handleChange}
            placeholder="예: 매주 화요일"
          />
        </FormSection>

        {/* OT 정보 */}
        <FormSection title="OT 정보">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="OT 날짜"
              name="otDate"
              type="date"
              value={form.otDate}
              onChange={handleChange}
            />
            <InputField
              label="OT 시간 *"
              name="otTime"
              type="time"
              value={form.otTime}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* 저장 버튼 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-700"
      />
    </div>
  );
}
