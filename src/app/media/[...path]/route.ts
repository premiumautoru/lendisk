import { getFile } from "@/lib/storage";

/** Serves admin-uploaded files (photos, logo, 3D models) from disk or the database. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: parts } = await ctx.params;
  const f = await getFile(parts.join("/"));
  if (!f) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": f.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(f.mime === "image/svg+xml" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}
