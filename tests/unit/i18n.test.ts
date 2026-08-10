import { describe, expect, it } from "vitest";
import { detectLocale, localePath, parseAcceptLanguage, replaceUrlLocale } from "@/lib/i18n/config";
import { en, ko } from "@/lib/i18n/dictionaries";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe("locale 선택과 사전", () => {
  it("q 가중치와 지역 코드를 해석한다", () => {
    expect(parseAcceptLanguage("en-US,en;q=0.9,ko;q=0.8")).toBe("en");
    expect(parseAcceptLanguage("en;q=0.5,ko-KR;q=0.9")).toBe("ko");
    expect(parseAcceptLanguage("fr-FR")).toBeNull();
  });

  it("쿠키를 우선하고 지원 언어가 없으면 영어를 사용한다", () => {
    expect(detectLocale("ko", "en-US")).toBe("ko");
    expect(detectLocale(undefined, "ko-KR")).toBe("ko");
    expect(detectLocale(undefined, "fr-FR")).toBe("en");
  });

  it("양쪽 사전의 키 구조가 일치한다", () => {
    expect(keys(en)).toEqual(keys(ko));
  });

  it("경로와 중첩 next URL의 locale을 교체한다", () => {
    expect(localePath("en", "/customers")).toBe("/en/customers");
    expect(replaceUrlLocale("/ko/customers?q=민서", "en")).toBe("/en/customers?q=%EB%AF%BC%EC%84%9C");
  });
});
