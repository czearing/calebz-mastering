"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { audioPlayingStore } from "@/lib/audioReactive";
import { Reveal, ScrollCue } from "@/components/ui";
import { ABPlayerLazy } from "@/components/audio/ABPlayerLazy";
import type { AudioSource } from "@/components/audio/types";
import { MotifFallback } from "@/components/three/MotifFallback";
import { hero as defaultHero, toAudioSource } from "@/content";
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
  // The signature A/B sources. Default to the pair authored on content.hero
  // (placeholder demo files today); a caller may override with real sources.
  before?: AudioSource;
  after?: AudioSource;
};

// The signature (plan/23). The first viewport is the statement alone, centered,
// owning the full screen so it breathes. The before/after proof follows just
// below on the first scroll. The founder note now lives in its own About
// section (plan/25), so the hero stays the statement plus the A/B proof. The
// page reads fully without audio or WebGL: text and proof numbers stand alone.
export function Hero({
  content = defaultHero,
  before = toAudioSource(content.audio.before),
  after = toAudioSource(content.audio.after),
}: HeroProps) {
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

      {/* The proof, below the first fold, with room to breathe. */}
      <div className="mx-auto flex w-full max-w-[var(--max-content)] flex-col gap-[var(--space-9)] pb-[var(--space-12)] pt-[var(--space-10)]">
        <Reveal>
          <p className="mb-[var(--space-3)] text-label font-mono uppercase tracking-[0.06em] text-muted">
            {content.playPrompt}
          </p>
          <ABPlayerLazy
            before={before}
            after={after}
            title={`${content.beforeLabel} and ${content.afterLabel}`}
            playLabel={`Play, ${content.beforeLabel} and ${content.afterLabel}`}
          />
        </Reveal>
      </div>
    </section>
  );
}
