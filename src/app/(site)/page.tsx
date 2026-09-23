import { prisma } from "@/lib/db";
import { getFacets, getFeatured } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { contactsFrom } from "@/components/site/contacts";
import { Hero } from "@/components/site/home/Hero";
import { Advantages, BrandStatement, ContactsSection, Cta, Delivery, Faq, Marquee, Podbor, ProductGrid, Reviews } from "@/components/site/home/Sections";

export default async function HomePage() {
  const [s, popular, fresh, facets, total, reviews, faq] = await Promise.all([
    getSettings(),
    getFeatured("popular", 8),
    getFeatured("new", 8),
    getFacets(),
    prisma.product.count({ where: { published: true, inStock: true } }),
    prisma.review.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { createdAt: "desc" }], take: 8 }),
    prisma.faqItem.findMany({ where: { published: true }, orderBy: { sort: "asc" } }),
  ]);
  const contacts = contactsFrom(s);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <Hero s={s} total={Math.floor(total / 100) * 100 || total} />
      <Marquee />
      <Advantages />
      <ProductGrid id="popular" eyebrow="Хиты Lendisk" title="Популярные диски" items={popular} whatsapp={s.whatsapp} href="/catalog" text="Модели, которые чаще всего выбирают наши клиенты." />
      <BrandStatement diameters={facets.diameters} />
      <ProductGrid id="new" eyebrow="Только что на складе" title="Новые поступления" items={fresh} whatsapp={s.whatsapp} href="/catalog?sort=new" />
      <Podbor s={s} />
      <Delivery s={s} />
      <Reviews reviews={reviews} />
      <Faq items={faq} />
      <Cta s={s} contacts={contacts} />
      <ContactsSection contacts={contacts} />
      {faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
    </>
  );
}
