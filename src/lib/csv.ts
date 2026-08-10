import type { Customer } from "@/lib/domain/types";
import { formatSeoulDateTime, getCustomerStatusLabels } from "@/lib/domain/labels";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function escapeCsvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildCustomerCsv(customers: Customer[], locale: Locale = "ko"): string {
  const labels = getCustomerStatusLabels(locale);
  const rows = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    labels[customer.status],
    formatSeoulDateTime(customer.created_at, locale),
    formatSeoulDateTime(customer.updated_at, locale),
  ]);

  const body = [getDictionary(locale).csv.headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  return `\uFEFF${body}\r\n`;
}

export function buildCsvFileName(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "00";

  return `customers-${part("year")}${part("month")}${part("day")}-${part("hour")}${part("minute")}.csv`;
}
