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

function emailOf(session: { user?: { email?: string | null } } | null) {
  return session?.user?.email ?? null;
}

const NOT_CONFIGURED = "Cloud library not connected. Add Supabase keys first.";

/** List the signed-in user's cloud books (metadata only, no page images). */
export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({ error: NOT_CONFIGURED }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  const email = emailOf(session);
  if (!email) return Response.json({ error: "Sign in required." }, { status: 401 });

  const sb = supabase();
  const { data, error } = await sb
    .from("zinebook_publications")
    .select("id, title, page_count, source_name, created_at, updated_at")
    .eq("user_email", email)
    .order("updated_at", { ascending: false });
  if (error) {
    return Response.json({ error: "Could not load your library." }, { status: 500 });
  }
  return Response.json({
    books: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      pageCount: row.page_count,
      sourceName: row.source_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

/** Save one book: record in the table, page images as files in storage. */
export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return Response.json({ error: NOT_CONFIGURED }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  const email = emailOf(session);
  if (!email) return Response.json({ error: "Sign in required." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }
  const { publication, images, sourceName } = body as {
    publication?: unknown;
    images?: unknown;
    sourceName?: unknown;
  };
  if (
    typeof publication !== "object" ||
    publication === null ||
    typeof (publication as { id?: unknown }).id !== "string" ||
    !Array.isArray((publication as { pages?: unknown }).pages) ||
    (publication as { pages: unknown[] }).pages.length === 0
  ) {
    return Response.json({ error: "No pages to save." }, { status: 400 });
  }
  if (!Array.isArray(images)) {
    return Response.json({ error: "Images must be an array." }, { status: 400 });
  }

  const pub = publication as {
    id: string;
    title: string;
    pages: { id: string }[];
  };
  const title =
    typeof pub.title === "string" && pub.title.trim() !== ""
      ? pub.title.slice(0, 200)
      : "Untitled Magazine";
  const source =
    typeof sourceName === "string" ? sourceName.slice(0, 200) : null;

  const sb = supabase();

  // Ownership: never overwrite another user's book.
  const { data: existing } = await sb
    .from("zinebook_publications")
    .select("user_email")
    .eq("id", pub.id)
    .maybeSingle();
  if (existing && existing.user_email !== email) {
    return Response.json({ error: "Not your book." }, { status: 403 });
  }

  const { error: upsertError } = await sb.from("zinebook_publications").upsert(
    {
      id: pub.id,
      user_email: email,
      title,
      page_count: pub.pages.length,
      source_name: source,
      publication,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (upsertError) {
    return Response.json({ error: "Could not save your book." }, { status: 500 });
  }

  // Page images → one JSON file per page. Stale files (deleted pages) removed.
  const byId = new Map(
    (images as { id?: unknown }[])
      .filter((img): img is { id: string } => typeof img?.id === "string")
      .map((img) => [img.id, img]),
  );
  const prefix = bookPrefix(email, pub.id);
  const uploads = pub.pages.map((p) => {
    const img = byId.get(p.id);
    if (!img) return Promise.resolve();
    return sb.storage
      .from(PAGE_BUCKET)
      .upload(pagePath(email, pub.id, p.id), JSON.stringify(img), {
        contentType: "application/json",
        upsert: true,
      })
      .then(({ error }) => {
        if (error) throw error;
      });
  });
  const results = await Promise.allSettled(uploads);
  if (results.some((r) => r.status === "rejected")) {
    return Response.json(
      { error: "Book saved, but some page images failed. Try saving again." },
      { status: 500 },
    );
  }
  // Best-effort cleanup of images for pages that no longer exist.
  const currentIds = new Set(pub.pages.map((p) => p.id));
  const { data: listed } = await sb.storage.from(PAGE_BUCKET).list(prefix);
  const stale = (listed ?? [])
    .map((f) => f.name)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length))
    .filter((pageId) => !currentIds.has(pageId))
    .map((pageId) => `${prefix}/${pageId}.json`);
  if (stale.length > 0) {
    await sb.storage.from(PAGE_BUCKET).remove(stale);
  }

  return Response.json({ id: pub.id });
}
