"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { nav as defaultNav } from "@/content";
import type { NavLink } from "@/content";

export type MobileBookBarProps = {
  // The persistent Book affordance (label and #contact target) from content.
  book?: NavLink;
  // Sections that own the bottom of the screen while in view; the bar steps
  // aside for any of them (the contact form, and the Services console which
  // pins its own live-total checkout bar). Defaults to just the contact form.
  watchIds?: string[];
};

// Non-negotiable persistent CTA (plan/13): a thumb-reachable Book button pinned
// to the bottom on mobile only. It clears the iOS home indicator via the
// safe-area inset, and steps out of the way once the contact section is on
// screen so it never covers the form. Hidden from md up where the header CTA
// already sits in reach. A real anchor, keyboard reachable, with a global
// focus ring; the transition respects prefers-reduced-motion.
export function MobileBookBar({
  book = defaultNav.book,
  watchIds = ["contact"],
}: MobileBookBarProps) {
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const targets = watchIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (targets.length === 0) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setAtContact(visible.size > 0);
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [watchIds]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 px-[var(--space-4)] pt-[var(--space-3)] md:hidden",
        "pb-[calc(var(--space-3)+env(safe-area-inset-bottom))]",
        "border-t border-line bg-bg/90 backdrop-blur transition-opacity",
        atContact
          ? "pointer-events-none opacity-0"
          : "pointer-events-auto opacity-100",
      )}
      aria-hidden={atContact}
    >
      <a
        href={book.href}
        tabIndex={atContact ? -1 : undefined}
        className={cn(
          "flex min-h-[var(--space-7)] items-center justify-center",
          "rounded-[var(--radius-sm)] bg-cyan px-[var(--space-5)]",
          "text-label font-mono uppercase tracking-[0.06em] text-bg",
          "transition-colors hover:bg-cyan-dim hover:text-text",
        )}
      >
        {book.label}
      </a>
    </div>
  );
}
