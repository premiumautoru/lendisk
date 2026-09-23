import type { SiteSettings } from "@/lib/settings-defaults";
import { mapHref, phoneHref, routeHref, whatsappHref } from "@/lib/format";

/** Plain serialisable contact info passed from server to client components. */
export type Contacts = {
  phone: string;
  phoneHref: string;
  whatsapp: string;
  telegram: string;
  max: string;
  address: string;
  city: string;
  workHours: string;
  route: string;
  map: string;
  lat: string;
  lon: string;
  logoUrl: string;
};

export function contactsFrom(s: SiteSettings): Contacts {
  return {
    phone: s.phone,
    phoneHref: phoneHref(s.phone),
    whatsapp: whatsappHref(s.whatsapp, "Здравствуйте! Пишу с сайта Lendisk."),
    telegram: s.telegram,
    max: s.max,
    address: s.address,
    city: s.city,
    workHours: s.workHours,
    route: routeHref(s.lat, s.lon),
    map: mapHref(s.lat, s.lon),
    lat: s.lat,
    lon: s.lon,
    logoUrl: s.logoUrl,
  };
}
