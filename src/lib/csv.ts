import type { Customer } from "@/lib/domain/types";
import { CUSTOMER_STATUS_LABELS, formatSeoulDateTime } from "@/lib/domain/labels";

const CSV_HEADERS = [
  "ID",
  "고객명",
  "전화번호",
  "이메일",
  "주소",
  "상태",
  "등록일시",
  "수정일시",
] as const;

export function escapeCsvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildCustomerCsv(customers: Customer[]): string {
  const rows = customers.map((customer) => [
    customer.id,
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    CUSTOMER_STATUS_LABELS[customer.status],
    formatSeoulDateTime(customer.created_at),
    formatSeoulDateTime(customer.updated_at),
  ]);

  const body = [CSV_HEADERS, ...rows]
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
