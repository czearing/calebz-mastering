import { cn } from "@/lib/cn";

export type HeroActionsProps = {
  // Label for the dominant primary action (content.hero.primaryAction).
  primaryAction: string;
  // Anchor target for the paid path. "Start a master" and Services are one
  // destination: the console at #services. See plan/30 C.
  servicesHref?: string;
};

// The one dominant CTA above the fold (plan/15). The play affordance lives
// inside the ABPlayer, so this stays a single, low-commitment intent that
// carries the artist to the order console. A real anchor, not a scripted
// button, so it scrolls with no JS and is keyboard and screen-reader reachable
// by default. Styling mirrors the primary Button variant using tokens only.
const cta =
  "inline-flex items-center justify-center gap-2 self-start " +
  "rounded-[var(--radius-sm)] bg-cyan px-5 py-3 text-bg " +
  "text-label font-mono uppercase tracking-[0.06em] transition-colors " +
  "hover:bg-cyan-dim hover:text-text";

export function HeroActions({
  primaryAction,
  servicesHref = "#services",
}: HeroActionsProps) {
  return (
    <a href={servicesHref} className={cn(cta)}>
      {primaryAction}
    </a>
  );
}
