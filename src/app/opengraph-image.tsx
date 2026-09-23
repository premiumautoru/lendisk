import { ImageResponse } from "next/og";

export const alt = "Lendisk — автомобильные диски в Москве";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function font(weight: number) {
  // Unbounded with Cyrillic for the OG card; falls back to the default font if offline
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Unbounded:wght@${weight}&text=${encodeURIComponent("LENDISKАвтомобильные дискив Москве и МО·Подбор по автомобилю, доставка в день заказа")}`)).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const [bold, regular] = await Promise.all([font(700), font(400)]);
  const fonts = [
    ...(bold ? [{ name: "Unbounded", data: bold, weight: 700 as const }] : []),
    ...(regular ? [{ name: "Unbounded", data: regular, weight: 400 as const }] : []),
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "radial-gradient(circle at 78% 50%, #2a241b 0%, #0e0e10 45%, #0a0a0b 80%)", color: "#f3f0ea", fontFamily: "Unbounded", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 760 }}>
          <svg width="96" height="96" viewBox="0 0 100 100" fill="none" stroke="#b08a4a" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1.1" y="1.1" width="97.8" height="97.8" rx="24" strokeWidth="2.2" />
            <path d="M40.3 37.4V62.5H59.7" strokeWidth="3.7" />
            <path d="M60 37.2V45.6" strokeWidth="3.4" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: 5, lineHeight: 1 }}>LENDISK</div>
            <div style={{ fontSize: 30, marginTop: 26, color: "#e3c894" }}>Автомобильные диски в Москве и МО</div>
            <div style={{ fontSize: 22, marginTop: 16, color: "rgba(243,240,234,0.6)" }}>Подбор по автомобилю, доставка в день заказа</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: -170, top: 55, width: 520, height: 520, borderRadius: 520, background: "#050506", border: "46px solid #151517", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 10px #b08a4a inset" }}>
          <div style={{ width: 150, height: 150, borderRadius: 150, border: "10px solid #b08a4a", display: "flex" }} />
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
