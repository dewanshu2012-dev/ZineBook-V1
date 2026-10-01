import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { LibraryClient } from "@/components/library/library-client";
import { Container } from "@/components/ui/container";

export default function LibraryPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Your collection
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-[-0.02em] md:text-5xl">
              Library.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-muted">
              Every book you save in this browser lives here — nothing leaves
              your device.
            </p>
          </div>
          <LibraryClient />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
