import type {
  Customer,
  CustomerFilters,
  Interaction,
  PaginatedCustomers,
} from "@/lib/domain/types";
import { requireAuthContext } from "@/lib/auth/dal";
import { CUSTOMER_PAGE_SIZE, getTotalPages } from "@/lib/pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DataAccessError } from "./errors";

export async function listCustomers(
  filters: CustomerFilters,
  pageSize = CUSTOMER_PAGE_SIZE,
): Promise<PaginatedCustomers> {
  await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("list_customers", {
    p_search: filters.q || null,
    p_status: filters.status ?? null,
    p_page: filters.page,
    p_page_size: pageSize,
  });

  if (error) throw new DataAccessError("고객 목록을 불러오지 못했습니다.", error.code);
  const rows = data ?? [];
  const total = Number(rows[0]?.total_count ?? 0);

  if (filters.page > 1 && rows.length === 0) {
    const firstPage = await listCustomers({ ...filters, page: 1 }, pageSize);
    if (filters.page > firstPage.totalPages) {
      throw new DataAccessError("요청한 고객 목록 페이지가 범위를 벗어났습니다.", "INVALID_PAGE");
    }
  }

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
    page: filters.page,
    pageSize,
    total,
    totalPages: getTotalPages(total, pageSize),
    filters,
  };
}

export async function listAllFilteredCustomers(
  filters: Omit<CustomerFilters, "page">,
): Promise<Customer[]> {
  const pageSize = 100;
  const customers: Customer[] = [];
  let page = 1;

  while (true) {
    const result = await listCustomers({ ...filters, page }, pageSize);
    customers.push(...result.items);
    if (customers.length >= result.total || result.items.length < pageSize) break;
    page += 1;
  }

  return customers;
}

export async function getCustomer(customerId: string): Promise<Customer | null> {
  await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id,name,phone,email,address,status,created_at,updated_at")
    .eq("id", customerId)
    .maybeSingle();

  if (error) throw new DataAccessError("고객 정보를 불러오지 못했습니다.", error.code);
  return data;
}

export async function getCustomerInteractions(customerId: string): Promise<Interaction[]> {
  await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("id,customer_id,type,memo,created_at,created_by,profiles(email)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw new DataAccessError("상담 이력을 불러오지 못했습니다.", error.code);
  return (data ?? []) as Interaction[];
}

export async function countCustomerInteractions(customerId: string): Promise<number> {
  await requireAuthContext();
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("interactions")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId);
  if (error) throw new DataAccessError("연결된 상담 수를 확인하지 못했습니다.", error.code);
  return count ?? 0;
}
