import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type TagProps = HTMLAttributes<HTMLSpanElement>;

// Mono label chip for tags, meta, and technical numbers.
const base =
  "inline-flex items-center rounded-[var(--radius-sm)] border border-line " +
  "px-[var(--space-3)] py-[var(--space-1)] text-label font-mono uppercase " +
  "text-muted";

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  function Tag({ className, ...rest }, ref) {
    return <span ref={ref} className={cn(base, className)} {...rest} />;
  },
);
