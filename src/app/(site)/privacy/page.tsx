import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Политика обработки персональных данных", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <div className="container-x max-w-3xl pb-24 pt-32 lg:pt-40">
      <p className="eyebrow mb-4">Lendisk</p>
      <h1 className="hyphens-auto break-words font-display text-[clamp(1.8rem,4vw,3rem)] font-bold uppercase leading-[1.05]">Политика обработки персональных данных</h1>
      <div className="mt-10 space-y-6 leading-relaxed text-bone/70 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-bone">
        <p>
          Настоящая политика определяет порядок обработки персональных данных пользователей сайта Lendisk (далее — Сайт) в соответствии с Федеральным законом
          № 152-ФЗ «О персональных данных».
        </p>
        <h2>1. Какие данные мы получаем</h2>
        <p>Имя, номер телефона, марка и модель автомобиля, VIN-номер, желаемые параметры дисков и комментарий — только то, что вы указываете в формах на Сайте.</p>
        <h2>2. Цели обработки</h2>
        <p>Связь с вами по заявке, подбор дисков под автомобиль, консультация, оформление и доставка заказа.</p>
        <h2>3. Хранение и защита</h2>
        <p>Данные хранятся в защищённой базе данных и доступны только уполномоченным сотрудникам Lendisk. Мы не передаём данные третьим лицам, кроме случаев, необходимых для доставки заказа или предусмотренных законом.</p>
        <h2>4. Срок обработки и отзыв согласия</h2>
        <p>
          Данные обрабатываются до достижения целей обработки или до отзыва согласия. Отозвать согласие и запросить удаление данных можно по телефону{" "}
          <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="text-gold">{s.phone}</a>.
        </p>
        <h2>5. Контакты оператора</h2>
        <p>Lendisk, {s.address}, {s.city}. Телефон: {s.phone}.</p>
      </div>
    </div>
  );
}
