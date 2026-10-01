"use client";

import { useCallback, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowRight01Icon, RotateCcwIcon } from "@hugeicons/core-free-icons";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  extractImagePages,
  extractPdfPages,
  validateSelection,
} from "@/lib/pdf";
import { usePublication } from "@/lib/publication-store";
import { Dropzone } from "./dropzone";
import { ProcessingView } from "./processing-view";
import { ResultsGrid } from "./results-grid";

type Phase = "idle" | "working" | "done";

export function UploadClient() {
  const { publication, images, hydrated, sourceName, loadFromExtracted, clear } =
    usePublication();
  const [phase, setPhase] = useState<Phase>(publication ? "done" : "idle");
  const [stage, setStage] = useState("");
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (list: FileList) => {
      setError(null);
      let selection;
      try {
        selection = validateSelection(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid file.");
        return;
      }
      setPhase("working");
      setDone(0);
      setTotal(1);
      try {
        const onProgress = (d: number, t: number, s: string) => {
          setDone(d);
          setTotal(t);
          setStage(s);
        };
        const extracted =
          selection.kind === "pdf"
            ? await extractPdfPages(selection.file, onProgress)
            : await extractImagePages(selection.files, onProgress);
        const label =
          selection.kind === "pdf" ? selection.file.name : `${extracted.length} images`;
        loadFromExtracted(label, extracted);
        setPhase("done");
      } catch (e) {
        setPhase("idle");
        setError(
          e instanceof Error ? e.message : "Something went wrong while processing.",
        );
      }
    },
    [loadFromExtracted],
  );

  const startOver = useCallback(() => {
    clear();
    setPhase("idle");
    setError(null);
  }, [clear]);

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      {phase === "working" ? (
        <ProcessingView stage={stage || "Starting…"} done={done} total={total} />
      ) : phase === "done" && publication ? (
        <div className="space-y-8">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              {sourceName ?? "Document"} — ready
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-[-0.02em]">
              {publication.pages.length}{" "}
              {publication.pages.length === 1 ? "page" : "pages"} extracted
            </h2>
          </div>

          <ResultsGrid pages={publication.pages} images={images} />

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-line bg-paper-deep/40 px-6 py-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={startOver}>
                <HugeiconsIcon icon={RotateCcwIcon} className="h-4 w-4" />
                Start over
              </Button>
            </div>
            <ButtonLink href="/studio" size="md">
              Open in Setup Studio
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" strokeWidth={2} />
            </ButtonLink>
          </div>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {hydrated
              ? "Thumbnails persist across reloads via local storage"
              : "Restoring thumbnails…"}
          </p>
        </div>
      ) : (
        <Dropzone onFiles={handleFiles} />
      )}

      {error && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-900/20 bg-red-50 px-5 py-4 text-sm text-red-950"
          role="alert"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
