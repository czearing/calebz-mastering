"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type CheckoutCTAProps = {
  href: string;
  label?: string;
  quote?: boolean;
};

const MAGNET_RADIUS = 120;
const MAGNET_MAX = 6;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

// The only filled, glowing cyan control in the section. A real link that
// carries the configured order into /start via its href. On pointer-move within
// 120px the button eases up to 6px toward the cursor (transform only); reduced
// motion disables the follow and leaves it static. The glow scales with
// --audio-energy but stays cyan-on-dark, never touching text contrast.
export function CheckoutCTA({ href, label, quote }: CheckoutCTAProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const text = label ?? (quote ? "Continue to a quote" : "Continue to checkout");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    function onMove(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > MAGNET_RADIUS) {
        setOffset({ x: 0, y: 0 });
        return;
      }
      const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_MAX;
      setOffset({
        x: (dx / (dist || 1)) * pull,
        y: (dy / (dist || 1)) * pull,
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)]",
        "bg-cyan px-5 py-4 text-label font-mono uppercase tracking-[0.06em] text-bg",
        "transition-[transform,box-shadow,background-color] duration-150 ease-out",
        "hover:bg-cyan-dim hover:text-text",
        "[box-shadow:0_0_calc(16px+var(--audio-energy,0)*28px)_rgba(0,229,255,calc(0.25+var(--audio-energy,0)*0.4))]",
      )}
    >
      {text}
      <span aria-hidden="true">{">"}</span>
    </Link>
  );
}
