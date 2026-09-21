import { BookOpenText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="ZineBook home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-paper">
        <BookOpenText className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>
      <span className="font-display text-[19px] font-semibold tracking-[-0.01em]">
        ZineBook
      </span>
    </Link>
  );
}
