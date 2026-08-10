export const USER_ROLES = ["ADMIN", "STAFF"] as const;
export const CUSTOMER_STATUSES = [
  "NEW",
  "CONTACTED",
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
] as const;
export const INTERACTION_TYPES = ["PHONE", "SMS", "EMAIL", "VISIT"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | {
      ok: false;
      code: "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "UNKNOWN";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerListItem extends Customer {
  total_count: number;
}

export interface Interaction {
  id: string;
  customer_id: string;
  type: InteractionType;
  memo: string;
  created_at: string;
  created_by: string;
  profiles?: { email: string } | null;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  q: string;
  status?: CustomerStatus;
  page: number;
}

export interface PaginatedCustomers {
  items: Customer[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: CustomerFilters;
}
