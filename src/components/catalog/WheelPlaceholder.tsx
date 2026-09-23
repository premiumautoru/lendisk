/** Branded placeholder shown until the owner uploads a real photo in the admin panel. */
export function WheelPlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,#f7f6f3,#dcdad5)]">
      <svg viewBox="0 0 200 200" className="w-[62%] opacity-80" aria-hidden>
        <circle cx="100" cy="100" r="92" fill="#1a1a1c" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="#b08a4a" strokeWidth="5" />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d="M96 34 L104 34 L106 82 L94 82 Z" fill="#8d8a84" transform={`rotate(${i * 60} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="18" fill="#2a2a2e" stroke="#b08a4a" strokeWidth="2" />
      </svg>
      {label && <span className="absolute bottom-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink/40">Фото скоро · {label}</span>}
    </div>
  );
}
