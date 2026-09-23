import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-16" />
        <p className="mt-10 font-display text-[clamp(4rem,14vw,9rem)] font-bold leading-none text-chrome">404</p>
        <p className="mt-4 text-bone/60">Такой страницы нет — но диски для вашего авто точно найдутся.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/catalog" className="btn btn-gold">В каталог</Link>
          <Link href="/" className="btn btn-ghost">На главную</Link>
        </div>
      </div>
    </div>
  );
}
