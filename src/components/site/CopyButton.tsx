"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies a block of text (e.g. all requisites) to the clipboard. */
export function CopyButton({ text, label = "Скопировать" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {}
  };
  return (
    <button type="button" onClick={copy} className="btn btn-ghost">
      {done ? <Check className="size-4 text-gold" /> : <Copy className="size-4" />} {done ? "Скопировано" : label}
    </button>
  );
}
