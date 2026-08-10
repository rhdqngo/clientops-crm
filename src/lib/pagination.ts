export const CUSTOMER_PAGE_SIZE = 20;

export function getTotalPages(total: number, pageSize = CUSTOMER_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages));
}
