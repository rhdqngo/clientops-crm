import type { Metadata } from "next";
import Link from "next/link";
import { CUSTOMER_STATUS_LABELS, formatSeoulDateTime, INTERACTION_TYPE_LABELS } from "@/lib/domain/labels";
import type { CustomerStatus } from "@/lib/domain/types";
import { getDashboardData } from "@/lib/data/dashboard";

export const metadata: Metadata = { title: "대시보드" };

const summaries: Array<{ key: "TOTAL" | "NEW" | "BOOKED" | "COMPLETED"; label: string; status?: CustomerStatus }> = [
  { key: "TOTAL", label: "전체" },
  { key: "NEW", label: CUSTOMER_STATUS_LABELS.NEW, status: "NEW" },
  { key: "BOOKED", label: CUSTOMER_STATUS_LABELS.BOOKED, status: "BOOKED" },
  { key: "COMPLETED", label: CUSTOMER_STATUS_LABELS.COMPLETED, status: "COMPLETED" },
];

export default async function DashboardPage() {
  const { summary, recentInteractions } = await getDashboardData();
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <h1 className="page-title">대시보드</h1>
        <Link className="button button-primary" href="/customers/new">새 고객</Link>
      </div>

      <section className="mt-6" aria-labelledby="customer-summary-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading" id="customer-summary-heading">고객 현황</h2>
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href="/customers">고객 원장 열기</Link>
        </div>
        <div className="grid grid-cols-2 border-y border-[#d5dbd7] bg-white md:grid-cols-4">
          {summaries.map((item) => {
            const href = item.status ? `/customers?status=${item.status}` : "/customers";
            return (
              <Link className="border-[#d5dbd7] px-5 py-5 not-last:border-r max-md:nth-[2]:border-r-0 max-md:nth-[n+3]:border-t" href={href} key={item.key}>
                <span className="block text-sm font-bold text-[#59655f]">{item.label}</span>
                <span className="mt-2 block text-3xl font-extrabold tracking-[-0.04em]">{summary[item.key].toLocaleString("ko-KR")}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="recent-interactions-heading">
        <h2 className="section-heading mb-3" id="recent-interactions-heading">최근 상담</h2>
        {recentInteractions.length === 0 ? (
          <div className="data-surface px-5 py-10 text-center">
            <p className="font-bold">아직 상담 기록이 없습니다</p>
            <p className="mt-2 text-sm text-[#64706b]">고객 상세에서 첫 상담을 추가할 수 있습니다.</p>
          </div>
        ) : (
          <ol className="data-surface divide-y divide-[#e1e5e2]">
            {recentInteractions.map((interaction) => (
              <li className="grid gap-2 px-4 py-4 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:items-center" key={interaction.id}>
                <div className="text-sm text-[#59655f]">{formatSeoulDateTime(interaction.created_at)}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{interaction.customers?.name ?? "삭제된 고객"}</span>
                    <span className="text-xs font-bold text-[#0d6b58]">{INTERACTION_TYPE_LABELS[interaction.type]}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#64706b]">{interaction.memo}</p>
                </div>
                {interaction.customers && (
                  <Link className="inline-flex min-h-11 items-center font-bold text-[#0d6b58]" href={`/customers/${interaction.customers.id}`}>
                    열기
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
