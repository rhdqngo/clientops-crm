"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { ActionResult } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";
import { formatMessage } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/provider";

const initialState: ActionResult = { ok: true };

const DEMO_ACCOUNTS = {
  STAFF: { email: "staff.demo@clientops.local", password: "ClientOpsDemo!2026" },
  ADMIN: { email: "admin.demo@clientops.local", password: "ClientOpsAdmin!2026" },
} as const;

type DemoRole = keyof typeof DEMO_ACCOUNTS;

export function LoginForm({
  locale,
  nextPath,
  demoMode = false,
}: {
  locale: Locale;
  nextPath?: string;
  demoMode?: boolean;
}) {
  const { dictionary } = useI18n();
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, locale, nextPath),
    initialState,
  );
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
          <legend className="text-sm font-bold text-[#24312d]">{dictionary.demo.accounts}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["STAFF", "ADMIN"] as const).map((role) => (
              <button
                className={`button px-3 ${selectedRole === role ? "border-[#0d6b58] bg-[#e9f4f0] text-[#0d6b58]" : ""}`}
                key={role}
                type="button"
                aria-pressed={selectedRole === role}
                onClick={() => selectDemoAccount(role)}
              >
                {formatMessage(dictionary.demo.fillAccount, { role })}
              </button>
            ))}
          </div>
          <p className="text-xs leading-5 text-[#685449]">{dictionary.demo.adminConsequence}</p>
        </fieldset>
      )}
      {!state.ok && <div className="message message-error" role="alert">{state.message}</div>}
      <div className="field">
        <label htmlFor="email">{dictionary.login.email}</label>
        <input
          className="control"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => { setSelectedRole(null); setEmail(event.target.value); }}
          maxLength={254}
          aria-invalid={Boolean(errors?.email)}
          aria-describedby={errors?.email ? "email-error" : undefined}
          required
        />
        {errors?.email?.[0] && <span className="field-error" id="email-error">{errors.email[0]}</span>}
      </div>
      <div className="field">
        <label htmlFor="password">{dictionary.login.password}</label>
        <input
          className="control"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => { setSelectedRole(null); setPassword(event.target.value); }}
          aria-invalid={Boolean(errors?.password)}
          aria-describedby={errors?.password ? "password-error" : undefined}
          required
        />
        {errors?.password?.[0] && <span className="field-error" id="password-error">{errors.password[0]}</span>}
      </div>
      <button className="button button-primary w-full" type="submit" disabled={pending}>
        {pending ? dictionary.login.submitting : dictionary.login.submit}
      </button>
    </form>
  );
}
