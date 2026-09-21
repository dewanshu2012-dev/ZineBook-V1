import { Reader } from "@/components/reader/reader";

/** Distraction-free magazine reader (Milestone 10). */
export default function ReadPage() {
  return (
    <div className="flex min-h-full flex-col bg-paper-deep/40">
      <main className="flex flex-1 flex-col">
        <Reader />
      </main>
    </div>
  );
}
