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
  legal: Legal;
};

export type Legal = {
  name: string;
  short: string;
  inn: string;
  ogrnip: string;
  regDate: string;
  address: string;
  email: string;
  bank: { name: string; account: string; bik: string; corr: string };
};

export function legalFrom(s: SiteSettings): Legal {
  return {
    name: s.legalName,
    short: s.legalShort,
    inn: s.inn,
    ogrnip: s.ogrnip,
    regDate: s.regDate,
    address: s.legalAddress,
    email: s.legalEmail,
    bank: { name: s.bankName, account: s.bankAccount, bik: s.bankBik, corr: s.bankCorr },
  };
}

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
    legal: legalFrom(s),
  };
}
