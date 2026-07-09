"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { audioPlayingStore } from "@/lib/audioReactive";
import { Reveal } from "@/components/ui";
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

// The first viewport places one clear statement inside a full-bleed terrain.
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700 ease-out"
        style={{ opacity: audioPlaying ? 0.2 : 1 }}
      >
        <MotifCanvas />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(circle_at_72%_55%,transparent_0%,transparent_22%,var(--bg)_78%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 -z-[4] bg-[linear-gradient(90deg,var(--bg)_0%,color-mix(in_srgb,var(--bg)_92%,transparent)_40%,transparent_78%)]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[var(--max-content)] flex-col justify-center pb-24 pt-[calc(var(--header-h)+var(--space-7))]">
        <Reveal className="relative z-10 flex max-w-[47rem] flex-col items-start gap-5">
          <p className="font-mono text-label uppercase tracking-[0.16em] text-cyan">
            {content.eyebrow}
          </p>
          <h1
            id="hero-headline"
            aria-label={content.headline}
            className="font-sans text-[clamp(4.25rem,12vw,9.5rem)] font-medium leading-[0.8] tracking-[-0.07em] text-text"
          >
            <span className="block">Hear the</span>
            <span className="block text-cyan">difference.</span>
          </h1>
          <p className="max-w-[32rem] text-body text-muted">{content.sub}</p>
          <HeroActions primaryAction={content.primaryAction} />
        </Reveal>

        <div className="pointer-events-none absolute inset-x-0 bottom-[var(--space-8)] flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Raw
          </span>
          <span className="relative h-px flex-1 bg-line">
            <span className="absolute left-[62%] top-1/2 h-5 w-px -translate-y-1/2 bg-cyan" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
            Master
          </span>
        </div>
      </div>
    </section>
  );
}
