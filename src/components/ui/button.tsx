import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft focus-visible:outline-ink border border-ink",
  secondary:
    "bg-transparent text-ink hover:bg-ink/5 border border-line focus-visible:outline-ink",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-ink/5 border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-[52px] px-8 text-[15px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps & { href: string };

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em]",
    "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: LinkProps) {
  // Internal routes use next/link for prefetching; external anchors fall back.
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes(variant, size, className)} {...props} />
    );
  }
  return <a href={href} className={classes(variant, size, className)} {...props} />;
}
