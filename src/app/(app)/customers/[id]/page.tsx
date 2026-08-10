import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { DeleteCustomerDialog } from "@/components/delete-customer-dialog";
import { InteractionForm } from "@/components/interaction-form";
import { InteractionTimeline } from "@/components/interaction-timeline";
import { StatusBadge } from "@/components/status-badge";
import { requirePageAuth } from "@/lib/auth/dal";
import { countCustomerInteractions, getCustomer, getCustomerInteractions } from "@/lib/data/customers";
import { formatSeoulDateTime } from "@/lib/domain/labels";
import { safeCustomerReturnTo } from "@/lib/navigation";
import { customerIdSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "고객 상세" };

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[]; created?: string }>;
}) {
  const { id: rawId } = await params;
  const id = customerIdSchema.safeParse(rawId);
  if (!id.success) notFound();

  const query = await searchParams;
  const returnTo = safeCustomerReturnTo(query.returnTo);
  const [{ profile }, customer, interactions, interactionCount] = await Promise.all([
    requirePageAuth(),
    getCustomer(id.data),
    getCustomerInteractions(id.data),
    countCustomerInteractions(id.data),
  ]);
  if (!customer) notFound();

  return (
    <div className="page-wrap">
      <div className="page-title-row items-start">
        <div className="min-w-0">
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href={returnTo}>← 고객 목록</Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="page-title break-words">{customer.name}</h1>
            <StatusBadge status={customer.status} />
          </div>
          <p className="mt-2 text-sm text-[#64706b]">최근 수정 {formatSeoulDateTime(customer.updated_at)}</p>
        </div>
      </div>

      {query.created === "1" && <div className="message mt-4" role="status">새 고객을 등록했습니다.</div>}

      <div className="mt-7 grid gap-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
        <section aria-labelledby="customer-information-heading">
          <h2 className="section-heading mb-3" id="customer-information-heading">고객 정보</h2>
          <div className="border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7">
            <CustomerForm mode="edit" customer={customer} />
          </div>
          {profile.role === "ADMIN" && (
            <div className="mt-8 border-t border-[#e1b9b4] pt-5">
              <h2 className="section-heading text-[#7c3028]">위험 작업</h2>
              <p className="mt-2 text-sm leading-6 text-[#64706b]">삭제 시 고객과 연결 상담 기록이 모두 영구 제거됩니다.</p>
              <div className="mt-4">
                <DeleteCustomerDialog
                  customerId={customer.id}
                  customerName={customer.name}
                  interactionCount={interactionCount}
                  returnTo={returnTo}
                />
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="interaction-history-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="section-heading" id="interaction-history-heading">상담 타임라인</h2>
            <span className="text-sm text-[#64706b]">{interactionCount.toLocaleString("ko-KR")}건</span>
          </div>
          <InteractionTimeline interactions={interactions} />
          <div className="mt-8">
            <h2 className="section-heading mb-3">상담 추가</h2>
            <div className="border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7">
              <InteractionForm customerId={customer.id} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
