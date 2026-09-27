/**
 * Gallery photos. All images are from Unsplash and are used under the Unsplash License
 * (free for commercial use, no permission needed; selling unaltered copies is not allowed):
 * https://unsplash.com/license
 *
 * The photos are illustrative. They are NOT Lendisk's own work, and captions deliberately
 * do not name a wheel model, because it cannot be reliably identified from the photo.
 * Files in /public/gallery were resized and colour-graded to one style (WebP, 1920 px and 900 px).
 * Downloaded 27.09.2026.
 */
export type GalleryPhoto = {
  file: string; // /gallery/NN → NN.webp (1920 px) and NN-sm.webp (900 px)
  width: number;
  height: number;
  title: string;
  alt: string;
  author: string;
  authorUrl: string;
  source: string;
};

export const GALLERY_LICENSE = { name: "Unsplash License", url: "https://unsplash.com/license" };

export const GALLERY: GalleryPhoto[] = [
  {
    file: "/gallery/01",
    width: 1920,
    height: 1278,
    title: "Золото на чёрном",
    alt: "Золотистый многоспицевый диск на чёрном автомобиле в тёмном зале",
    author: "lucas clarysse",
    authorUrl: "https://unsplash.com/@lucky_photography",
    source: "https://unsplash.com/photos/close-up-of-a-shiny-gold-car-wheel-on-black-car--mpuoxhLPQk",
  },
  {
    file: "/gallery/02",
    width: 1920,
    height: 1280,
    title: "Сетка спиц",
    alt: "Золотистый диск с сетчатым рисунком спиц и полированной закраиной на тёмном фоне",
    author: "Giorgio Trovato",
    authorUrl: "https://unsplash.com/@giorgiotrovato",
    source: "https://unsplash.com/photos/black-and-silver-car-wheel-kwDN4hfz4OY",
  },
  {
    file: "/gallery/03",
    width: 1920,
    height: 1280,
    title: "Глубина",
    alt: "Золотистый сетчатый диск крупным планом, свет на спицах",
    author: "Giorgio Trovato",
    authorUrl: "https://unsplash.com/@giorgiotrovato",
    source: "https://unsplash.com/photos/black-and-yellow-multi-spoke-wheel-dS1MCKgUSug",
  },
  {
    file: "/gallery/04",
    width: 1920,
    height: 1280,
    title: "Контраст",
    alt: "Золотистый диск на автомобиле с тёмно-синим кузовом",
    author: "sumith ks",
    authorUrl: "https://unsplash.com/@artofsumith",
    source: "https://unsplash.com/photos/gold-alloy-wheel-on-a-dark-blue-car-T4MWxCRObig",
  },
  {
    file: "/gallery/11",
    width: 1920,
    height: 1080,
    title: "Линии света",
    alt: "Спортивный автомобиль, очерченный полосами света на чёрном фоне",
    author: "Matthew McKinney",
    authorUrl: "https://unsplash.com/@matthewmckinney",
    source: "https://unsplash.com/photos/sleek-sports-car-illuminated-against-a-dark-background-zgAWKHN7PHs",
  },
  {
    file: "/gallery/06",
    width: 1920,
    height: 1275,
    title: "В цвет кузова",
    alt: "Тёмный диск на чёрном автомобиле, полоса солнечного света на асфальте",
    author: "Vlad Kutepov",
    authorUrl: "https://unsplash.com/@kvtepov",
    source: "https://unsplash.com/photos/black-multi-spoke-vehicle-wheel-6xwX1JsNnME",
  },
  {
    file: "/gallery/07",
    width: 1920,
    height: 1278,
    title: "Тёплый свет",
    alt: "Диск чёрного спортивного автомобиля в тёплом свете гаража",
    author: "lucas clarysse",
    authorUrl: "https://unsplash.com/@lucky_photography",
    source: "https://unsplash.com/photos/a-black-sports-car-parked-in-a-garage-NSrkACgFnJM",
  },
  {
    file: "/gallery/08",
    width: 1920,
    height: 1280,
    title: "Вечерний город",
    alt: "Серебристое купе вечером на городской улице",
    author: "Yevhenii Dubrovskyi",
    authorUrl: "https://unsplash.com/@dbr0vskyi",
    source: "https://unsplash.com/photos/a-silver-sports-car-parked-in-a-dark-room-HhLle5uslkQ",
  },
  {
    file: "/gallery/09",
    width: 1920,
    height: 1097,
    title: "Силуэт",
    alt: "Силуэт чёрного спортивного автомобиля в тёмной студии",
    author: "Tuna Ekici",
    authorUrl: "https://unsplash.com/@tunaekici",
    source: "https://unsplash.com/photos/a-black-sports-car-in-a-dark-room-0xySZZ8OK1o",
  },
  {
    file: "/gallery/10",
    width: 1920,
    height: 1280,
    title: "Акцент",
    alt: "Передняя часть тёмного автомобиля с жёлтой полосой в темноте",
    author: "lonely blue",
    authorUrl: "https://unsplash.com/@lonelyblue",
    source: "https://unsplash.com/photos/yellow-and-black-car-in-a-dark-room-HBZ0OShWMPQ",
  },
  {
    file: "/gallery/05",
    width: 1920,
    height: 1280,
    title: "Классика",
    alt: "Серебристый многоспицевый диск на чёрном автомобиле",
    author: "MiguelPhoto",
    authorUrl: "https://unsplash.com/@miguelphoto",
    source: "https://unsplash.com/photos/close-up-of-a-shiny-black-luxury-car-wheel-DtdNyY7F7-0",
  },
  {
    file: "/gallery/12",
    width: 1920,
    height: 1280,
    title: "В движении",
    alt: "Чёрное купе с тёмными дисками едет по загородной дороге",
    author: "Rodan Can",
    authorUrl: "https://unsplash.com/@rodancan",
    source: "https://unsplash.com/photos/black-coupe-on-road-6cqJPeTIuls",
  },
];
