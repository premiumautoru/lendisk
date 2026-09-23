import "server-only";

type LeadInfo = {
  id: string;
  type: string;
  name: string;
  phone: string;
  carMake: string;
  carModel: string;
  vin: string;
  diameter: string;
  comment: string;
  product?: string | null;
};

const TYPES: Record<string, string> = { podbor: "Подбор дисков", product: "Заявка на товар", callback: "Обратный звонок" };

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/**
 * Sends a new-lead alert to the owner's Telegram chat.
 * Enabled only when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set; failures never block the form.
 */
export async function notifyNewLead(l: LeadInfo) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const lines = [
    `🟡 <b>Новая заявка Lendisk</b> — ${esc(TYPES[l.type] ?? l.type)}`,
    `👤 ${esc(l.name)}`,
    `📞 ${esc(l.phone)}`,
    (l.carMake || l.carModel) && `🚗 ${esc([l.carMake, l.carModel].filter(Boolean).join(" "))}`,
    l.vin && `VIN: <code>${esc(l.vin)}</code>`,
    l.diameter && `Диаметр: ${esc(l.diameter)}`,
    l.product && `Товар: ${esc(l.product)}`,
    l.comment && `💬 ${esc(l.comment.slice(0, 500))}`,
    site && `${site}/admin/leads/${l.id}`,
  ].filter(Boolean);
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("Telegram notification failed", e);
  }
}
