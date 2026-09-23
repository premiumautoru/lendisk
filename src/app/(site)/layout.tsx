import { Intro } from "@/components/brand/Intro";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileContactBar } from "@/components/site/MobileContactBar";
import { contactsFrom } from "@/components/site/contacts";
import { RevealObserver } from "@/components/ui/Reveal";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const contacts = contactsFrom(s);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "Lendisk",
    description: s.seoDescription,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/lendisk-logo.svg`,
    image: `${SITE_URL}/opengraph-image`,
    telephone: s.phone.replace(/[^\d+]/g, ""),
    priceRange: "₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressLocality: "Лобня",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    geo: { "@type": "GeoCoordinates", latitude: Number(s.lat), longitude: Number(s.lon) },
    areaServed: ["Москва", "Московская область"],
    openingHours: "Mo-Su 10:00-20:00",
  };
  return (
    <>
      <Intro />
      <Header contacts={contacts} />
      <main id="main">{children}</main>
      <Footer contacts={contacts} />
      <MobileContactBar contacts={contacts} />
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
