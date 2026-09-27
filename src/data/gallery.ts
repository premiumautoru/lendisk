/**
 * Gallery photos. All images are from Unsplash and are used under the Unsplash License
 * (free for commercial use, no permission needed; selling unaltered copies is not allowed):
 * https://unsplash.com/license
 *
 * The photos are illustrative. They are NOT Lendisk's own work, and captions deliberately
 * do not name a wheel model, because it cannot be reliably identified from the photo.
 * Files in /public/gallery were cropped to 4:5, slightly desaturated to one neutral tone
 * and saved as WebP (1600 px and 800 px). Downloaded 27.09.2026.
 */
export type GalleryPhoto = {
  file: string; // /gallery/NN → NN.webp (1600 px) and NN-sm.webp (800 px)
  width: number;
  height: number;
  title: string;
  alt: string;
  author: string;
  authorUrl: string;
  source: string;
};

export const GALLERY_LICENSE = { name: "Unsplash License", url: "https://unsplash.com/license" };

const photo = (n: string, title: string, alt: string, author: string, authorUrl: string, source: string): GalleryPhoto => ({
  file: `/gallery/${n}`,
  width: 1600,
  height: 2000,
  title,
  alt,
  author,
  authorUrl,
  source,
});

export const GALLERY: GalleryPhoto[] = [
  photo("01", "Белый и графит", "Тёмный многоспицевый диск на белом автомобиле, съёмка с низкой точки", "Cooper White", "https://unsplash.com/@shot_by_cooper", "https://unsplash.com/photos/close-up-of-a-custom-car-wheel-and-tire-RkkIcwdUHDI"),
  photo("02", "Бронза", "Диск бронзового цвета с сетчатым рисунком спиц на тёмном автомобиле, светлый фон", "LOGAN WEAVER | @LGNWVR", "https://unsplash.com/@lgnwvr", "https://unsplash.com/photos/black-and-silver-car-wheel-_FtxYrfisjU"),
  photo("03", "Матовый серый", "Чёрный диск на автомобиле матово-серого цвета, монохромный кадр", "CARTIST SARVAM", "https://unsplash.com/@cartist_sarvam", "https://unsplash.com/photos/close-up-of-a-sleek-dark-gray-car-wheel-pPjJ3ZugCzY"),
  photo("04", "Монохром", "Тёмный многоспицевый диск на чёрном автомобиле крупным планом", "MiguelPhoto", "https://unsplash.com/@miguelphoto", "https://unsplash.com/photos/close-up-of-a-black-car-wheel-and-tire-ErrKR5f9jEw"),
  photo("05", "Светлый зал", "Чёрный диск на белом спортивном автомобиле в светлом зале", "Ositadinma Onyeobi", "https://unsplash.com/@visualsbyosi", "https://unsplash.com/photos/white-sports-car-wheel-and-mirror-Xwd3FN8OaC8"),
  photo("06", "Графит", "Чёрный диск на тёмно-сером автомобиле, асфальт с разметкой", "Gleb Paniotov", "https://unsplash.com/@paniotovvv", "https://unsplash.com/photos/a-dark-car-wheel-is-showcased-6oN8dPDMH3k"),
  photo("07", "Серебро", "Серебристый диск на автомобиле серого цвета", "serjan midili", "https://unsplash.com/@s_midili", "https://unsplash.com/photos/silver-and-black-car-wheel-OgIik_VHAmU"),
  photo("08", "Сетка спиц", "Серебристый сетчатый диск на чёрном автомобиле", "Willian Cittadin", "https://unsplash.com/@_willpic", "https://unsplash.com/photos/close-up-of-a-shiny-black-cars-custom-wheel-34nm2_k8PNw"),
];
