import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * 1. One address for search engines: when CANONICAL_HOST is set (e.g. lendisk.com), requests to any
 *    other host (lendisk.onrender.com, www.…) get a permanent 301 redirect to it, so there are no duplicates.
 * 2. Optimistic guard for the admin panel: requests without a valid signed session cookie are redirected
 *    to /admin/login. Every admin page and server action re-checks the session too.
 */
export async function proxy(req: NextRequest) {
  const canonical = process.env.CANONICAL_HOST;
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0];
  if (canonical && host && host !== canonical && !host.startsWith("localhost") && !host.startsWith("127.")) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${canonical}`);
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // everything except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|catalog/.*\\.webp|brand/|favicon|icon|apple-icon).*)"],
};
