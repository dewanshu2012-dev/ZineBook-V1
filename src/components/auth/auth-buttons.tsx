"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon, Logout01Icon } from "@hugeicons/core-free-icons";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] text-muted">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("google")}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-line bg-transparent px-4 text-[13px] font-medium text-ink transition-colors duration-200 hover:bg-ink/5"
      >
        <HugeiconsIcon icon={GoogleIcon} className="h-4 w-4" />
        {compact ? "Sign in" : "Sign in with Google"}
      </button>
    );
  }

  const name = session.user.name?.split(" ")[0] ?? "Account";
  return (
    <span className="inline-flex items-center gap-2">
      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt=""
          className="h-8 w-8 rounded-full border border-line object-cover"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <span className="hidden max-w-24 truncate text-[13px] font-medium text-ink sm:inline">
        {name}
      </span>
      <button
        type="button"
        title="Sign out"
        onClick={() => signOut()}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-line bg-transparent px-3 text-[13px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink hover:bg-ink/5"
      >
        <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
        <span className="hidden min-[420px]:inline">Sign out</span>
      </button>
    </span>
  );
}
