"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LoudnessProof } from "./LoudnessProof";
import type { ABPlayerProps } from "./ABPlayer";

// Audio is a dynamic import, loaded after first paint (plan/11). The interactive
// A/B transport (engine, scrubber, toggle) is code-split out of the first
// bundle. ssr:false keeps the audio code off the server too.
const ABPlayer = dynamic(() => import("./ABPlayer").then((m) => m.ABPlayer), {
  ssr: false,
  loading: () => null,
});

// The static frame shown before the transport hydrates: the same sound-off
// proof the full player carries (plan/13), so the case reads immediately with
// no layout shift and no interactivity.
function Fallback({ before, after, title }: ABPlayerProps) {
  return (
    <section
      aria-label={title ?? "Hear the difference"}
      className="flex flex-col gap-5 rounded-[var(--radius-md)] border border-line bg-surface p-5"
    >
      <LoudnessProof
        beforePeaks={before.peaks}
        afterPeaks={after.peaks}
        beforeLoudness={before.loudness}
        afterLoudness={after.loudness}
      />
    </section>
  );
}

// Paints the static proof on the server and first client frame, then swaps in
// the full interactive player once mounted and its chunk has loaded. Same props
// as ABPlayer, so callers stay unchanged. The page reads fully without the
// transport: the proof is always present.
export function ABPlayerLazy(props: ABPlayerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Fallback {...props} />;
  return <ABPlayer {...props} />;
}
