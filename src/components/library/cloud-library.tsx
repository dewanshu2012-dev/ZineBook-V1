"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CloudUploadIcon,
  Delete02Icon,
  GoogleIcon,
} from "@hugeicons/core-free-icons";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { loadPageImages } from "@/lib/page-images";
import type { PageImage } from "@/lib/page-images";
import type { Publication } from "@/lib/publication";
import { usePublication } from "@/lib/publication-store";

const STORAGE_KEY = "zinebook:publication:v1";

type CloudBook = {
  id: string;
  title: string;
  pageCount: number;
  sourceName: string | null;
  createdAt: string;
  updatedAt: string;
};

type Status = "idle" | "loading" | "ready" | "unconfigured" | "denied";

function readLocalShell(): Publication | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Publication;
    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Cloud bookshelf: each Google account keeps its own books in Vercel Postgres. */
export function CloudLibrary() {
  const { data: session, status: authStatus } = useSession();
  const { restoreSnapshot } = usePublication();
  const router = useRouter();
  const [books, setBooks] = useState<CloudBook[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const res = await fetch("/api/library");
      if (res.status === 401) {
        setStatus("denied");
        return;
      }
      if (res.status === 503) {
        setStatus("unconfigured");
        return;
      }
      if (!res.ok) throw new Error("Failed to load.");
      const data = (await res.json()) as { books: CloudBook[] };
      setBooks(data.books ?? []);
      setStatus("ready");
    } catch {
      setNotice("Could not reach your cloud library. Try again.");
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    // Fetch on sign-in: syncing React state with the external auth session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authStatus === "authenticated") void refresh();
    if (authStatus === "unauthenticated") setStatus("denied");
  }, [authStatus, refresh]);

  const saveCurrent = async () => {
    const shell = readLocalShell();
    if (!shell) {
      setNotice("Nothing in this browser to save yet — create a magazine first.");
      return;
    }
    setBusy("save");
    setNotice(null);
    try {
      const map = await loadPageImages(shell.pages.map((p) => p.id));
      const images: PageImage[] = shell.pages
        .map((p) => map[p.id])
        .filter((img): img is PageImage => img != null);
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publication: shell, images, sourceName: null }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? "Save failed.");
      }
      setNotice(`Saved “${shell.title}” to your cloud library.`);
      await refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  };

  const openBook = async (id: string) => {
    setBusy(id);
    setNotice(null);
    try {
      const res = await fetch(`/api/library/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Could not open that book.");
      const data = (await res.json()) as {
        publication: Publication;
        images: PageImage[];
        sourceName: string | null;
      };
      restoreSnapshot(data.publication, data.images ?? [], data.sourceName ?? null);
      router.push("/studio");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Open failed.");
      setBusy(null);
    }
  };

  const removeBook = async (id: string) => {
    setBusy(id);
    setNotice(null);
    try {
      const res = await fetch(`/api/library/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed.");
      setBooks((b) => b.filter((book) => book.id !== id));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && status === "idle")) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-paper p-5 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Loading cloud library…
        </p>
      </div>
    );
  }

  if (authStatus === "unauthenticated" || status === "denied") {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-paper p-6 text-center sm:p-8">
        <HugeiconsIcon icon={CloudUploadIcon} className="mx-auto h-8 w-8 text-muted" />
        <h2 className="mt-3 font-display text-2xl tracking-[-0.01em]">
          Back up your books to the cloud.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          Sign in with Google and every book you save follows your account —
          open it on any device.
        </p>
        <div className="mt-5">
          <Button type="button" size="sm" onClick={() => signIn("google")}>
            <HugeiconsIcon icon={GoogleIcon} className="h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-paper p-6 text-center">
        <p className="text-sm leading-6 text-muted">
          Signed in as {session?.user?.email} — the cloud database isn&apos;t
          connected yet. In Supabase: create a project, run{" "}
          <span className="font-mono text-xs">sql/schema.sql</span> once in the
          SQL Editor, then add the project URL + service-role key to your
          environment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl tracking-[-0.01em]">Cloud library</h2>
          <p className="mt-1 text-xs text-muted">
            {session?.user?.email} · {books.length}{" "}
            {books.length === 1 ? "book" : "books"} backed up
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={saveCurrent}
          disabled={busy !== null || status === "loading"}
        >
          <HugeiconsIcon icon={CloudUploadIcon} className="h-4 w-4" />
          {busy === "save" ? "Saving…" : "Save this browser's book"}
        </Button>
      </div>

      {notice ? (
        <p className="mt-3 text-center text-sm text-muted">{notice}</p>
      ) : null}

      {status === "loading" ? (
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Loading…
        </p>
      ) : books.length === 0 ? (
        <p className="mt-4 text-center text-sm leading-6 text-muted">
          No cloud books yet. Open the studio, make something, then save it here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{book.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {book.pageCount} {book.pageCount === 1 ? "page" : "pages"}
                  {(() => {
                    try {
                      return ` · ${new Date(book.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
                    } catch {
                      return "";
                    }
                  })()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => openBook(book.id)}
                  disabled={busy !== null}
                >
                  {busy === book.id ? "Opening…" : "Open"}
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBook(book.id)}
                  disabled={busy !== null}
                  aria-label={`Delete ${book.title}`}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
