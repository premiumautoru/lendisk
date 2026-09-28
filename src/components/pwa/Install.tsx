"use client";

import { useEffect, useState } from "react";
import { Check, Download, Share, SquarePlus } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type W = Window & { __lendiskInstall?: InstallEvent | null };

/** Registers the service worker and keeps Chrome's install prompt for the «Установить» button. */
export function PwaRegister() {
  useEffect(() => {
    const w = window as W;
    const keep = (e: Event) => {
      e.preventDefault();
      w.__lendiskInstall = e as InstallEvent;
      window.dispatchEvent(new Event("lendisk-installable"));
    };
    window.addEventListener("beforeinstallprompt", keep);
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", keep);
  }, []);
  return null;
}

type Mode = "loading" | "installed" | "prompt" | "ios" | "manual";

function detect(): Mode {
  const w = window as W;
  if (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) return "installed";
  if (w.__lendiskInstall) return "prompt";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "manual";
}

/** «Установить приложение»: a real install button in Chrome/Edge/Yandex Browser, step-by-step hints on iPhone and elsewhere. */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const update = () => setMode(detect());
    update();
    window.addEventListener("lendisk-installable", update);
    window.addEventListener("appinstalled", update);
    return () => {
      window.removeEventListener("lendisk-installable", update);
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  const install = async () => {
    const w = window as W;
    const e = w.__lendiskInstall;
    if (!e) return;
    await e.prompt();
    const { outcome } = await e.userChoice;
    w.__lendiskInstall = null;
    setMode(outcome === "accepted" ? "installed" : detect());
  };

  if (mode === "loading") return null;
  if (compact && mode !== "prompt") return null;

  if (mode === "installed")
    return (
      <p className="flex items-center gap-2 text-sm text-bone/70">
        <Check className="size-4 text-gold" /> Приложение Lendisk уже установлено на этом устройстве.
      </p>
    );

  if (mode === "prompt")
    return (
      <button type="button" onClick={install} className={compact ? "inline-flex items-center gap-2 text-sm text-bone/70 hover:text-gold" : "btn btn-gold"}>
        <Download className="size-4" /> Установить приложение
      </button>
    );

  if (mode === "ios")
    return (
      <ol className="space-y-3 text-bone/75">
        <li className="flex gap-3"><span className="text-gold">1.</span> Откройте этот сайт в Safari.</li>
        <li className="flex gap-3"><span className="text-gold">2.</span> <span>Нажмите «Поделиться» <Share className="inline size-4 align-[-2px]" /> внизу экрана.</span></li>
        <li className="flex gap-3"><span className="text-gold">3.</span> <span>Выберите «На экран “Домой”» <SquarePlus className="inline size-4 align-[-2px]" /> и нажмите «Добавить».</span></li>
      </ol>
    );

  return (
    <ol className="space-y-3 text-bone/75">
      <li className="flex gap-3"><span className="text-gold">1.</span> Откройте сайт lendisk.com в Chrome или Яндекс Браузере.</li>
      <li className="flex gap-3"><span className="text-gold">2.</span> Нажмите меню браузера (⋮ или ≡).</li>
      <li className="flex gap-3"><span className="text-gold">3.</span> Выберите «Установить приложение» или «Добавить на главный экран».</li>
    </ol>
  );
}
