"use client";

import { Button, Field } from "@/components/ui";
import { type Cart } from "@/lib/checkout";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type TracksStepProps = {
  cart: Cart;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddTrack: () => void;
  onBack: () => void;
  onNext: () => void;
};

// Name each track (metadata only, no file upload here) and add or remove tracks.
// Titles are optional; a blank reads as its 1-based position ("Track 1") in the
// review. Remove is a quiet icon so the row stays calm. See plan/29 s2, plan/30.
export function TracksStep({
  cart,
  onRename,
  onRemove,
  onAddTrack,
  onBack,
  onNext,
}: TracksStepProps) {
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader title="Your tracks" hint="Name each one. Files come after payment." />

      <ul className="flex flex-col gap-[var(--space-3)]">
        {cart.tracks.map((track, i) => (
          <li key={track.id} className="flex items-end gap-[var(--space-2)]">
            <Field
              className="flex-1"
              label={`Track ${i + 1}`}
              placeholder="Working title"
              value={track.title}
              onChange={(e) => onRename(track.id, e.target.value)}
            />
            <button
              type="button"
              aria-label={`Remove track ${i + 1}`}
              onClick={() => onRemove(track.id)}
              className="mb-[2px] flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-muted transition-colors hover:text-error"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" className="self-start" onClick={onAddTrack}>
        Add another track
      </Button>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={cart.tracks.length <= 0} />
    </div>
  );
}
