"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  cartHasAddon,
  formatUsd,
  type Cart,
  type ReviewSummary,
} from "@/lib/checkout";
import { Dropzone } from "./Dropzone";
import type { UploadItem } from "./useUpload";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type UploadStepProps = {
  cart: Cart;
  // The order recap, so the total stays visible while sending tracks.
  summary: ReviewSummary;
  totalCents: number;
  // First-master-free mode: the recap reads "Free" instead of the price.
  free?: boolean;
  // The order id the upload keys against. Real flow gets it from the pending
  // draft order; the demo passes a stable placeholder.
  orderId: string;
  // The lifted upload list and handlers, owned by the flow so the files survive
  // stepping back to this step. See plan/32.
  items: UploadItem[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
  onBack: () => void;
  // Called once at least one file is in. Name and email were collected on the
  // previous step, so this step is only about the tracks.
  onContinue: () => void;
};

// Send your tracks. Upload-first: the customer hands over their material here,
// before paying, and after entering their details. The dropzone analyses each
// file and shows how many of the ordered tracks have been added; Continue is
// blocked until at least one file is in. See plan/32.
export function UploadStep({
  cart,
  summary,
  totalCents,
  free = false,
  orderId,
  items,
  onAddFiles,
  onRemoveFile,
  onRenameFile,
  onBack,
  onContinue,
}: UploadStepProps) {
  const needsStems = cartHasAddon(cart, "stems");
  const fileCount = items.length;
  const ready = fileCount > 0;
  const tracksWord = summary.trackCount === 1 ? "track" : "tracks";
  // A flat order should have a file per track. Fewer is the confusing case the
  // customer flagged, so name it and offer the fix, without hard-blocking (a
  // legitimate order can bundle extra files).
  const shortByTracks =
    !needsStems && fileCount > 0 && fileCount < summary.trackCount;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onContinue();
      }}
      className="flex flex-col gap-[var(--space-6)]"
    >
      <StepHeader
        title="Send your tracks"
        hint="No charge yet. You pay at the end, once your tracks are in."
      />

      {/* Order recap, so the total stays in view while sending files. */}
      <p className="flex items-baseline justify-between border-b border-line pb-[var(--space-3)] font-mono text-label uppercase tracking-[0.06em] text-muted">
        <span>
          {summary.tier}, {summary.trackCount} {tracksWord}
        </span>
        <span
          className={cn(
            "text-body normal-case tracking-normal",
            free ? "text-cyan" : "text-text",
          )}
        >
          {free ? "Free" : formatUsd(totalCents)}
        </span>
      </p>

      <div className="flex flex-col gap-[var(--space-3)]">
        <Dropzone
          orderId={orderId}
          needsStems={needsStems}
          expected={summary.trackCount}
          items={items}
          onAdd={onAddFiles}
          onRemove={onRemoveFile}
          onRename={onRenameFile}
        />
        {shortByTracks ? (
          <p className="text-label font-mono text-text">
            That is fewer files than the {summary.trackCount} tracks you ordered.
            Add the rest, or change the track count back on the previous step.
          </p>
        ) : null}
      </div>

      <StepNav onBack={onBack}>
        <Button type="submit" disabled={!ready}>
          Continue
        </Button>
      </StepNav>
    </form>
  );
}
