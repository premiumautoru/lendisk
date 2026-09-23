"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Interactive Yandex map with the store pin. The official map widget is loaded only when the
 * block approaches the viewport, so it never slows down the first screen.
 */
export function YandexMap({ lat, lon, address }: { lat: string; lon: string; address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const src = `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=16&pt=${lon}%2C${lat}%2Cpm2rdl&l=map&lang=ru_RU`;

  return (
    <div ref={ref} className="absolute inset-0 bg-[#141416]">
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center text-center text-sm text-bone/40">
          <div>
            <MapPin className="mx-auto mb-3 size-8 text-gold" strokeWidth={1.4} />
            {address}
          </div>
        </div>
      )}
      {visible && (
        <iframe
          title={`Lendisk на карте: ${address}`}
          src={src}
          className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.35)_contrast(1.05)]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
