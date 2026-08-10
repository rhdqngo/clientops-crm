import { describe, expect, it } from "vitest";
import { clampPage, getTotalPages } from "@/lib/pagination";
import { safeCustomerReturnTo } from "@/lib/navigation";

describe("페이지 계산", () => {
  it("0건도 한 페이지로 표시하고 20건 단위로 계산한다", () => {
    expect(getTotalPages(0)).toBe(1);
    expect(getTotalPages(20)).toBe(1);
    expect(getTotalPages(21)).toBe(2);
  });

  it("페이지를 유효 범위로 제한한다", () => {
    expect(clampPage(-2, 4)).toBe(1);
    expect(clampPage(9, 4)).toBe(4);
  });
});

describe("목록 복귀 경로", () => {
  it("고객 목록 검색 문맥만 허용한다", () => {
    expect(safeCustomerReturnTo("/customers?q=민서&status=BOOKED&page=2")).toBe(
      "/customers?q=%EB%AF%BC%EC%84%9C&status=BOOKED&page=2",
    );
    expect(safeCustomerReturnTo("https://evil.example/customers")).toBe("/customers");
    expect(safeCustomerReturnTo("//evil.example/customers")).toBe("/customers");
    expect(safeCustomerReturnTo("/customers/new")).toBe("/customers");
  });
});
