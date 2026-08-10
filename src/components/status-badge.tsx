import { getCustomerStatusLabels } from "@/lib/domain/labels";
import type { CustomerStatus } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";

const colors: Record<CustomerStatus, string> = {
  NEW: "bg-sky-600",
  CONTACTED: "bg-amber-600",
  BOOKED: "bg-emerald-700",
  COMPLETED: "bg-slate-500",
  CANCELLED: "bg-rose-700",
};

export function StatusBadge({ status, locale }: { status: CustomerStatus; locale: Locale }) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap text-xs font-bold text-[#34413c]">
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${colors[status]}`} />
      {getCustomerStatusLabels(locale)[status]}
    </span>
  );
}
