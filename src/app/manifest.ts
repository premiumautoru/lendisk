import type { MetadataRoute } from "next";

/** Makes the site installable as an app (Android / desktop Chrome, iOS "На экран «Домой»"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Lendisk — автомобильные диски",
    short_name: "Lendisk",
    description: "Автомобильные диски в наличии в Москве и Московской области. Каталог, подбор по автомобилю, доставка.",
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    categories: ["shopping", "auto"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Каталог дисков", url: "/catalog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Подбор по автомобилю", url: "/#podbor", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
