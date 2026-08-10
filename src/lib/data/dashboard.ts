import { requireAuthContext } from "@/lib/auth/dal";
import type { CustomerStatus, Interaction } from "@/lib/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataAccessError } from "./errors";

export type DashboardSummary = Record<"TOTAL" | "NEW" | "BOOKED" | "COMPLETED", number>;

export type RecentInteraction = Interaction & {
  customers: { id: string; name: string } | null;
};

async function countCustomers(status?: CustomerStatus) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("customers").select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count, error } = await query;
  if (error) throw new DataAccessError("고객 현황을 불러오지 못했습니다.", error.code);
  return count ?? 0;
}

export async function getDashboardData(): Promise<{
  summary: DashboardSummary;
  recentInteractions: RecentInteraction[];
}> {
  await requireAuthContext();
  const supabase = await createSupabaseServerClient();

  const [total, newCount, booked, completed, interactions] = await Promise.all([
    countCustomers(),
    countCustomers("NEW"),
    countCustomers("BOOKED"),
    countCustomers("COMPLETED"),
    supabase
      .from("interactions")
      .select("id,customer_id,type,memo,created_at,created_by,customers(id,name),profiles(email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (interactions.error) {
    throw new DataAccessError("최근 상담을 불러오지 못했습니다.", interactions.error.code);
  }

  return {
    summary: { TOTAL: total, NEW: newCount, BOOKED: booked, COMPLETED: completed },
    recentInteractions: (interactions.data ?? []) as RecentInteraction[],
  };
}
