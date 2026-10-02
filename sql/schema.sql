-- ZineBook cloud library (Supabase).
-- Run once: Supabase dashboard → SQL Editor → paste this → Run.
-- Book records live in the table; page images live in the
-- zinebook-pages storage bucket (one JSON file per page).
-- Auth is our Auth.js Google session (service-role key server-side,
-- every query scoped to the signed-in user's email); RLS stays on
-- with no public policies as a second lock.

CREATE TABLE IF NOT EXISTS public.zinebook_publications (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Magazine',
  page_count INTEGER NOT NULL DEFAULT 0,
  source_name TEXT,
  publication JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS zinebook_publications_user_idx
  ON public.zinebook_publications (user_email, updated_at DESC);

ALTER TABLE public.zinebook_publications ENABLE ROW LEVEL SECURITY;

-- Private bucket for page images (no public access).
INSERT INTO storage.buckets (id, name, public)
VALUES ('zinebook-pages', 'zinebook-pages', false)
ON CONFLICT (id) DO NOTHING;
