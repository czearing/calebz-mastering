"use client";

import { Button, Field } from "@/components/ui";
import { type Cart } from "@/lib/checkout";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type TracksStepProps = {
  cart: Cart;
  index: number;
  count: number;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddTrack: () => void;
  onBack: () => void;
  onNext: () => void;
};

// Step 3. Name each track (metadata only, no file upload here) and add or
// remove tracks. Titles are optional; a blank reads as its 1-based position
// ("Track 1") in the review. See plan/29 section 2, plan/30 B.
export function TracksStep({
  cart,
  index,
  count,
  onRename,
  onRemove,
  onAddTrack,
  onBack,
  onNext,
}: TracksStepProps) {
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader
        index={index}
        count={count}
        title="Your tracks"
        hint="Name each one. Files come after payment."
      />

      <ul className="flex flex-col gap-[var(--space-4)]">
        {cart.tracks.map((track, i) => (
          <li key={track.id} className="flex items-end gap-[var(--space-3)]">
            <Field
              className="flex-1"
              label={`Track ${i + 1}`}
              placeholder="Working title"
              value={track.title}
              onChange={(e) => onRename(track.id, e.target.value)}
            />
            <Button
              variant="ghost"
              className="min-h-[44px]"
              aria-label={`Remove track ${i + 1}`}
              onClick={() => onRemove(track.id)}
            >
              Remove
            </Button>
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
