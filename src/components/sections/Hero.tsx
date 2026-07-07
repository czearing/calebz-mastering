"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { audioPlayingStore } from "@/lib/audioReactive";
import { Reveal, ScrollCue } from "@/components/ui";
import { MotifFallback } from "@/components/three/MotifFallback";
import { hero as defaultHero } from "@/content";
import type { Hero as HeroContent } from "@/content";
import { HeroActions } from "./HeroActions";

// The motif is decorative and optional. Dynamic-import after first paint so it
// never blocks the hero text or the player, ssr:false so it costs nothing on
// the server, and a CSS-only fallback frame holds its place meanwhile.
const MotifCanvas = dynamic(
  () => import("@/components/three/MotifCanvas").then((m) => m.MotifCanvas),
  { ssr: false, loading: () => <MotifFallback /> },
);

export type HeroProps = {
  content?: HeroContent;
};

// The signature (plan/23). The first viewport is the statement alone, centered,
// owning the full screen so it breathes. The founder note lives in its own About
// section (plan/25), and the before/after proof lives in the Work section, so
// the hero stays the statement alone. The page reads fully without audio or
// WebGL: the text stands on its own.
export function Hero({ content = defaultHero }: HeroProps) {
  // The scroll-driven terrain dims while a track plays so it does not fight the
  // full-bleed audio field (plan/28). The terrain never reacts to audio itself.
  const audioPlaying = useSyncExternalStore(
    audioPlayingStore.subscribe,
    audioPlayingStore.getSnapshot,
    audioPlayingStore.getServerSnapshot,
  );
  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative w-full overflow-hidden px-[var(--space-5)]"
    >
      {/* Decorative motif, behind everything, never focusable or announced. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ease-out"
        style={{ opacity: audioPlaying ? 0.24 : 0.6 }}
      >
        <MotifCanvas />
      </div>

      {/* First viewport: the statement owns the screen, vertically centered. */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[var(--max-content)] flex-col justify-center">
        <Reveal className="flex flex-col gap-[var(--space-5)]">
          <p className="text-label font-mono uppercase tracking-[0.06em] text-cyan">
            {content.eyebrow}
          </p>
          <h1 id="hero-headline" className="text-display font-sans text-text">
            {content.headline}
          </h1>
          <p className="max-w-[var(--max-reading)] text-body text-muted">
            {content.sub}
          </p>
          <HeroActions primaryAction={content.primaryAction} />
        </Reveal>

        {/* The master playhead at rest, anchored to the bottom of the first
            viewport. It retires on scroll and returns at the top (plan/24 A). */}
        <ScrollCue className="absolute inset-x-0 bottom-[var(--space-8)]" />
      </div>
    </section>
  );
}
