import { describe, expect, it } from "vitest";
import { assertDemoResetTarget, getProjectRef } from "../../scripts/lib/demo-target.mjs";

describe("demo reset target guard", () => {
  it("extracts the hosted Supabase project ref", () => {
    expect(getProjectRef("https://clientops-ref.supabase.co")).toBe("clientops-ref");
  });

  it("accepts only the explicitly expected project", () => {
    expect(() =>
      assertDemoResetTarget("https://clientops-ref.supabase.co", "clientops-ref"),
    ).not.toThrow();
    expect(() =>
      assertDemoResetTarget("https://production-ref.supabase.co", "clientops-ref"),
    ).toThrow(/Refusing demo reset/);
  });
});
