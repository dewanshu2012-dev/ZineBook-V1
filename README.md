# ZineBook — Make your PDF feel like a real magazine

Local-first digital publishing studio: upload a PDF/images → arrange pages →
configure covers, materials and reading direction → read with 3D page turns.
Built with Next.js + React + TypeScript + Tailwind CSS.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export into out/ (serve it, don't double-click)
npx serve out
```

> `npm run build` uses `output: "export"`. Open the result over HTTP
> (`npx serve out`) — `file://` cannot load `/_next` assets.

## Routes

- `/` — editorial landing
- `/upload` — drop zone, PDF.js extraction, page thumbnails
- `/studio` — arrange (drag-drop), covers, reading direction, materials
- `/read` — distraction-free reader (spreads on desktop, swipe pages on mobile)

## Architecture

```text
Publication data (lib/publication.ts, store: lib/publication-store.tsx)
  ↓  images in IndexedDB (lib/page-images.ts), shell in localStorage
Spread model (lib/spreads.ts: calculateSpreads — pure, tested)
  ↓
Magazine engine (components/magazine: Renderer/Spread/Cover/Page/Book)
  ↓
Material layers (lib/materials.ts + MaterialLayer)
  ↓
Animation (MagazineBook: CSS 3D leaf; swappable for WebGL later)
```

Portable artifact: **Publish → Export `.zinebook.json`**
(`lib/publication-io.ts`) — the same shape a future cloud API will sync.

## Status

Milestones 1–12 done: landing, upload, thumbnails, arrangement, data model,
covers/spreads, renderer, page turns, materials, reader, responsive, publish
(export/import). Deliberately deferred: auth, cloud storage, sharing URLs,
analytics, payments.
