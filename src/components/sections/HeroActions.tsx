"use client";

import { track } from "@vercel/analytics";
import { cn } from "@/lib/cn";

export type HeroActionsProps = {
  // Label for the dominant primary action (content.hero.primaryAction).
  primaryAction: string;
  // Anchor target for the primary path.
  servicesHref?: string;
};

// The one dominant CTA above the fold.
const cta =
  "inline-flex items-center justify-center gap-2 self-start " +
  "rounded-[var(--radius-sm)] bg-cyan px-5 py-3 text-bg " +
  "text-label font-mono uppercase tracking-[0.06em] transition-colors " +
  "hover:bg-cyan-dim hover:text-text";

export function HeroActions({
  primaryAction,
  servicesHref = "#work",
}: HeroActionsProps) {
  return (
    <a
      href={servicesHref}
      className={cn(cta)}
      onClick={() => track("Work CTA Click")}
    >
      {primaryAction}
    </a>
  );
}
