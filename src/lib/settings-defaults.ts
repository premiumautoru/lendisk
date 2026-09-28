/**
 * Default editable site content. Every key is stored in the `Setting` table and can be
 * changed from Admin → Настройки; these values are used for seeding and as fallbacks.
 */
export const SETTINGS_DEFAULTS = {
  phone: "+7 926 111-11-70",
  whatsapp: "79261111170",
  telegram: "https://t.me/+79261111170",
  max: "https://max.ru/",
  email: "",
  address: "улица Лейтенанта Бойко, 91А",
  city: "Лобня, Московская область",
  workHours: "Ежедневно 10:00–20:00",
  lat: "56.019208392112645",
  lon: "37.442957835123856",
  logoUrl: "/brand/lendisk-logo.svg",

  heroEyebrow: "Автомобильные диски · Москва и МО",
  heroTitle: "Диски, которые меняют внешний вид автомобиля",
  heroSubtitle:
    "Lendisk — автомобильные диски в наличии в Москве. Подбор по автомобилю и доставка по Москве и Московской области.",

  podborTitle: "Не знаете, какие диски подойдут? Lendisk подберёт.",
  podborText:
    "Оставьте марку, модель и VIN — специалист проверит разболтовку, вылет и центральное отверстие и предложит варианты из наличия.",

  deliveryTitle: "Доставка по Москве и Московской области",
  deliveryText:
    "Lendisk осуществляет доставку по Москве и Московской области. Возможна доставка в день заказа или на следующий день — в зависимости от наличия товара, адреса и времени оформления заказа.",

  ctaTitle: "Не нашли нужные диски?",
  ctaText: "Оставьте заявку — команда Lendisk подберёт подходящий вариант под ваш автомобиль.",

  // requisites — copied as-is from the entrepreneur's registration details
  legalName: "Индивидуальный предприниматель Алиев Ленур Сейрамович",
  legalShort: "ИП Алиев Л.С.",
  inn: "910802813530",
  ogrnip: "325911200028907",
  regDate: "19.03.2025",
  legalAddress: "Республика Крым, г. Симферополь, ул. Киевская, д.153, кв. 182",
  legalEmail: "sportsk.ooo@mail.ru",
  bankName: "АО «ТБанк»",
  bankAccount: "40802810600008066261",
  bankBik: "044525974",
  bankCorr: "30101810145250000974",

  // search engines: only the content="…" value of the verification meta tag
  yandexVerification: "",
  googleVerification: "",
  mailruVerification: "",

  seoTitle: "Lendisk — автомобильные диски в Москве",
  seoDescription:
    "Lendisk — продажа автомобильных дисков в Москве и Московской области. Диски в наличии, подбор по автомобилю и быстрая доставка.",
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

export const SETTINGS_GROUPS: {
  title: string;
  description?: string;
  note?: string;
  fields: { key: SettingKey; label: string; long?: boolean; hint?: string; placeholder?: string }[];
}[] = [
  {
    title: "Контакты",
    fields: [
      { key: "phone", label: "Телефон", hint: "Показывается на сайте и используется для кнопки «Позвонить»" },
      { key: "whatsapp", label: "WhatsApp (номер цифрами)", hint: "Например 79261111170" },
      { key: "telegram", label: "Telegram (ссылка)" },
      { key: "max", label: "MAX (ссылка)" },
      { key: "email", label: "E-mail" },
      { key: "workHours", label: "Часы работы" },
    ],
  },
  {
    title: "Адрес и карта",
    fields: [
      { key: "address", label: "Адрес" },
      { key: "city", label: "Город / регион" },
      { key: "lat", label: "Широта (latitude)" },
      { key: "lon", label: "Долгота (longitude)" },
    ],
  },
  {
    title: "Главный экран",
    fields: [
      { key: "heroEyebrow", label: "Надзаголовок" },
      { key: "heroTitle", label: "Заголовок", long: true },
      { key: "heroSubtitle", label: "Подзаголовок", long: true },
    ],
  },
  {
    title: "Блоки на главной",
    fields: [
      { key: "podborTitle", label: "Подбор — заголовок" },
      { key: "podborText", label: "Подбор — текст", long: true },
      { key: "deliveryTitle", label: "Доставка — заголовок" },
      { key: "deliveryText", label: "Доставка — текст", long: true },
      { key: "ctaTitle", label: "CTA — заголовок" },
      { key: "ctaText", label: "CTA — текст", long: true },
    ],
  },
  {
    title: "Реквизиты",
    fields: [
      { key: "legalName", label: "Полное наименование" },
      { key: "legalShort", label: "Краткое наименование", hint: "Показывается в подвале сайта" },
      { key: "inn", label: "ИНН" },
      { key: "ogrnip", label: "ОГРНИП" },
      { key: "regDate", label: "Дата регистрации" },
      { key: "legalAddress", label: "Юридический адрес", long: true },
      { key: "legalEmail", label: "E-mail (реквизиты)" },
      { key: "bankName", label: "Банк" },
      { key: "bankAccount", label: "Расчётный счёт" },
      { key: "bankBik", label: "БИК" },
      { key: "bankCorr", label: "Корр. счёт" },
    ],
  },
  {
    title: "SEO",
    fields: [
      { key: "seoTitle", label: "Title сайта" },
      { key: "seoDescription", label: "Description сайта", long: true },
    ],
  },
  {
    title: "Поисковые системы",
    description: "Коды подтверждения прав из вебмастеров — вставьте только значение content (можно вставить и весь мета-тег, лишнее уберётся само).",
    note: "После сохранения код появится на всех страницах сайта — возвращайтесь в вебмастер и нажимайте «Проверить». О новых, изменённых и удалённых дисках Яндекс и Bing узнают автоматически.",
    fields: [
      { key: "yandexVerification", label: "Яндекс.Вебмастер", placeholder: "a1b2c3d4e5f6", hint: "Вебмастер → Настройки → Права доступа → Мета-тег" },
      { key: "googleVerification", label: "Google Search Console", placeholder: "AbCdEf…", hint: "Способ «HTML-тег»" },
      { key: "mailruVerification", label: "Mail.ru", placeholder: "необязательно", hint: "Кабинет вебмастера Mail.ru → мета-тег mailru-domain" },
    ],
  },
];
