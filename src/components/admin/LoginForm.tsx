"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login, type AuthState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-white/10 bg-graphite p-6 sm:p-8">
      <label className="block">
        <span className="mb-2 block text-sm text-bone/60">Логин</span>
        <input name="login" className="field" autoComplete="username" required autoFocus />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-bone/60">Пароль</span>
        <input name="password" type="password" className="field" autoComplete="current-password" required />
      </label>
      {state.error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">{state.error}</p>}
      <button className="btn btn-gold w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Войти
      </button>
    </form>
  );
}
