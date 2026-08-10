"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { ActionResult } from "@/lib/domain/types";

const initialState: ActionResult = { ok: true };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
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
