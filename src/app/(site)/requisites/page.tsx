import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { legalFrom } from "@/components/site/contacts";
import { CopyButton } from "@/components/site/CopyButton";

export const metadata: Metadata = {
  title: "Реквизиты",
  description: "Реквизиты продавца автомобильных дисков Lendisk: ИНН, ОГРНИП, юридический адрес и банковские реквизиты.",
  alternates: { canonical: "/requisites" },
};

export default async function RequisitesPage() {
  const l = legalFrom(await getSettings());
  const company: [string, string][] = [
    ["Наименование", l.name],
    ["Краткое наименование", l.short],
    ["ИНН", l.inn],
    ["ОГРНИП", l.ogrnip],
    ["Дата регистрации", l.regDate],
    ["Юридический адрес", l.address],
    ["E-mail", l.email],
  ];
  const bank: [string, string][] = [
    ["Банк", l.bank.name],
    ["Расчётный счёт", l.bank.account],
    ["БИК", l.bank.bik],
    ["Корр. счёт", l.bank.corr],
  ];
  const text = [...company, ...bank].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");

  return (
    <div className="container-x max-w-3xl pb-24 pt-32 lg:pt-40">
      <nav className="mb-6 text-xs text-bone/40" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-gold">Главная</Link> <span className="mx-2">/</span> <span className="text-bone/70">Реквизиты</span>
      </nav>
      <p className="eyebrow mb-4">Lendisk</p>
      <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold uppercase leading-[1.05]">Реквизиты</h1>
      <p className="mt-4 text-bone/55">Продавец — {l.short}; реквизиты для договоров и безналичной оплаты.</p>

      <Table title="Продавец" rows={company} />
      <Table title="Банковские реквизиты" rows={bank} />

      <div className="mt-8">
        <CopyButton text={text} label="Скопировать реквизиты" />
      </div>
    </div>
  );
}

function Table({ title, rows }: { title: string; rows: [string, string][] }) {
  const shown = rows.filter(([, v]) => v);
  if (!shown.length) return null;
  return (
    <section className="mt-10 overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-graphite">
      <h2 className="border-b border-white/[0.06] px-6 py-4 font-display text-sm uppercase tracking-[0.16em] text-gold sm:px-8">{title}</h2>
      <dl className="divide-y divide-white/[0.06]">
        {shown.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 sm:px-8">
            <dt className="text-sm text-bone/45">{k}</dt>
            <dd className="break-words tabular-nums text-bone">
              {k === "E-mail" ? <a href={`mailto:${v}`} className="hover:text-gold">{v}</a> : v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
