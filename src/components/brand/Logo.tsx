import clsx from "clsx";

export const DEFAULT_LOGO = "/brand/lendisk-logo.svg";

/**
 * Official Lendisk mark (rounded square with "L'"), drawn inline so it stays crisp at any size.
 * If the owner uploads another logo in Admin → Настройки, that file is rendered instead.
 */
export function LogoMark({ className, logoUrl, title = "Lendisk" }: { className?: string; logoUrl?: string; title?: string }) {
  if (logoUrl && logoUrl !== DEFAULT_LOGO) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={title} className={clsx("object-contain", className)} />;
  }
  return (
    <svg viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={className}>
      <defs>
        <linearGradient id="lendisk-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9bb83" />
          <stop offset=".5" stopColor="#b08a4a" />
          <stop offset="1" stopColor="#8c6b3a" />
        </linearGradient>
      </defs>
      <g stroke="url(#lendisk-gold)">
        <rect x="1.1" y="1.1" width="97.8" height="97.8" rx="24" strokeWidth="2.2" />
        <path d="M40.3 37.4V62.5H59.7" strokeWidth="3.7" />
        <path d="M60 37.2V45.6" strokeWidth="3.4" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={clsx("font-display font-semibold tracking-[0.32em] uppercase max-[360px]:tracking-[0.18em]", className)}>Lendisk</span>;
}

export function BrandLockup({ className, logoUrl, size = "md" }: { className?: string; logoUrl?: string; size?: "sm" | "md" | "lg" }) {
  const mark = { sm: "size-8", md: "size-10", lg: "size-14" }[size];
  const text = { sm: "text-[0.8rem]", md: "text-[0.95rem]", lg: "text-xl" }[size];
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <LogoMark className={`${mark} shrink-0`} logoUrl={logoUrl} />
      <Wordmark className={text} />
    </span>
  );
}
