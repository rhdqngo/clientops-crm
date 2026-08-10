import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/auth/dal";
import { mapAuthorizationError } from "@/lib/actions/result";

describe("권한 오류 결과 매핑", () => {
  it("401을 현재 언어의 UNAUTHORIZED 결과로 매핑한다", () => {
    expect(mapAuthorizationError(new AuthorizationError(401, "LOGIN_REQUIRED"), "ko")).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
      message: "로그인이 필요합니다.",
    });
    expect(mapAuthorizationError(new AuthorizationError(401, "LOGIN_REQUIRED"), "en")?.message).toBe("You need to sign in.");
  });

  it("403을 현재 언어의 FORBIDDEN 결과로 매핑한다", () => {
    expect(mapAuthorizationError(new AuthorizationError(403, "FORBIDDEN"), "ko")).toEqual({
      ok: false,
      code: "FORBIDDEN",
      message: "이 작업을 수행할 권한이 없습니다.",
    });
    expect(mapAuthorizationError(new AuthorizationError(403, "FORBIDDEN"), "en")?.message).toBe("You do not have permission to perform this action.");
  });

  it("권한 오류가 아니면 null을 반환한다", () => {
    expect(mapAuthorizationError(new Error("other"), "en")).toBeNull();
  });
});
