import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  InformationCircleIcon,
  LibraryIcon,
} from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { AuthButtons } from "@/components/auth/auth-buttons";

export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <Container className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">
          <Logo />
        </div>
        <nav aria-label="Primary" className="flex items-center gap-1 justify-self-center">
          <ButtonLink href="/#about" variant="ghost" size="sm">
            <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
            About
          </ButtonLink>
          <ButtonLink href="/library" variant="ghost" size="sm">
            <HugeiconsIcon icon={LibraryIcon} className="h-4 w-4" />
            Library
          </ButtonLink>
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <AuthButtons compact />
          {actions ?? (
            <ButtonLink href="/upload" variant="primary" size="sm">
              <span className="hidden min-[420px]:inline">Create a magazine</span>
              <span className="min-[420px]:hidden">Create</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4" strokeWidth={2} />
            </ButtonLink>
          )}
        </div>
      </Container>
    </header>
  );
}
