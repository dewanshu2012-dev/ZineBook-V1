/**
 * Page image persistence (Milestone 3).
 *
 * Thumbnails + previews live in IndexedDB (large, binary-ish data),
 * while the lean Publication JSON stays in localStorage.
 * Everything degrades to memory-only if storage is unavailable.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type PageImage = {
  id: string;
  thumbnail: string;
  preview: string;
};

interface ZineDB extends DBSchema {
  images: {
    key: string;
    value: PageImage;
  };
}

let db: Promise<IDBPDatabase<ZineDB>> | null = null;

function getDb(): Promise<IDBPDatabase<ZineDB>> | null {
  if (typeof indexedDB === "undefined") return null;
  if (!db) {
    db = openDB<ZineDB>("zinebook", 1, {
      upgrade(d) {
        d.createObjectStore("images");
      },
    });
  }
  return db;
}

export async function savePageImages(images: PageImage[]): Promise<boolean> {
  const d = getDb();
  if (!d) return false;
  try {
    const tx = (await d).transaction("images", "readwrite");
    await Promise.all([
      ...images.map((img) => tx.store.put(img, img.id)),
      tx.done,
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function loadPageImages(
  ids: string[],
): Promise<Record<string, PageImage>> {
  const d = getDb();
  if (!d || ids.length === 0) return {};
  try {
    const store = (await d).transaction("images", "readonly").store;
    const found = await Promise.all(ids.map((id) => store.get(id)));
    const map: Record<string, PageImage> = {};
    for (const img of found) {
      if (img) map[img.id] = img;
    }
    return map;
  } catch {
    return {};
  }
}

export async function clearPageImages(): Promise<void> {
  const d = getDb();
  if (!d) return;
  try {
    await (await d).clear("images");
  } catch {
    /* private mode etc. — memory state is already cleared */
  }
}
