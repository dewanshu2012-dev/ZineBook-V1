import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="bg-paper">
      <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            A digital publishing studio that turns PDFs, JPGs and PNGs into
            true 1:1 magazines and books — with covers, paper textures and
            natural page turns.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/#about" className="transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/upload" className="transition-colors hover:text-ink">
            Create
          </Link>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:flex-row sm:justify-between">
          <span>ZineBook — Set in Fraunces & Inter</span>
          <span>Milestone 1 / Foundation</span>
        </Container>
      </div>
    </footer>
  );
}
