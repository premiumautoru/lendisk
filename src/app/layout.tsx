import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { IntroScript } from "@/components/brand/Intro";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seoTitle, template: "%s — Lendisk" },
    description: s.seoDescription,
    applicationName: "Lendisk",
    keywords: [
      "Lendisk",
      "купить диски Москва",
      "автомобильные диски Москва",
      "литые диски Москва",
      "диски в наличии Москва",
      "купить диски Московская область",
      "подбор дисков по автомобилю",
      "кованые диски",
      "диски Лобня",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "Lendisk",
      title: s.seoTitle,
      description: s.seoDescription,
      url: "/",
    },
    twitter: { card: "summary_large_image", title: s.seoTitle, description: s.seoDescription },
    formatDetection: { telephone: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Enables reveal-on-scroll styles only when JS runs, so content never stays hidden */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <IntroScript />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
