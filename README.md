# Lendisk — сайт продажи автомобильных дисков

Сайт Lendisk: каталог, заявки и админ-панель.
Стек: **Next.js 16** (App Router, Server Actions), **TypeScript**, **Tailwind CSS 4**, **Motion**, **Prisma** (SQLite локально, PostgreSQL в продакшене), **three.js / react-three-fiber** для 3D.

## Быстрый старт (локально)

```bash
npm install
cp .env.example .env        # заполните AUTH_SECRET и ADMIN_PASSWORD
npx prisma db push          # создать таблицы
npm run db:seed             # каталог, настройки, демо-отзывы, FAQ, админ
npm run dev                 # http://localhost:3000
```

Админ-панель находится по адресу **/admin**. Логин и пароль берутся из `ADMIN_LOGIN` / `ADMIN_PASSWORD` в `.env`. В базе пароль хранится только как bcrypt-хэш. После первого входа смените его в разделе «Настройки сайта → Смена пароля».

## Что где

| Раздел | Путь |
|---|---|
| Главная, каталог, карточка товара | `src/app/(site)/…` |
| Админ-панель | `src/app/admin/…` |
| Серверные действия (заявки, CRUD, настройки) | `src/app/actions/*` |
| Защита админки (проверка сессии) | `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/session.ts` |
| Схема БД | `prisma/schema.prisma` |
| Тексты и контакты по умолчанию | `src/lib/settings-defaults.ts` |
| Логотип | `public/brand/lendisk-logo.svg`, `src/components/brand/Logo.tsx` |
| Фото каталога (из xls) | `public/catalog/*.webp` |
| Загрузки из админки (фото, логотип, 3D) | `storage/uploads` (отдаются через `/media/...`) |

## Уведомления и выгрузка заявок

- **Telegram:** создайте бота через @BotFather и напишите ему любое сообщение. `chat_id` возьмите из `https://api.telegram.org/bot<TOKEN>/getUpdates`, затем укажите `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в `.env`. Каждая новая заявка будет приходить в Telegram со ссылкой на неё в админке. Если переменные пусты, уведомления выключены.
- **Excel:** «Заявки → Скачать в Excel (CSV)», файл открывается в Excel с кириллицей.

## Поиск Google и Яндекс

Что уже сделано на сайте: уникальные title и description, один h1 на странице, canonical, `sitemap.xml` со всеми товарами и страницами диаметров, `robots.txt` (закрыта только админка), noindex для поиска и комбинаций фильтров, разметка schema.org (магазин, товар с ценой и наличием, хлебные крошки, FAQ), Open Graph.

После подключения постоянного домена:
1. В переменных окружения сервера укажите `NEXT_PUBLIC_SITE_URL=https://ваш-домен` и `CANONICAL_HOST=ваш-домен`, затем пересоберите сайт. Старый адрес onrender.com будет отдавать 301-редирект на домен.
2. **Яндекс Вебмастер** (webmaster.yandex.ru) → «Добавить сайт» → способ «Мета-тег»: значение `content` впишите в `YANDEX_VERIFICATION`, пересоберите, нажмите «Проверить». Затем «Индексирование → Файлы Sitemap» → `https://ваш-домен/sitemap.xml`; «Информация о сайте → Регион сайта» → Москва.
3. **Google Search Console** (search.google.com/search-console) → «Добавить ресурс» → «Префикс URL» → способ «Тег HTML»: значение `content` в `GOOGLE_SITE_VERIFICATION`, пересоберите, «Подтвердить». Затем «Файлы Sitemap» → `sitemap.xml`.
4. В обоих сервисах запросите переобход главной страницы и каталога.

## Импорт склада из Excel

Фото и позиции импортированы из «Склад Диски Краснодар.xls» и «Склад Диски Крым.xls». Позиции обоих складов объединены в один каталог, склад хранится служебным полем. Скрипт вытаскивает встроенные в xls фотографии и привязывает их к строкам.

```bash
pip install xlrd olefile pillow
python3 scripts/import_xls.py "Склад Диски Краснодар.xls" "Склад Диски Крым.xls"
npm run db:seed              # добавит новые позиции, существующие (и их цены) не трогает
npm run db:reset-catalog     # ВНИМАНИЕ: пересоздать каталог целиком (правки из админки по товарам будут потеряны)
```

Временные цены (9 000–12 000 ₽) проставляются по порядку оптовой цены. Цены хранятся **только в базе данных**, меняются в админке — по одному товару, прямо в списке или массово по бренду и диаметру.

## Деплой (продакшен)

1. Создайте PostgreSQL (Neon, Supabase, Render, Yandex Cloud и т.п.).
2. В `prisma/schema.prisma` замените `provider = "sqlite"` на `provider = "postgresql"`.
3. Переменные окружения: `DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 48`), `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL=https://ваш-домен`, `UPLOAD_DIR`.
4. `npm install && npx prisma db push && npm run db:seed && npm run build && npm start`.
5. Загрузки из админки пишутся в `UPLOAD_DIR`. Нужен постоянный диск (VPS, Render Disk), либо замените `src/lib/storage.ts` на S3 / Object Storage.

## Проверено

- Главная: интро с логотипом, вращающийся диск на подиуме, все блоки, карта, кнопки связи.
- Каталог: фильтры по бренду, диаметру, цене, наличию, марке авто и PCD, поиск (модель, артикул, `R19`, `5x112`), сортировка, пагинация, мобильная панель фильтров.
- Карточка товара: галерея, вращение 360° перетаскиванием, 3D-просмотр загруженной GLB-модели, schema.org Product.
- Заявки: валидация (телефон, VIN, согласие на обработку ПД), сохранение в БД, отображение в админке, смена статуса, заметки, удаление.
- Админка: вход (bcrypt, подписанная httpOnly-cookie, лимит попыток), CRUD товаров, фото, 3D, быстрая и массовая смена цен, отзывы, FAQ, настройки, смена логотипа и пароля.
- SEO: title, description, Open Graph, favicon, `sitemap.xml`, `robots.txt`, JSON-LD (AutoPartsStore, Product, FAQPage, BreadcrumbList).
