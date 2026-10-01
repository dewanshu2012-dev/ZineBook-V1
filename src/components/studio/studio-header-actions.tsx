"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { LibraryIcon } from "@hugeicons/core-free-icons";
import { ButtonLink } from "@/components/ui/button";
import { PublishMenu } from "@/components/studio/publish-menu";

/** Studio header actions: replaces the default Create CTA on /studio. */
export function StudioHeaderActions() {
  return (
    <>
      <ButtonLink href="/library" variant="ghost" size="sm">
        <HugeiconsIcon icon={LibraryIcon} className="h-4 w-4" />
        Library
      </ButtonLink>
      <ButtonLink href="/read" variant="secondary" size="sm">
        Read
      </ButtonLink>
      <PublishMenu />
    </>
  );
}
