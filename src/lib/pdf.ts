/**
 * Document ingestion (Milestone 2).
 *
 * Local-only: PDF.js renders each PDF page to a canvas thumbnail,
 * images are downscaled to preview size. No backend, no uploads
 * leaving the browser.
 */

export type ExtractedPage = {
  /** Original PDF page number (1-indexed), or image index + 1. */
  sourcePageNumber: number;
  width: number;
  height: number;
  /** Small JPEG data URL for strips/grids. */
  thumbnail: string;
  /** Larger JPEG data URL for the studio preview + reader. */
  preview: string;
};

export type ProgressFn = (done: number, total: number, stage: string) => void;

export const ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB per file
export const MAX_PDF_PAGES = 200;
export const MAX_IMAGE_FILES = 50;
/** Strip/grid long-edge target (px). */
const THUMB_EDGE = 480;
/** Studio preview / reader long-edge target (px). */
const PREVIEW_EDGE = 2200;

export type ValidatedSelection =
  | { kind: "pdf"; file: File }
  | { kind: "images"; files: File[] };

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function isPdf(f: File): boolean {
  return f.type === "application/pdf" || extOf(f.name) === ".pdf";
}

function isImage(f: File): boolean {
  return (
    f.type === "image/jpeg" ||
    f.type === "image/png" ||
    [".jpg", ".jpeg", ".png"].includes(extOf(f.name))
  );
}

/** Validate a raw FileList into either one PDF or a set of images. */
export function validateSelection(list: FileList | File[]): ValidatedSelection {
  const files = Array.from(list);
  if (files.length === 0) throw new Error("No file selected.");

  const pdfs = files.filter(isPdf);
  const images = files.filter(isImage);
  const bad = files.filter((f) => !isPdf(f) && !isImage(f));
  if (bad.length > 0) {
    throw new Error(
      `Unsupported file: ${bad[0].name}. Use PDF, JPG or PNG.`,
    );
  }
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      throw new Error(`${f.name} exceeds the 100 MB limit.`);
    }
    if (f.size === 0) throw new Error(`${f.name} appears to be empty.`);
  }
  if (pdfs.length > 0 && images.length > 0) {
    throw new Error("Upload either one PDF or images — not both at once.");
  }
  if (pdfs.length > 1) {
    throw new Error("One PDF at a time for now. Queue the next after this one.");
  }
  if (pdfs.length === 1) return { kind: "pdf", file: pdfs[0] };
  if (images.length > MAX_IMAGE_FILES) {
    throw new Error(`Up to ${MAX_IMAGE_FILES} images at once.`);
  }
  return { kind: "images", files: images };
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

function renderSized(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  edge: number,
  quality: number,
): string {
  const scale = Math.min(1, edge / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Derive both sizes from one raster — single downscale pass per size. */
function renderBoth(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
): { thumbnail: string; preview: string } {
  return {
    thumbnail: renderSized(source, srcW, srcH, THUMB_EDGE, 0.78),
    preview: renderSized(source, srcW, srcH, PREVIEW_EDGE, 0.92),
  };
}

/** Render every PDF page to a thumbnail. Sequential to bound memory. */
export async function extractPdfPages(
  file: File,
  onProgress: ProgressFn = () => {},
): Promise<ExtractedPage[]> {
  const pdfjs = await loadPdfjs();
  onProgress(0, 1, "Reading file…");
  const data = await file.arrayBuffer();

  onProgress(0, 1, "Parsing PDF…");
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;

  if (pdf.numPages < 1) throw new Error("This PDF has no pages.");
  if (pdf.numPages > MAX_PDF_PAGES) {
    await task.destroy().catch(() => {});
    throw new Error(
      `This PDF has ${pdf.numPages} pages — the MVP limit is ${MAX_PDF_PAGES}.`,
    );
  }

  const pages: ExtractedPage[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    onProgress(n - 1, pdf.numPages, `Rendering page ${n} of ${pdf.numPages}…`);
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: 1 });
    // Raster at 3x so previews stay sharp on retina, then downscale.
    const hires = page.getViewport({ scale: 3 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(hires.width);
    canvas.height = Math.floor(hires.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
    await page.render({ canvas, viewport: hires }).promise;
    const { thumbnail, preview } = renderBoth(canvas, hires.width, hires.height);
    pages.push({
      sourcePageNumber: n,
      width: Math.floor(viewport.width),
      height: Math.floor(viewport.height),
      thumbnail,
      preview,
    });
    page.cleanup();
    onProgress(n, pdf.numPages, `Rendering page ${n} of ${pdf.numPages}…`);
  }
  await task.destroy().catch(() => {});
  return pages;
}

async function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = url;
  });
}

/** Downscale each image file into a page thumbnail. */
export async function extractImagePages(
  files: File[],
  onProgress: ProgressFn = () => {},
): Promise<ExtractedPage[]> {
  const pages: ExtractedPage[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress(i, files.length, `Processing image ${i + 1} of ${files.length}…`);
    const url = URL.createObjectURL(files[i]);
    try {
      const img = await loadImageElement(url);
      const naturalW = img.naturalWidth || 1;
      const naturalH = img.naturalHeight || 1;
      const { thumbnail, preview } = renderBoth(img, naturalW, naturalH);
      pages.push({
        sourcePageNumber: i + 1,
        width: naturalW,
        height: naturalH,
        thumbnail,
        preview,
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    onProgress(i + 1, files.length, `Processing image ${i + 1} of ${files.length}…`);
  }
  if (pages.length === 0) throw new Error("No images could be read.");
  return pages;
}
