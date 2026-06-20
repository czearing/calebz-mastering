"use client";

import { useEffect, useRef } from "react";
import type { ProcessStep } from "@/content/types";

export type ProcessFlowProps = {
  steps: ProcessStep[];
};

// "How it works" as a signal travelling down the mastering chain. The rail, the
// dots, and the playhead are ALL direct children of the list, positioned at the
// left edge, so they share one horizontal reference and line up exactly. Each
// dot sits at the measured vertical centre of its step number. A cyan playhead
// rides at the reading line and moves as you scroll, filling the rail behind it
// and lighting each dot as it passes. Reduced motion pins it fully drawn. No
// glow. See plan/07 and the site-wide scroll-equals-playhead thread.
export function ProcessFlow({ steps }: ProcessFlowProps) {
  const olRef = useRef<HTMLOListElement | null>(null);
  const dimRef = useRef<HTMLSpanElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const headRef = useRef<HTMLSpanElement | null>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const nums = useRef<(HTMLSpanElement | null)[]>([]);
  const texts = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let centers: number[] = [];

    // Each dot's target Y is the vertical centre of its step number, in the
    // list's own layout space (stable under page scroll).
    const measure = () => {
      const olTop = ol.getBoundingClientRect().top;
      centers = nums.current.map((num) => {
        if (!num) return 0;
        const r = num.getBoundingClientRect();
        return r.top - olTop + r.height / 2;
      });
      const first = centers[0] ?? 0;
      const last = centers[centers.length - 1] ?? 0;
      for (const el of [dimRef.current, fillRef.current]) {
        if (el) {
          el.style.top = `${first}px`;
          el.style.height = `${Math.max(0, last - first)}px`;
        }
      }
      dots.current.forEach((d, i) => {
        if (d) d.style.top = `${centers[i] ?? 0}px`;
      });
    };

    const fade = 28;
    const update = () => {
      raf = 0;
      const olRect = ol.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const first = centers[0] ?? 0;
      const last = centers[centers.length - 1] ?? 0;
      // The playhead is whatever point of the list is at the exact vertical
      // centre of the viewport, so while scrolling it stays pixel-centred.
      let head = vh / 2 - olRect.top;
      head = Math.max(first, Math.min(last, head));
      if (reduced) head = last;

      const span = last - first || 1;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${(head - first) / span})`;
      }
      if (headRef.current) {
        headRef.current.style.top = `${head}px`;
        headRef.current.style.opacity = reduced || head > first + 0.5 ? "1" : "0";
      }
      centers.forEach((c, i) => {
        const lit = reduced ? 1 : Math.max(0, Math.min(1, (head - (c - fade)) / fade));
        const dot = dots.current[i];
        const num = nums.current[i];
        const txt = texts.current[i];
        if (dot) {
          dot.style.transform = `translate(-50%, -50%) scale(${0.7 + lit * 0.4})`;
          dot.style.backgroundColor = lit > 0.5 ? "var(--cyan)" : "var(--bg)";
          dot.style.borderColor = lit > 0.5 ? "var(--cyan)" : "var(--line)";
        }
        if (num) num.style.opacity = `${0.28 + lit * 0.72}`;
        if (txt) txt.style.opacity = `${0.5 + lit * 0.5}`;
      });
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [steps.length]);

  return (
    <ol ref={olRef} className="relative ml-[var(--space-3)] flex flex-col gap-[var(--space-9)]">
      <span
        ref={dimRef}
        aria-hidden
        className="absolute left-0 w-[2px] -translate-x-1/2 rounded-full bg-line"
        style={{ top: 0, height: 0 }}
      />
      <span
        ref={fillRef}
        aria-hidden
        className="absolute left-0 w-[2px] -translate-x-1/2 origin-top rounded-full bg-cyan"
        style={{ top: 0, height: 0, transform: "scaleY(0)" }}
      />
      {steps.map((s, i) => (
        <span
          key={`dot-${s.id}`}
          ref={(el) => {
            dots.current[i] = el;
          }}
          aria-hidden
          className="absolute left-0 z-[1] h-[12px] w-[12px] rounded-full border border-line bg-bg"
          style={{ top: 0, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <span
        ref={headRef}
        aria-hidden
        className="absolute left-0 z-10 h-[11px] w-[11px] rounded-full bg-cyan"
        style={{ top: 0, transform: "translate(-50%, -50%)", opacity: 0 }}
      />

      {steps.map((s, i) => (
        <li key={s.id} className="relative flex items-start gap-[var(--space-5)] pl-[var(--space-6)]">
          <span
            ref={(el) => {
              nums.current[i] = el;
            }}
            className="font-mono text-[1.75rem] leading-none tabular-nums text-cyan"
          >
            {String(s.step).padStart(2, "0")}
          </span>
          <p
            ref={(el) => {
              texts.current[i] = el;
            }}
            className="max-w-[var(--max-reading)] pt-[0.35rem] text-body text-text"
          >
            {s.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
