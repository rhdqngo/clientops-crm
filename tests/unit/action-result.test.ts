import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/auth/dal";
import { mapAuthorizationError } from "@/lib/actions/result";

describe("권한 오류 결과 매핑", () => {
  it("401을 UNAUTHORIZED로 매핑한다", () => {
    expect(mapAuthorizationError(new AuthorizationError(401, "로그인이 필요합니다."))).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
    });
  });

  it("403을 FORBIDDEN으로 매핑한다", () => {
    expect(mapAuthorizationError(new AuthorizationError(403, "권한이 없습니다."))).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "권한이 없습니다.",
    });
  });

  it("권한 오류가 아니면 null을 반환한다", () => {
    expect(mapAuthorizationError(new Error("other"))).toBeNull();
  });
});
