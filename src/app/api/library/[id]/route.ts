import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  PAGE_BUCKET,
  bookPrefix,
  isDbConfigured,
  pagePath,
  supabase,
} from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const NOT_CONFIGURED = "Cloud library not connected.";

/** Load one cloud book (record + page images) owned by the signed-in user. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDbConfigured()) {
    return Response.json({ error: NOT_CONFIGURED }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const sb = supabase();
  const { data: row, error } = await sb
    .from("zinebook_publications")
    .select("publication, source_name")
    .eq("id", id)
    .eq("user_email", email)
    .maybeSingle();
  if (error || !row) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const pages = (row.publication as { pages?: { id: string }[] })?.pages ?? [];
  const downloads = pages.map((p) =>
    sb.storage.from(PAGE_BUCKET).download(pagePath(email, id, p.id)),
  );
  const settled = await Promise.allSettled(downloads);
  const images: unknown[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled" || r.value.error || !r.value.data) continue;
    try {
      images.push(JSON.parse(await r.value.data.text()));
    } catch {
      /* skip corrupt files */
    }
  }
  return Response.json({
    publication: row.publication,
    images,
    sourceName: row.source_name,
  });
}

/** Delete one cloud book (record + its page files) owned by the user. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDbConfigured()) {
    return Response.json({ error: NOT_CONFIGURED }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!email) return Response.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const sb = supabase();
  const { error } = await sb
    .from("zinebook_publications")
    .delete()
    .eq("id", id)
    .eq("user_email", email);
  if (error) {
    return Response.json({ error: "Delete failed." }, { status: 500 });
  }
  const prefix = bookPrefix(email, id);
  const { data: listed } = await sb.storage.from(PAGE_BUCKET).list(prefix);
  const paths = (listed ?? []).map((f) => `${prefix}/${f.name}`);
  if (paths.length > 0) {
    await sb.storage.from(PAGE_BUCKET).remove(paths);
  }
  return Response.json({ ok: true });
}
