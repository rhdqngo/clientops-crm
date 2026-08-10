import type { CustomerStatus, InteractionType, UserRole } from "./types";

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  NEW: "신규",
  CONTACTED: "연락 완료",
  BOOKED: "예약",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  PHONE: "전화",
  SMS: "문자",
  EMAIL: "이메일",
  VISIT: "방문",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "관리자",
  STAFF: "스태프",
};

const seoulDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatSeoulDateTime(value: string | Date): string {
  return seoulDateTimeFormatter
    .format(typeof value === "string" ? new Date(value) : value)
    .replace(/\bAM\b|a\.m\./gi, "오전")
    .replace(/\bPM\b|p\.m\./gi, "오후");
}
