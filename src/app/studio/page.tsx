import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StudioClient } from "@/components/studio/studio-client";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function StudioPage() {
  return (
    <div className="flex min-h-full flex-col lg:h-dvh">
      <SiteHeader />
      <main className="flex-1 lg:min-h-0">
        <Container className="flex max-w-[1600px] flex-col py-6 lg:h-full lg:py-4">
          <ButtonLink href="/upload" variant="ghost" size="sm" className="-ml-4 self-start">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            Upload
          </ButtonLink>
          <StudioClient />
        </Container>
      </main>
      <div className="lg:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
