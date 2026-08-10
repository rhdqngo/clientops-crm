import { describe, expect, it } from "vitest";
import { buildCsvFileName, buildCustomerCsv, escapeCsvCell } from "@/lib/csv";
import type { Customer } from "@/lib/domain/types";

const customer: Customer = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "김,민\"서",
  phone: "010-4821-7793",
  email: "minseo@example.com",
  address: "서울시\n중구",
  status: "BOOKED",
  created_at: "2026-08-10T00:00:00.000Z",
  updated_at: "2026-08-10T05:35:00.000Z",
};

describe("CSV", () => {
  it("RFC 4180 방식으로 모든 셀을 인용한다", () => {
    expect(escapeCsvCell('가,나"다')).toBe('"가,나""다"');
  });

  it("BOM, 한글 헤더, CRLF와 8개 필드를 포함한다", () => {
    const csv = buildCustomerCsv([customer], "ko");
    expect(csv.startsWith("\uFEFF\"ID\",\"고객명\",\"전화번호\",\"이메일\",\"주소\",\"상태\",\"등록일시\",\"수정일시\"\r\n")).toBe(true);
    expect(csv).toContain('"김,민""서"');
    expect(csv).toContain('"서울시\n중구"');
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv.split("\r\n").filter(Boolean)).toHaveLength(2);
  });

  it("영어 헤더, 상태와 서울 날짜를 현지화한다", () => {
    const csv = buildCustomerCsv([customer], "en");
    expect(csv.startsWith('\uFEFF"ID","Customer name","Phone number","Email","Address","Status","Created at","Updated at"\r\n')).toBe(true);
    expect(csv).toContain('"Booked"');
    expect(csv).toContain('"Aug 10, 2026');
  });

  it("서울 날짜가 포함된 파일명을 만든다", () => {
    expect(buildCsvFileName(new Date("2026-08-09T15:30:00.000Z"))).toBe("customers-20260810-0030.csv");
  });
});
