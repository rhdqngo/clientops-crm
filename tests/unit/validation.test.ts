import { describe, expect, it } from "vitest";
import {
  getCustomerFiltersSchema,
  getCustomerInputSchema,
  getInteractionInputSchema,
  getLoginSchema,
  normalizePhone,
  parseCustomerFilters,
} from "@/lib/validation";

describe("고객 입력 검증", () => {
  it("필수 이름과 최대 길이를 양쪽 언어로 검사한다", () => {
    const ko = getCustomerInputSchema("ko").safeParse({ name: "", status: "NEW" });
    const en = getCustomerInputSchema("en").safeParse({ name: "", status: "NEW" });
    expect(ko.success).toBe(false);
    expect(en.success).toBe(false);
    if (!ko.success && !en.success) {
      expect(ko.error.issues[0].message).toBe("고객명은 필수입니다.");
      expect(en.error.issues[0].message).toBe("Customer name is required.");
    }
    expect(getCustomerInputSchema("ko").safeParse({ name: "가".repeat(101), status: "NEW" }).success).toBe(false);
  });

  it("선택 입력의 빈 문자열을 undefined로 정리한다", () => {
    const result = getCustomerInputSchema("ko").parse({ name: "김민서", phone: "", email: " ", address: "", status: "BOOKED" });
    expect(result).toMatchObject({ name: "김민서", status: "BOOKED" });
    expect(result.phone).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it("상담 메모를 1–2000자로 제한한다", () => {
    const schema = getInteractionInputSchema("en");
    expect(schema.safeParse({ type: "PHONE", memo: "" }).success).toBe(false);
    expect(schema.safeParse({ type: "PHONE", memo: "a".repeat(2000) }).success).toBe(true);
    expect(schema.safeParse({ type: "PHONE", memo: "a".repeat(2001) }).success).toBe(false);
  });

  it("로그인 오류를 locale에 맞게 반환한다", () => {
    const ko = getLoginSchema("ko").safeParse({ email: "bad", password: "" });
    const en = getLoginSchema("en").safeParse({ email: "bad", password: "" });
    expect(ko.success).toBe(false);
    expect(en.success).toBe(false);
    if (!ko.success && !en.success) {
      expect(ko.error.issues.some((issue) => issue.message.includes("올바른"))).toBe(true);
      expect(en.error.issues.some((issue) => issue.message.includes("valid email"))).toBe(true);
    }
  });
});

describe("검색 검증과 전화 정규화", () => {
  it("전화 형식 차이를 같은 검색값으로 만든다", () => {
    expect(normalizePhone("010-4821 7793")).toBe("01048217793");
    expect(normalizePhone("+82 (0)10-4821-7793")).toBe("+8201048217793");
  });

  it("정상 URL 검색 조건을 파싱한다", () => {
    expect(parseCustomerFilters({ q: " 민서 ", status: "BOOKED", page: "2" }, "en")).toEqual({ q: "민서", status: "BOOKED", page: 2 });
  });

  it("잘못된 상태와 페이지를 서버에서 거부한다", () => {
    expect(() => parseCustomerFilters({ q: "", status: "INVALID", page: "1" }, "ko")).toThrow();
    expect(() => parseCustomerFilters({ q: "", page: "0" }, "en")).toThrow();
    expect(getCustomerFiltersSchema("ko").safeParse({ q: "가".repeat(101), page: 1 }).success).toBe(false);
  });
});
