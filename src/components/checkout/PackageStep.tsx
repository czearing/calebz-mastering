"use client";

import { Button, Tag } from "@/components/ui";
import { formatUsd, pricePerTrackCents } from "@/lib/checkout";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type PackageStepProps = {
  trackCount: number;
  totalCents: number;
  onAddTrack: () => void;
  onRemoveLast: () => void;
  onNext: () => void;
};

// What the count reads as, so EP and Album emerge from honest math rather
// than fixed tiers. See plan/29 section 1.
function readsAs(n: number): string {
  if (n <= 0) return "Add your first track";
  if (n <= 2) return "Single";
  if (n <= 5) return "EP";
  return "Album";
}

// Step 1, the quick path. The artist adds tracks and watches the per-track
// price update live; crossing a tier re-prices the whole release.
export function PackageStep({
  trackCount,
  totalCents,
  onAddTrack,
  onRemoveLast,
  onNext,
}: PackageStepProps) {
  const perTrack = pricePerTrackCents(trackCount);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader
        title="Pick your package"
        hint="Price is per track. EP and Album rates kick in as the count grows."
      />

      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-5)]">
        <div className="flex items-baseline justify-between gap-[var(--space-3)]">
          <span className="text-display font-sans text-text" aria-live="polite">
            {trackCount}
          </span>
          <Tag className="text-cyan">{readsAs(trackCount)}</Tag>
        </div>
        <p className="text-body text-muted" aria-live="polite">
          {perTrack > 0
            ? `${formatUsd(perTrack)} per track, ${formatUsd(totalCents)} total`
            : "From $65 per track. One WAV plus MP3, two revisions, standard turnaround included."}
        </p>
        <div className="flex items-center gap-[var(--space-3)]">
          <Button onClick={onAddTrack}>Add a track</Button>
          <Button
            variant="ghost"
            onClick={onRemoveLast}
            disabled={trackCount <= 0}
          >
            Remove one
          </Button>
        </div>
      </div>

      <StepNav onNext={onNext} nextDisabled={trackCount <= 0} />
    </div>
  );
}
