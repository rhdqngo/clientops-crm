import { z } from "zod";
import {
  CUSTOMER_STATUSES,
  INTERACTION_TYPES,
  type CustomerStatus,
} from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export function getLoginSchema(locale: Locale) {
  const messages = getDictionary(locale).errors;
  return z.object({
    email: z.string().trim().email(messages.emailFormat).max(254),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export function getCustomerInputSchema(locale: Locale) {
  const messages = getDictionary(locale).errors;
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired).max(100, messages.nameMax),
    phone: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(7, messages.phoneMin)
        .max(30, messages.phoneMax)
        .regex(/^[0-9+()\-\s]+$/, messages.phoneFormat)
        .optional(),
    ),
    email: z.preprocess(
      emptyToUndefined,
      z.string().trim().email(messages.emailFormat).max(254).optional(),
    ),
    address: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).max(300, messages.addressMax).optional(),
    ),
    status: z.enum(CUSTOMER_STATUSES),
  });
}

export function getInteractionInputSchema(locale: Locale) {
  const messages = getDictionary(locale).errors;
  return z.object({
    type: z.enum(INTERACTION_TYPES),
    memo: z
      .string()
      .trim()
      .min(1, messages.memoRequired)
      .max(2000, messages.memoMax),
  });
}

export function getCustomerIdSchema(locale: Locale) {
  return z.string().uuid(getDictionary(locale).errors.invalidCustomerId);
}

export function getCustomerFiltersSchema(locale: Locale) {
  const messages = getDictionary(locale).errors;
  return z.object({
    q: z.string().trim().max(100, messages.searchMax),
    status: z.preprocess(emptyToUndefined, z.enum(CUSTOMER_STATUSES).optional()),
    page: z.coerce.number().int().min(1, messages.pageMin),
  });
}

export function parseCustomerFilters(
  input: {
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  },
  locale: Locale = "ko",
) {
  return getCustomerFiltersSchema(locale).parse({
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
