import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { UploadClient } from "@/components/upload/upload-client";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function UploadPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-12 md:py-16">
          <ButtonLink href="/" variant="ghost" size="sm" className="-ml-4">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            Back
          </ButtonLink>
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Create your publication
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-[-0.02em] md:text-5xl">
              Drop your PDF here.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-muted">
              Pages are extracted in your browser — nothing is uploaded to a
              server. Then you&apos;ll arrange them in the Setup Studio.
            </p>
          </div>
          <UploadClient />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
