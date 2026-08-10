import Link from "next/link";
import { CUSTOMER_STATUS_LABELS } from "@/lib/domain/labels";
import { CUSTOMER_STATUSES, type CustomerFilters } from "@/lib/domain/types";

export function CustomerSearch({ filters }: { filters: CustomerFilters }) {
  const exportParams = new URLSearchParams();
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status) exportParams.set("status", filters.status);
  const exportHref = `/api/customers/export${exportParams.size ? `?${exportParams}` : ""}`;

  return (
    <form action="/customers" className="grid grid-cols-[minmax(0,1fr)_190px_auto_auto] gap-2 py-4 max-md:grid-cols-[minmax(0,1fr)_auto]" role="search">
      <label className="sr-only" htmlFor="customer-q">
        이름 또는 전화번호 검색
      </label>
      <input
        className="control max-md:col-span-2"
        id="customer-q"
        name="q"
        defaultValue={filters.q}
        maxLength={100}
        placeholder="이름 또는 전화번호"
      />
      <label className="sr-only" htmlFor="customer-status">
        고객 상태
      </label>
      <select className="control" id="customer-status" name="status" defaultValue={filters.status ?? ""}>
        <option value="">모든 상태</option>
        {CUSTOMER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {CUSTOMER_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button className="button button-primary" type="submit">
        검색
      </button>
      <Link className="button max-md:col-span-2" href={exportHref} prefetch={false}>
        <span className="max-sm:hidden">CSV 내보내기</span>
        <span className="sm:hidden">CSV</span>
      </Link>
    </form>
  );
}
