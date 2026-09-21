"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExtractedPage } from "@/lib/pdf";
import {
  clearPageImages,
  loadPageImages,
  savePageImages,
  type PageImage,
} from "@/lib/page-images";
import {
  createBlankPage,
  createPublication,
  type CoverMode,
  type MaterialType,
  type Page,
  type PageType,
  type Publication,
  type PublicationMaterial,
  type ReadingDirection,
} from "@/lib/publication";

const STORAGE_KEY = "zinebook:publication:v1";

type PublicationState = {
  publication: Publication | null;
  /** pageId → { thumbnail, preview }. Restored from IndexedDB on boot. */
  images: Record<string, PageImage>;
  /** False until the IndexedDB restore attempt finishes. */
  hydrated: boolean;
  sourceName: string | null;
  selectedId: string | null;
  loadFromExtracted: (
    sourceName: string,
    extracted: ExtractedPage[],
  ) => Publication;
  clear: () => void;
  select: (id: string | null) => void;
  reorderPages: (activeId: string, overId: string) => void;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  rotatePage: (id: string) => void;
  insertBlank: (atIndex?: number) => void;
  setPageType: (id: string, type: PageType) => void;
  setCoverMode: (mode: CoverMode) => void;
  setReadingDirection: (dir: ReadingDirection) => void;
  rename: (title: string) => void;
  setMaterialType: (type: MaterialType) => void;
  setMaterialValue: (
    key: "textureIntensity" | "pageDepth" | "shadowIntensity",
    value: number,
  ) => void;
  /** Replace working state with an imported/exported snapshot. */
  restoreSnapshot: (
    publication: Publication,
    images: PageImage[],
    sourceName: string | null,
  ) => void;
};

const Ctx = createContext<PublicationState | null>(null);

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function readShell(): Publication | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Publication) : null;
  } catch {
    return null;
  }
}

/** Array order is the source of truth; mirror it into `position`. */
function ordered(pages: Page[]): Page[] {
  return pages.map((p, i) => ({ ...p, position: i }));
}

function touched(pub: Publication, pages: Page[]): Publication {
  return { ...pub, pages: ordered(pages), updatedAt: new Date().toISOString() };
}

export function PublicationProvider({ children }: { children: ReactNode }) {
  // Lazy boot state reads the persisted shell once — no render-loop effect.
  // Guarded for prerender, where localStorage does not exist.
  const [boot] = useState<{ shell: Publication | null }>(() => ({
    shell: typeof localStorage === "undefined" ? null : readShell(),
  }));
  const [publication, setPublication] = useState<Publication | null>(boot.shell);
  const [images, setImages] = useState<Record<string, PageImage>>({});
  const [hydrated, setHydrated] = useState(boot.shell === null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    boot.shell?.pages[0]?.id ?? null,
  );

  // One-shot restore of images for the persisted shell.
  useEffect(() => {
    if (!boot.shell) return;
    let cancelled = false;
    const ids = boot.shell.pages.map((p) => p.id);
    loadPageImages(ids).then((map) => {
      if (!cancelled) {
        setImages(map);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the lean shell on every mutation. Write-only effect.
  useEffect(() => {
    if (!hydrated || typeof localStorage === "undefined") return;
    try {
      if (publication) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(publication));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* quota or private mode — session still works in memory */
    }
  }, [publication, hydrated]);

  const loadFromExtracted = useCallback(
    (name: string, extracted: ExtractedPage[]) => {
      const base = createPublication(name.replace(/\.[^.]+$/, "") || "Untitled Magazine");
      const pages: Page[] = extracted.map((p, i) => ({
        id: uid("pg"),
        sourcePageNumber: p.sourcePageNumber,
        position: i,
        type: "page" as const,
        rotation: 0,
      }));
      const next: Publication = {
        ...base,
        pages,
        updatedAt: new Date().toISOString(),
      };
      const imgs: Record<string, PageImage> = {};
      pages.forEach((pg, i) => {
        imgs[pg.id] = {
          id: pg.id,
          thumbnail: extracted[i].thumbnail,
          preview: extracted[i].preview,
        };
      });
      setPublication(next);
      setImages(imgs);
      setHydrated(true);
      setSourceName(name);
      setSelectedId(pages[0]?.id ?? null);
      // Persist images in the background; UI never blocks on this.
      void savePageImages(Object.values(imgs));
      return next;
    },
    [],
  );

  const clear = useCallback(() => {
    setPublication(null);
    setImages({});
    setSourceName(null);
    setSelectedId(null);
    void clearPageImages();
  }, []);

  const restoreSnapshot = useCallback(
    (snapshot: Publication, imgs: PageImage[], name: string | null) => {
      const map: Record<string, PageImage> = {};
      for (const img of imgs) map[img.id] = img;
      setPublication(snapshot);
      setImages(map);
      setHydrated(true);
      setSourceName(name);
      setSelectedId(snapshot.pages[0]?.id ?? null);
      void savePageImages(imgs);
    },
    [],
  );

  const select = useCallback((id: string | null) => setSelectedId(id), []);

  const reorderPages = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;
    setPublication((prev) => {
      if (!prev) return prev;
      const from = prev.pages.findIndex((p) => p.id === activeId);
      const to = prev.pages.findIndex((p) => p.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev.pages];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return touched(prev, next);
    });
  }, []);

  const deletePage = useCallback(
    (id: string) => {
      if (!publication) return;
      const idx = publication.pages.findIndex((p) => p.id === id);
      if (idx < 0) return;
      const next = publication.pages.filter((p) => p.id !== id);
      // Move selection to the neighbour that slides into place.
      setSelectedId(next[Math.min(idx, next.length - 1)]?.id ?? null);
      setPublication(touched(publication, next));
      setImages((prev) => {
        if (!(id in prev)) return prev;
        const rest = { ...prev };
        delete rest[id];
        return rest;
      });
    },
    [publication],
  );

  const duplicatePage = useCallback(
    (id: string) => {
      const src = publication?.pages.find((p) => p.id === id);
      if (!publication || !src) return;
      const copy: Page = { ...src, id: uid("pg") };
      const idx = publication.pages.findIndex((p) => p.id === id);
      const next = [...publication.pages];
      next.splice(idx + 1, 0, copy);
      setPublication(touched(publication, next));
      const img = images[id];
      if (img) {
        const imgCopy = { ...img, id: copy.id };
        setImages((prev) => ({ ...prev, [copy.id]: imgCopy }));
        void savePageImages([imgCopy]);
      }
      setSelectedId(copy.id);
    },
    [publication, images],
  );

  const rotatePage = useCallback((id: string) => {
    setPublication((prev) => {
      if (!prev) return prev;
      return touched(
        prev,
        prev.pages.map((p) =>
          p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p,
        ),
      );
    });
  }, []);

  const insertBlank = useCallback(
    (atIndex?: number) => {
      if (!publication) return;
      const idx =
        atIndex ??
        (selectedId
          ? publication.pages.findIndex((p) => p.id === selectedId) + 1
          : publication.pages.length);
      const blank = { ...createBlankPage(0), id: uid("blank") };
      const next = [...publication.pages];
      next.splice(Math.max(0, Math.min(idx, next.length)), 0, blank);
      setPublication(touched(publication, next));
      setSelectedId(blank.id);
    },
    [publication, selectedId],
  );

  const setPageType = useCallback(
    (id: string, type: PageType) => {
      if (!publication) return;
      // Front and back covers are unique — demote the previous holder.
      const next = publication.pages.map((p) => {
        if (p.id === id) return { ...p, type };
        if (
          (type === "cover" || type === "back-cover") &&
          p.type === type
        ) {
          return { ...p, type: "page" as PageType };
        }
        return p;
      });
      setPublication(touched(publication, next));
    },
    [publication],
  );

  const setCoverMode = useCallback(
    (mode: CoverMode) => {
      if (!publication || publication.coverMode === mode) return;
      setPublication({
        ...publication,
        coverMode: mode,
        updatedAt: new Date().toISOString(),
      });
    },
    [publication],
  );

  const setReadingDirection = useCallback(
    (dir: ReadingDirection) => {
      if (!publication || publication.readingDirection === dir) return;
      setPublication({
        ...publication,
        readingDirection: dir,
        updatedAt: new Date().toISOString(),
      });
    },
    [publication],
  );

  const rename = useCallback(
    (title: string) => {
      const clean = title.trim().slice(0, 80);
      if (!publication || clean.length === 0) return;
      setPublication({
        ...publication,
        title: clean,
        updatedAt: new Date().toISOString(),
      });
    },
    [publication],
  );

  const setMaterialType = useCallback(
    (type: MaterialType) => {
      if (!publication || publication.material.type === type) return;
      setPublication({
        ...publication,
        material: { ...publication.material, type },
        updatedAt: new Date().toISOString(),
      });
    },
    [publication],
  );

  const setMaterialValue = useCallback(
    (
      key: "textureIntensity" | "pageDepth" | "shadowIntensity",
      value: number,
    ) => {
      if (!publication) return;
      const clamped = Math.min(1, Math.max(0, value));
      if (publication.material[key] === clamped) return;
      const material: PublicationMaterial = {
        ...publication.material,
        [key]: clamped,
      };
      setPublication({
        ...publication,
        material,
        updatedAt: new Date().toISOString(),
      });
    },
    [publication],
  );

  const value = useMemo(
    () => ({
      publication,
      images,
      hydrated,
      sourceName,
      selectedId,
      loadFromExtracted,
      clear,
      select,
      reorderPages,
      deletePage,
      duplicatePage,
      rotatePage,
      insertBlank,
      setPageType,
      setCoverMode,
      setReadingDirection,
      rename,
      setMaterialType,
      setMaterialValue,
      restoreSnapshot,
    }),
    [
      publication,
      images,
      hydrated,
      sourceName,
      selectedId,
      loadFromExtracted,
      clear,
      select,
      reorderPages,
      deletePage,
      duplicatePage,
      rotatePage,
      insertBlank,
      setPageType,
      setCoverMode,
      setReadingDirection,
      rename,
      setMaterialType,
      setMaterialValue,
      restoreSnapshot,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePublication(): PublicationState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePublication must be used inside PublicationProvider.");
  return ctx;
}
