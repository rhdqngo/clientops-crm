import type { CustomerStatus, InteractionType, UserRole } from "./types";
import { intlLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function getCustomerStatusLabels(locale: Locale): Record<CustomerStatus, string> {
  return getDictionary(locale).statuses;
}

export function getInteractionTypeLabels(locale: Locale): Record<InteractionType, string> {
  return getDictionary(locale).interactionTypes;
}

export function getUserRoleLabels(locale: Locale): Record<UserRole, string> {
  return getDictionary(locale).roles;
}

export function formatSeoulDateTime(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: locale === "ko" ? "numeric" : "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}
