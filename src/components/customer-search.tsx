import Link from "next/link";
import { CUSTOMER_STATUSES, type CustomerFilters } from "@/lib/domain/types";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function CustomerSearch({ filters, locale }: { filters: CustomerFilters; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const exportParams = new URLSearchParams({ lang: locale });
  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status) exportParams.set("status", filters.status);
  const exportHref = `/api/customers/export?${exportParams}`;

  return (
    <form action={localePath(locale, "/customers")} className="grid grid-cols-[minmax(0,1fr)_190px_auto_auto] gap-2 py-4 max-md:grid-cols-[minmax(0,1fr)_auto]" role="search">
      <label className="sr-only" htmlFor="customer-q">{dictionary.customers.searchLabel}</label>
      <input className="control max-md:col-span-2" id="customer-q" name="q" defaultValue={filters.q} maxLength={100} placeholder={dictionary.customers.searchPlaceholder} />
      <label className="sr-only" htmlFor="customer-status">{dictionary.customers.statusLabel}</label>
      <select className="control" id="customer-status" name="status" defaultValue={filters.status ?? ""}>
        <option value="">{dictionary.customers.allStatuses}</option>
        {CUSTOMER_STATUSES.map((status) => <option key={status} value={status}>{dictionary.statuses[status]}</option>)}
      </select>
      <button className="button button-primary" type="submit">{dictionary.common.search}</button>
      <Link className="button max-md:col-span-2" href={exportHref} prefetch={false}>
        <span className="max-sm:hidden">{dictionary.customers.exportCsv}</span>
        <span className="sm:hidden">CSV</span>
      </Link>
    </form>
  );
}
