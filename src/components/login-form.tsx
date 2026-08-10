"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { ActionResult } from "@/lib/domain/types";

const initialState: ActionResult = { ok: true };

const DEMO_ACCOUNTS = {
  STAFF: {
    email: "staff.demo@clientops.local",
    password: "ClientOpsDemo!2026",
  },
  ADMIN: {
    email: "admin.demo@clientops.local",
    password: "ClientOpsAdmin!2026",
  },
} as const;

type DemoRole = keyof typeof DEMO_ACCOUNTS;

export function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null);
  const errors = state.ok ? undefined : state.fieldErrors;

  function selectDemoAccount(role: DemoRole) {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
  }

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      {demoMode && (
        <fieldset className="grid gap-2.5">
          <legend className="text-sm font-bold text-[#24312d]">데모 계정</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["STAFF", "ADMIN"] as const).map((role) => (
              <button
                className={`button px-3 ${
                  selectedRole === role
                    ? "border-[#0d6b58] bg-[#e9f4f0] text-[#0d6b58]"
                    : ""
                }`}
                key={role}
                type="button"
                aria-pressed={selectedRole === role}
                onClick={() => selectDemoAccount(role)}
              >
                {role} 채우기
              </button>
            ))}
          </div>
          <p className="text-xs leading-5 text-[#685449]">
            ADMIN은 고객과 연결 상담을 영구 삭제할 수 있습니다. 데모 데이터는 매일 오전 3시(KST)에 초기화됩니다.
          </p>
        </fieldset>
      )}
      {!state.ok && (
        <div className="message message-error" role="alert">
          {state.message}
        </div>
      )}
      <div className="field">
        <label htmlFor="email">이메일</label>
        <input
          className="control"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setSelectedRole(null);
            setEmail(event.target.value);
          }}
          maxLength={254}
          aria-invalid={Boolean(errors?.email)}
          aria-describedby={errors?.email ? "email-error" : undefined}
          required
        />
        {errors?.email?.[0] && (
          <span className="field-error" id="email-error">
            {errors.email[0]}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input
          className="control"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setSelectedRole(null);
            setPassword(event.target.value);
          }}
          aria-invalid={Boolean(errors?.password)}
          aria-describedby={errors?.password ? "password-error" : undefined}
          required
        />
        {errors?.password?.[0] && (
          <span className="field-error" id="password-error">
            {errors.password[0]}
          </span>
        )}
      </div>
      <button className="button button-primary w-full" type="submit" disabled={pending}>
        {pending ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
