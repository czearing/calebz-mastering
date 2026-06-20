"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RevealProps = {
  children: ReactNode;
  className?: string;
  // Stagger index. Each step adds delayStep seconds before the enter.
  index?: number;
  delayStep?: number;
  as?: "div" | "li" | "span";
};

// Signature easing for the whole site. One curve, see plan/05-motion-and-3d.
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION_MS = 700;

// Enter on scroll, once. A tiny IntersectionObserver flips a class; the move is
// pure CSS transition, so the first-load bundle ships no animation library
// (plan/11). Reduced motion drops to an opacity-only fade with no transform via
// the prefers-reduced-motion guard. SSR safe: starts visible-hidden, only the
// observer runs in an effect; if IO is unavailable the content shows at once.
export function Reveal({
  children,
  className,
  index = 0,
  delayStep = 0.075,
  as = "div",
}: RevealProps) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delay = index * delayStep;
  const hidden = !shown;

  // One ref type for the three possible tags; the callback narrows on assign.
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };

  return (
    <Tag
      ref={setRef}
      className={cn(className)}
      style={{
        opacity: hidden ? 0 : 1,
        transform: reduced || !hidden ? "none" : "translateY(24px)",
        transition: `opacity ${DURATION_MS}ms ${EASE} ${delay}s, transform ${DURATION_MS}ms ${EASE} ${delay}s`,
        willChange: hidden ? "opacity, transform" : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
