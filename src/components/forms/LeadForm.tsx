"use client";

import clsx from "clsx";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions/leads";
import { PhoneInput } from "./PhoneInput";

const DIAMETERS = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

type Props = {
  variant?: "podbor" | "product" | "callback";
  productId?: string;
  productName?: string;
  compact?: boolean;
  onDone?: () => void;
};

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-bone/55">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

export function LeadForm({ variant = "podbor", productId, productName, compact }: Props) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const e = state.errors || {};
  const v = state.values || {};

  if (state.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <span className="relative mb-6 grid size-20 place-items-center rounded-full bg-gold/10 text-gold">
          <span className="absolute inset-0 animate-ping rounded-full border border-gold/40 [animation-iteration-count:2]" />
          <Check className="size-9" strokeWidth={2.2} />
        </span>
        <p className="font-display text-xl font-medium sm:text-2xl">Заявка принята</p>
        <p className="mt-3 max-w-sm text-bone/65">Специалист Lendisk свяжется с вами для подбора дисков.</p>
      </div>
    );
  }

  const isPodbor = variant === "podbor";

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="type" value={variant} />
      {productId && <input type="hidden" name="productId" value={productId} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {productName && (
        <p className="rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-sm text-bone/80">
          Товар: <span className="font-semibold text-bone">{productName}</span>
        </p>
      )}

      <div className={clsx("grid gap-4", !compact && "sm:grid-cols-2")}>
        {(isPodbor || variant === "product") && (
          <>
            <Field label="Марка автомобиля" error={e.carMake}>
              <input name="carMake" defaultValue={v.carMake} className="field" placeholder="Например, BMW" autoComplete="off" aria-invalid={!!e.carMake || undefined} />
            </Field>
            <Field label="Модель автомобиля" error={e.carModel}>
              <input name="carModel" defaultValue={v.carModel} className="field" placeholder="Например, X5 G05" autoComplete="off" />
            </Field>
          </>
        )}
        {isPodbor && (
          <>
            <Field label="VIN-номер" error={e.vin}>
              <input name="vin" defaultValue={v.vin} className="field uppercase placeholder:normal-case" placeholder="17 символов" maxLength={17} autoComplete="off" aria-invalid={!!e.vin || undefined} />
            </Field>
            <Field label="Желаемый диаметр" error={e.diameter}>
              <select name="diameter" key={v.diameter} className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23c29a5a%22 fill=%22none%22 stroke-width=%221.6%22/></svg>')] bg-[length:12px] bg-[right_1.1rem_center] bg-no-repeat" defaultValue={v.diameter || ""}>
                <option value="">Не знаю / подберите</option>
                {DIAMETERS.map((d) => (
                  <option key={d} value={`R${d}`}>
                    R{d}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <Field label="Имя" error={e.name}>
          <input name="name" defaultValue={v.name} className="field" placeholder="Как к вам обращаться" autoComplete="name" required aria-invalid={!!e.name || undefined} />
        </Field>
        <Field label="Телефон" error={e.phone}>
          <PhoneInput name="phone" initial={v.phone} className="field" required invalid={!!e.phone} />
        </Field>
      </div>

      <Field label="Комментарий (необязательно)">
        <textarea name="comment" defaultValue={v.comment} rows={compact ? 2 : 3} className="field !h-auto resize-none py-3" placeholder="Цвет, бюджет, количество, пожелания" />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/60">
        <input type="checkbox" name="consent" defaultChecked={v.consent === "on"} className="peer sr-only" />
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-white/20 transition peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold/50 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <Check className="size-3.5 text-ink" strokeWidth={3} />
        </span>
        <span>
          Я согласен(а) на{" "}
          <Link href="/privacy" target="_blank" className="text-bone underline decoration-gold/50 underline-offset-4 hover:decoration-gold">
            обработку персональных данных
          </Link>
        </span>
      </label>
      {e.consent && <p className="-mt-2 text-xs text-red-400">{e.consent}</p>}

      {state.message && !state.ok && <p className="text-sm text-red-400" role="alert">{state.message}</p>}

      <button type="submit" disabled={pending} className="btn btn-gold w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPodbor ? "Подобрать диски" : "Отправить заявку"}
        {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}
