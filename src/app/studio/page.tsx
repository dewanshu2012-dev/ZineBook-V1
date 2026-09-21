import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StudioClient } from "@/components/studio/studio-client";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function StudioPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="max-w-7xl py-8 md:py-10">
          <ButtonLink href="/upload" variant="ghost" size="sm" className="-ml-4">
            <ArrowLeft className="h-4 w-4" />
            Upload
          </ButtonLink>
          <StudioClient />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
