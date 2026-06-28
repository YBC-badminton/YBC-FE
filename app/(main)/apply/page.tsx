"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../../lib/axios";
import { useToast } from "../../../components/ui/Toast";
import { Calendar, FileText, CheckCircle } from "lucide-react"; // 💡 아이콘 임포트

interface FormData {
  name: string;
  gender: "남" | "여" | "";
  residence: string;
  age: string;
  phone: string;
  email: string;
  school: string;
  major: string;
  introduction: string;
  motivation: string;
  equipment: string;
  interviewTimes: string[];
  referral: string;
  referralDetail: string;
  operatorInterest: boolean;
  finalRemarks: string;
}

// 유입 경로 라벨 → API enum 매핑
const DISCOVERY_SOURCE_MAP: Record<string, string> = {
  에브리타임: "EVERYTIME",
  캠퍼스픽: "CAMPUSPICK",
  인스타그램: "INSTAGRAM",
  기타: "ETC",
};

const REFERRAL_OPTIONS = ["에브리타임", "캠퍼스픽", "인스타그램", "기타"];

export default function ApplyPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData>({
    name: "",
    gender: "",
    residence: "",
    age: "",
    phone: "",
    email: "",
    school: "",
    major: "",
    introduction: "",
    motivation: "",
    equipment: "",
    interviewTimes: [],
    referral: "",
    referralDetail: "",
    operatorInterest: false,
    finalRemarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [interviewOptions, setInterviewOptions] = useState<string[]>([]);
  const [interviewTimeMap, setInterviewTimeMap] = useState<
    Record<string, string>
  >({});

  const [isRecruiting, setIsRecruiting] = useState<boolean | null>(null);

  const [recruitmentInfo, setRecruitmentInfo] = useState({
    term: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 안내 문구 API 호출
        const msgRes = await api.get("/recruitments/message");
        setRecruitmentInfo({
          term: msgRes.data.term,
          message: msgRes.data.recruitmentMessage,
        });
        setIsRecruiting(msgRes.data.recruiting);

        // 2. 면접 시간 API 호출
        const timeRes = await api.get("/recruitments/interview-times");
        if (timeRes.data.recruiting) {
          // 모집 중일 때만 시간 데이터 구성
          const { interviewDate, interviewFirstTime, interviewSecondTime } =
            timeRes.data;
          const options = [
            `${interviewDate} ${interviewFirstTime}`,
            `${interviewDate} ${interviewSecondTime}`,
          ];
          const map = {
            [`${interviewDate} ${interviewFirstTime}`]: "FIRST_SESSION",
            [`${interviewDate} ${interviewSecondTime}`]: "SECOND_SESSION",
          };
          setInterviewOptions(options);
          setInterviewTimeMap(map);
        }
      } catch (err) {
        console.error("데이터 로드 실패", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    field: keyof FormData,
    value: string | boolean | string[],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (option: string) => {
    setForm((prev) => ({
      ...prev,
      interviewTimes: prev.interviewTimes.includes(option)
        ? prev.interviewTimes.filter((t) => t !== option)
        : [...prev.interviewTimes, option],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.gender ||
      !form.residence ||
      !form.age ||
      !form.phone ||
      !form.email ||
      !form.school ||
      !form.major ||
      !form.introduction ||
      !form.motivation ||
      !form.equipment ||
      form.interviewTimes.length === 0 ||
      !form.referral
    ) {
      showToast("모든 필수 항목을 입력해 주세요.", "error");
      return;
    }

    if (form.referral === "기타" && !form.referralDetail) {
      showToast("기타 경로를 입력해 주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        address: form.residence,
        gender: form.gender === "남" ? "MALE" : "FEMALE",
        age: Number(form.age),
        phone: form.phone,
        email: form.email,
        university: form.school,
        major: form.major,
        introduction: form.introduction,
        motivation: form.motivation,
        equipment: form.equipment,
        interviewTimes: form.interviewTimes.map((t) => interviewTimeMap[t]),
        discoverySource: DISCOVERY_SOURCE_MAP[form.referral],
        discoveryEtc: form.referral === "기타" ? form.referralDetail : "",
        wantsStaff: form.operatorInterest,
        finalComment: form.finalRemarks,
        status: "NONE",
      };

      await api.post("/applications", payload);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "제출 중 오류가 발생했습니다. 다시 시도해 주세요.";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. 데이터 로딩 중 처리
  if (isRecruiting === null) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        불러오는 중...
      </div>
    );
  }

  // 2. 모집 기간이 아닐 때 (isRecruiting === false)
  if (!isRecruiting) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🏸</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            모집 기간이 아닙니다
          </h2>
          <p className="text-slate-500 font-bold leading-relaxed">
            현재는 신규 부원 모집 기간이 아닙니다.
            <br />
            다음 기수 모집 때 꼭 다시 지원해 주세요!
          </p>
          <Link href="/faq">
            <button className="mt-4 w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 transition-all">
              문의하기 페이지로 이동
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 제출 완료 화면
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-12 px-6 lg:px-24 font-sans select-none flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-[#F2F8E1] rounded-full flex items-center justify-center mx-auto border border-[#E2EBC8]">
            <svg
              className="w-10 h-10 text-[#5b6b0f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            지원 완료!
          </h2>
          <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            양배추 배드민턴 동아리에 지원해 주셔서 감사합니다.
            <br />
            면접 일정은 카카오톡으로 안내드리겠습니다.
          </p>
          <Link href="/">
            <button className="mt-4 bg-[#5b6b0f] text-white font-bold px-10 py-3.5 rounded-full shadow-md hover:bg-[#46530c] transition-all duration-300">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6 lg:px-24 font-sans select-none">
      <div className="max-w-screen-xl mx-auto space-y-12">
        {/* 헤더 - activities, reviews 스타일 통일 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800">
            {recruitmentInfo?.term || "신규"} 지원하기
          </h1>
          <p className="text-slate-400 font-bold">
            양배추 배드민턴 동아리에 오신 것을 환영합니다! 아래 양식을 작성하여
            지원해 주세요.
          </p>
        </div>

        {/* 모집 안내 - 구글 폼처럼 지원서 상단에 줄글로 정보 제공 */}
        <div className="max-w-3xl mx-auto bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-10 space-y-5 text-slate-600">
          <div className="border-l-4 border-[#5b6b0f] pl-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              양배추(YBC) 배드민턴 동아리 {recruitmentInfo?.term} 신규 부원 모집
              안내
            </h2>
            <p className="text-sm text-slate-400 font-bold mt-1">
              지원서를 작성하기 전, 아래 안내를 꼭 읽어주세요.
            </p>
          </div>

          <div className="space-y-5 text-sm sm:text-[15px] font-medium leading-relaxed break-keep">
            <div className="text-slate-600 leading-relaxed break-keep">
              {recruitmentInfo ? (
                <p className="whitespace-pre-line">{recruitmentInfo.message}</p>
              ) : (
                <p>정보를 불러오는 중입니다...</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Calendar className="w-4 h-4 text-[#5b6b0f]" />
                <p className="font-black text-slate-800">정기 활동 안내</p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>화요일 · 마곡실내배드민턴장 (16:00 - 19:00)</li>
                <li>
                  토요일 · 망원나들목체육관 (13:30 - 15:30 / 16:00 - 18:00)
                </li>
                <li>
                  정기 운동 외에도 번개 모임 및 다양한 이벤트가 진행됩니다.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <FileText className="w-4 h-4 text-[#5b6b0f]" />
                <p className="font-black text-slate-800">모집 및 면접 절차</p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>아래 지원서를 작성해 제출해 주세요.</li>
                <li>제출해 주신 내용을 바탕으로 대면 면접을 진행합니다.</li>
                <li>
                  가능한 면접 시간에 모두 체크해 주시면 일정 조율에 도움이
                  됩니다.
                </li>
                <li>
                  합격 및 면접 일정은 입력하신 전화번호로 개별 안내드립니다.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle className="w-4 h-4 text-[#5b6b0f]" />
                <p className="font-black text-slate-800">유의 사항</p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>배드민턴화는 필수이며, 라켓은 없으셔도 지원 가능합니다.</li>
                <li>
                  제출 후에는 내용 수정이 불가하오니 꼼꼼히 확인해 주세요.
                </li>
                <li>* 표시 항목은 모두 필수 입력 항목입니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 폼 - 가독성을 위해 max-w-3xl 제한 */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10">
          {/* 기본 정보 */}
          <FormSection
            title="기본 정보"
            description="지원자의 기본 정보를 입력해 주세요."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="성함"
                required
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                placeholder="홍길동"
              />
              <FormRadioGroup
                label="성별"
                required
                options={["남", "여"]}
                value={form.gender}
                onChange={(v) => handleChange("gender", v)}
              />
            </div>

            <FormInput
              label="거주지"
              required
              value={form.residence}
              onChange={(v) => handleChange("residence", v)}
              placeholder="서울시 강남구"
              description="구 단위로 작성해 주세요."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="나이"
                required
                value={form.age}
                onChange={(v) => handleChange("age", v)}
                placeholder="24"
                type="number"
                description="만 나이 적용 전의 나이를 기입해 주세요."
              />
              <FormInput
                label="전화번호"
                required
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                placeholder="01012345678"
                type="tel"
                description="합격 통지 및 카톡방 초대에 사용됩니다."
              />
            </div>

            <FormInput
              label="이메일"
              required
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              placeholder="카카오톡 가입 이메일을 작성해주세요."
              type="email"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="학교"
                required
                value={form.school}
                onChange={(v) => handleChange("school", v)}
                placeholder="OO대학교"
              />
              <FormInput
                label="학과"
                required
                value={form.major}
                onChange={(v) => handleChange("major", v)}
                placeholder="컴퓨터공학과"
              />
            </div>
          </FormSection>

          {/* 자기소개 및 지원 동기 */}
          <FormSection
            title="자기소개 및 지원 동기"
            description="본인에 대해 자유롭게 알려주세요."
          >
            <FormTextarea
              label="자기소개"
              required
              value={form.introduction}
              onChange={(v) => handleChange("introduction", v)}
              placeholder="형식에 구애받지 않고 자유롭게 적어주시면 됩니다."
              rows={5}
            />
            <FormTextarea
              label="지원 동기"
              required
              value={form.motivation}
              onChange={(v) => handleChange("motivation", v)}
              placeholder="본 동아리에 지원하게 된 동기를 적어주세요."
              rows={5}
            />
          </FormSection>

          {/* 장비 정보 */}
          <FormSection
            title="장비 정보"
            description="배드민턴 활동에 필요한 장비 정보를 알려주세요."
          >
            <FormInput
              label="보유한 라켓, 신발 등 장비 명"
              required
              value={form.equipment}
              onChange={(v) => handleChange("equipment", v)}
              placeholder="예) 요넥스 아크세이버 11, 요넥스 파워쿠션 65Z"
              description="배드민턴화는 필수입니다. 라켓이 없으신 경우 '없음'으로 기입해 주세요."
            />
          </FormSection>

          {/* 면접 시간 */}
          <FormSection
            title="면접 시간"
            description="가능하신 시간에 전부 체크해 주시면 됩니다."
          >
            {interviewOptions.length > 0 ? (
              <FormCheckboxGroup
                label="면접 가능 시간"
                required
                options={interviewOptions}
                value={form.interviewTimes}
                onChange={handleCheckbox}
              />
            ) : (
              <p className="text-sm text-slate-400 font-bold">
                면접 일정을 불러오는 중입니다...
              </p>
            )}
          </FormSection>

          {/* 추가 정보 */}
          <FormSection title="추가 정보">
            <FormRadioGroup
              label="어떻게 양배추를 알게 되셨나요?"
              required
              options={REFERRAL_OPTIONS}
              value={form.referral}
              onChange={(v) => handleChange("referral", v)}
              direction="vertical"
            />
            {form.referral === "기타" && (
              <FormInput
                label="기타 경로"
                required
                value={form.referralDetail}
                onChange={(v) => handleChange("referralDetail", v)}
                placeholder="예) 지인 소개"
              />
            )}

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.operatorInterest}
                  onChange={(e) =>
                    handleChange("operatorInterest", e.target.checked)
                  }
                  className="mt-1 w-5 h-5 rounded border-slate-300 accent-[#5b6b0f]"
                />
                <div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition">
                    운영진 지원을 희망합니다
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    동아리 운영에 관심이 있으시다면 체크해 주세요. (선택)
                  </p>
                </div>
              </label>
            </div>

            <FormTextarea
              label="마지막으로 하고 싶은 말"
              value={form.finalRemarks}
              onChange={(v) => handleChange("finalRemarks", v)}
              placeholder="자유롭게 적어주세요. (선택)"
              rows={3}
            />
          </FormSection>

          {/* 제출 버튼 */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5b6b0f] text-white font-bold text-base sm:text-lg py-4 sm:py-5 rounded-2xl shadow-md hover:bg-[#46530c] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "제출 중..." : "지원서 제출하기"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4 font-bold">
              제출 후 수정이 불가하오니 내용을 꼼꼼히 확인해 주세요.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 재사용 컴포넌트 ---

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-400 font-bold mt-1">{description}</p>
        )}
      </div>
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}

function FormInput({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  description,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {description && <p className="text-xs text-slate-400">{description}</p>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5b6b0f]/20 focus:border-[#5b6b0f]/40 transition"
      />
    </div>
  );
}

function FormTextarea({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5b6b0f]/20 focus:border-[#5b6b0f]/40 transition resize-none"
      />
    </div>
  );
}

function FormRadioGroup({
  label,
  required,
  options,
  value,
  onChange,
  direction = "horizontal",
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  direction?: "horizontal" | "vertical";
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div
        className={`flex ${direction === "vertical" ? "flex-col gap-2.5" : "flex-wrap gap-3"}`}
      >
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 sm:py-3 rounded-xl border text-sm font-bold transition-all ${
              value === option
                ? "border-[#5b6b0f] bg-[#F2F8E1] text-[#5b6b0f] shadow-sm"
                : "border-gray-200 bg-slate-50 text-slate-500 hover:border-slate-300"
            }`}
          >
            {/* 💡 hidden 대신 sr-only 사용 */}
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                value === option ? "border-[#5b6b0f]" : "border-slate-300"
              }`}
            >
              {value === option && (
                <div className="w-2 h-2 rounded-full bg-[#5b6b0f]" />
              )}
            </div>
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function FormCheckboxGroup({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string[];
  onChange: (option: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-600">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 sm:py-3 rounded-xl border text-sm font-bold transition-all ${
              value.includes(option)
                ? "border-[#5b6b0f] bg-[#F2F8E1] text-[#5b6b0f] shadow-sm"
                : "border-gray-200 bg-slate-50 text-slate-500 hover:border-slate-300"
            }`}
          >
            {/* 💡 hidden 대신 sr-only 사용 */}
            <input
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <div
              className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 ${
                value.includes(option)
                  ? "border-[#5b6b0f] bg-[#5b6b0f]"
                  : "border-slate-300"
              }`}
            >
              {value.includes(option) && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
