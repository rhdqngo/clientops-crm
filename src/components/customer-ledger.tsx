import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatSeoulDateTime } from "@/lib/domain/labels";
import type { PaginatedCustomers } from "@/lib/domain/types";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

function listHref(result: PaginatedCustomers, page: number, locale: Locale) {
  const params = new URLSearchParams();
  if (result.filters.q) params.set("q", result.filters.q);
  if (result.filters.status) params.set("status", result.filters.status);
  if (page > 1) params.set("page", String(page));
  const path = localePath(locale, "/customers");
  return `${path}${params.size ? `?${params}` : ""}`;
}

export function CustomerLedger({ result, locale }: { result: PaginatedCustomers; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const labels = dictionary.customers;
  const returnTo = listHref(result, result.page, locale);

  if (result.items.length === 0) {
    const filtered = Boolean(result.filters.q || result.filters.status);
    return (
      <div className="data-surface px-5 py-12 text-center">
        <h2 className="text-base font-bold">{filtered ? labels.noFiltered : labels.noCustomers}</h2>
        <p className="mt-2 text-sm text-[#64706b]">{filtered ? labels.noFilteredHelp : labels.noCustomersHelp}</p>
        <Link className="button button-primary mt-5" href={filtered ? localePath(locale, "/customers") : localePath(locale, "/customers/new")}>
          {filtered ? labels.resetFilters : labels.newCustomer}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="data-surface">
        <table className="w-full table-fixed border-collapse max-sm:hidden">
          <caption className="sr-only">{labels.searchResults}</caption>
          <thead className="bg-[#eef1ed] text-left text-xs text-[#4f5b56]">
            <tr className="h-10">
              <th className="w-[31%] px-4 font-bold">{labels.name}</th>
              <th className="w-[13%] px-4 font-bold">{labels.status}</th>
              <th className="w-[18%] px-4 font-bold">{labels.phone}</th>
              <th className="w-[20%] px-4 font-bold max-lg:hidden">{labels.email}</th>
              <th className="w-[18%] px-4 font-bold">{labels.updatedAt}</th>
              <th className="w-16 px-3"><span className="sr-only">{labels.actions}</span></th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((customer) => (
              <tr className="h-[58px] border-t border-[#e1e5e2] focus-within:bg-[#f0f7f4] hover:bg-[#f8faf8]" key={customer.id}>
                <td className="px-4 py-2.5"><span className="block overflow-hidden text-ellipsis font-bold" title={customer.name}>{customer.name}</span></td>
                <td className="px-4 py-2.5"><StatusBadge status={customer.status} locale={locale} /></td>
                <td className="truncate px-4 py-2.5 text-sm text-[#59655f]">{customer.phone ?? dictionary.common.noValue}</td>
                <td className="truncate px-4 py-2.5 text-sm text-[#59655f] max-lg:hidden" title={customer.email ?? undefined}>{customer.email ?? dictionary.common.noValue}</td>
                <td className="px-4 py-2.5 text-sm text-[#59655f]">{formatSeoulDateTime(customer.updated_at, locale)}</td>
                <td className="px-3 py-2.5 text-right">
                  <Link className="inline-flex min-h-11 min-w-11 items-center justify-center font-bold text-[#0d6b58] underline-offset-4 hover:underline" href={`${localePath(locale, `/customers/${customer.id}`)}?returnTo=${encodeURIComponent(returnTo)}`}>
                    {dictionary.common.open}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="divide-y divide-[#e1e5e2] sm:hidden" aria-label={labels.searchResults}>
          {result.items.map((customer) => (
            <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-1 py-3.5" key={customer.id}>
              <div className="min-w-0">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <span className="min-w-0 break-words text-[0.95rem] font-bold leading-5">{customer.name}</span>
                  <StatusBadge status={customer.status} locale={locale} />
                </div>
                <div className="mt-1 text-sm text-[#59655f]">{customer.phone ?? labels.noPhone}</div>
                <div className="mt-1 text-xs text-[#75807b]">{formatSeoulDateTime(customer.updated_at, locale)}</div>
              </div>
              <Link className="inline-flex min-h-11 min-w-11 items-center justify-center self-center font-bold text-[#0d6b58]" href={`${localePath(locale, `/customers/${customer.id}`)}?returnTo=${encodeURIComponent(returnTo)}`}>
                {dictionary.common.open}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <nav className="mt-5 flex items-center justify-center gap-2" aria-label={labels.listPagination}>
        {result.page > 1 ? <Link className="button" href={listHref(result, result.page - 1, locale)} rel="prev">{dictionary.common.previous}</Link> : <span className="button opacity-45" aria-disabled="true">{dictionary.common.previous}</span>}
        <span className="inline-flex min-h-11 items-center px-2 text-sm font-bold">{result.page} / {result.totalPages}</span>
        {result.page < result.totalPages ? <Link className="button" href={listHref(result, result.page + 1, locale)} rel="next">{dictionary.common.next}</Link> : <span className="button opacity-45" aria-disabled="true">{dictionary.common.next}</span>}
      </nav>
    </>
  );
}
