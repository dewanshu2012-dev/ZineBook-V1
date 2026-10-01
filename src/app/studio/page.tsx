import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StudioHeaderActions } from "@/components/studio/studio-header-actions";
import { StudioClient } from "@/components/studio/studio-client";
import { Container } from "@/components/ui/container";

export default function StudioPage() {
  return (
    <div className="flex min-h-full flex-col lg:h-dvh lg:overflow-hidden">
      <SiteHeader actions={<StudioHeaderActions />} />
      <main className="flex-1 lg:min-h-0 lg:overflow-hidden">
        <Container className="flex max-w-[1600px] flex-col py-4 lg:h-full lg:min-h-0 lg:overflow-hidden lg:py-3">
          <StudioClient />
        </Container>
      </main>
      <div className="lg:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
