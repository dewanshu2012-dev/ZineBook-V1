import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

const links = [
  { label: "Craft", href: "#craft" },
  { label: "Materials", href: "#materials" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="flex h-[68px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="#craft" variant="ghost" size="sm" className="hidden sm:inline-flex">
            View example
          </ButtonLink>
          <ButtonLink href="/upload" variant="primary" size="sm">
            <span className="hidden min-[420px]:inline">Create a magazine</span>
            <span className="min-[420px]:hidden">Create</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" strokeWidth={2} />
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
