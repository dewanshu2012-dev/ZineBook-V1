import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase server client for the cloud library.
 * Uses the SERVICE ROLE key (server-only — never expose it to the browser).
 * Auth is done by our Auth.js Google session; every query is scoped to
 * session.user.email, so users can only touch their own rows/files.
 * RLS stays enabled with no public policies as a second lock.
 */

let cached: SupabaseClient | null = null;

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function supabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

/** Private bucket holding one JSON file per page: {email}/{bookId}/{pageId}.json */
export const PAGE_BUCKET = "zinebook-pages";

function safe(s: string) {
  return s.replace(/[^a-zA-Z0-9@._-]/g, "_");
}

export function bookPrefix(email: string, bookId: string) {
  return `${safe(email)}/${safe(bookId)}`;
}

export function pagePath(email: string, bookId: string, pageId: string) {
  return `${bookPrefix(email, bookId)}/${safe(pageId)}.json`;
}
