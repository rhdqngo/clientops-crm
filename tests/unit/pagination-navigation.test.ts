import { describe, expect, it } from "vitest";
import { clampPage, getTotalPages } from "@/lib/pagination";
import { safeAppNext, safeCustomerReturnTo } from "@/lib/navigation";

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

describe("locale별 안전한 복귀 경로", () => {
  it("고객 목록 검색 문맥을 대상 locale로 보존한다", () => {
    expect(safeCustomerReturnTo("/ko/customers?q=민서&status=BOOKED&page=2", "en")).toBe(
      "/en/customers?q=%EB%AF%BC%EC%84%9C&status=BOOKED&page=2",
    );
    expect(safeCustomerReturnTo("https://evil.example/customers", "en")).toBe("/en/customers");
    expect(safeCustomerReturnTo("//evil.example/customers", "ko")).toBe("/ko/customers");
    expect(safeCustomerReturnTo("/en/customers/new", "en")).toBe("/en/customers");
  });

  it("로그인 후 이동은 허용된 앱 경로와 현재 locale만 사용한다", () => {
    expect(safeAppNext("/ko/customers?q=민서", "en")).toBe("/en/customers?q=%EB%AF%BC%EC%84%9C");
    expect(safeAppNext("https://evil.example/customers", "ko")).toBe("/ko/dashboard");
  });
});
