"use client";

import { ButtonLink } from "@/components/ui/button";
import { PublishMenu } from "@/components/studio/publish-menu";

/** Studio header actions: replaces the default Create CTA on /studio. */
export function StudioHeaderActions() {
  return (
    <>
      <ButtonLink href="/read" variant="secondary" size="sm">
        Read
      </ButtonLink>
      <PublishMenu />
    </>
  );
}
