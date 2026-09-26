/**
 * Brand intro shown once per browser session, on desktop only (phones open instantly for a fast first paint): the Lendisk mark draws itself on black,
 * the wordmark fades in, then the overlay dissolves into the hero.
 * Pure CSS + a tiny inline script so it works before hydration and never blocks content.
 */
const script = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('lendisk-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(min-width: 1024px)').matches)return;sessionStorage.setItem('lendisk-intro','1');d.classList.add('intro','intro-seq');setTimeout(function(){d.classList.add('intro-out')},1150);setTimeout(function(){d.classList.remove('intro','intro-out')},1750)}catch(e){}})()`;

export function IntroScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function Intro() {
  return (
    <div className="intro-overlay" aria-hidden>
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 100 100" className="size-24 sm:size-28" fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="#b08a4a">
          <rect className="intro-draw intro-d1" x="1.1" y="1.1" width="97.8" height="97.8" rx="24" strokeWidth="2.2" pathLength={1} />
          <path className="intro-draw intro-d2" d="M40.3 37.4V62.5H59.7" strokeWidth="3.7" pathLength={1} />
          <path className="intro-draw intro-d3" d="M60 37.2V45.6" strokeWidth="3.4" pathLength={1} />
        </svg>
        <span className="intro-word font-display text-sm font-semibold uppercase text-bone">Lendisk</span>
      </div>
    </div>
  );
}
