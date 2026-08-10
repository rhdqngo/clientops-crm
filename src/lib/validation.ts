import { z } from "zod";
import {
  CUSTOMER_STATUSES,
  INTERACTION_TYPES,
  type CustomerStatus,
} from "@/lib/domain/types";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const loginSchema = z.object({
  email: z.string().trim().email("올바른 이메일 주소를 입력해 주세요.").max(254),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const customerInputSchema = z.object({
  name: z.string().trim().min(1, "고객명은 필수입니다.").max(100, "고객명은 100자 이하여야 합니다."),
  phone: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .min(7, "전화번호는 7자 이상이어야 합니다.")
      .max(30, "전화번호는 30자 이하여야 합니다.")
      .regex(/^[0-9+()\-\s]+$/, "전화번호 형식을 확인해 주세요.")
      .optional(),
  ),
  email: z.preprocess(
    emptyToUndefined,
    z.string().trim().email("올바른 이메일 주소를 입력해 주세요.").max(254).optional(),
  ),
  address: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(300, "주소는 300자 이하여야 합니다.").optional(),
  ),
  status: z.enum(CUSTOMER_STATUSES),
});

export const interactionInputSchema = z.object({
  type: z.enum(INTERACTION_TYPES),
  memo: z
    .string()
    .trim()
    .min(1, "상담 메모를 입력해 주세요.")
    .max(2000, "상담 메모는 2,000자 이하여야 합니다."),
});

export const customerIdSchema = z.string().uuid("올바르지 않은 고객 ID입니다.");

export const customerFiltersSchema = z.object({
  q: z.string().trim().max(100, "검색어는 100자 이하여야 합니다."),
  status: z.preprocess(emptyToUndefined, z.enum(CUSTOMER_STATUSES).optional()),
  page: z.coerce.number().int().min(1, "페이지는 1 이상이어야 합니다."),
});

export function parseCustomerFilters(input: {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
}) {
  return customerFiltersSchema.parse({
    q: Array.isArray(input.q) ? input.q[0] : input.q ?? "",
    status: Array.isArray(input.status) ? input.status[0] : input.status,
    page: Array.isArray(input.page) ? input.page[0] : input.page ?? 1,
  });
}

export function normalizePhone(value: string): string {
  return value.replace(/(?!^)\+|[^0-9+]/g, "");
}

export function isCustomerStatus(value: string): value is CustomerStatus {
  return CUSTOMER_STATUSES.includes(value as CustomerStatus);
}
