import { indexNowKey } from "@/lib/indexnow";

// IndexNow key file (keyLocation) — proves to Yandex/Bing that the pings come from this site.
export function GET() {
  return new Response(indexNowKey(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
