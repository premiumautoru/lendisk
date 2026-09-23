"use client";

import { useState } from "react";

function format(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d && !d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = d ? "+7" : "";
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ")";
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

export function PhoneInput({ className, invalid, initial, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; initial?: string }) {
  const [value, setValue] = useState(() => (initial ? format(initial) : ""));
  return (
    <input
      {...rest}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => setValue(format(e.target.value))}
      className={className}
    />
  );
}
