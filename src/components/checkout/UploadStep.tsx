"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import {
  cartHasAddon,
  formatUsd,
  type Cart,
  type ReviewSummary,
} from "@/lib/checkout";
import { Dropzone } from "./Dropzone";
import { payerSchema, type PayerInput } from "./payerSchema";
import type { UploadItem } from "./useUpload";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type UploadStepProps = {
  cart: Cart;
  // The order recap, so the total stays visible while sending tracks.
  summary: ReviewSummary;
  totalCents: number;
  index: number;
  count: number;
  // The order id the upload keys against. Real flow gets it from the pending
  // draft order; the demo passes a stable placeholder.
  orderId: string;
  // Payer is held by the flow (and persisted), so stepping back here or
  // reloading does not wipe what was typed. Controlled, not a local form.
  payer: PayerInput;
  onPayerChange: (payer: PayerInput) => void;
  // The lifted upload list and handlers, owned by the flow so the files survive
  // stepping back to this step. See plan/32.
  items: UploadItem[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onBack: () => void;
  // Called with the payer once name, email, and at least one file are in. The
  // pay step receives this as a prop, no re-entry.
  onContinue: (payer: PayerInput) => void;
};

// Maps a zod issue list onto per-field messages for inline display.
function fieldErrors(payer: PayerInput): Partial<Record<keyof PayerInput, string>> {
  const r = payerSchema.safeParse(payer);
  if (r.success) return {};
  const out: Partial<Record<keyof PayerInput, string>> = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as keyof PayerInput;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// Step 2 of the seeded flow: Send your tracks. Upload-first: the customer hands
// over their material here, before paying. Name, email, and the files are all
// held by the flow, so going back or reloading keeps them. Continue is blocked
// until name, email, and at least one file are in, so the step keeps its promise
// ("once your tracks are in"). The dropzone shows how many of the ordered tracks
// have been added, and a soft note flags a flat order with fewer files than
// tracks. A stem order gets stem-aware guidance. See plan/32.
export function UploadStep({
  cart,
  summary,
  totalCents,
  index,
  count,
  orderId,
  payer,
  onPayerChange,
  items,
  onAddFiles,
  onRemoveFile,
  onBack,
  onContinue,
}: UploadStepProps) {
  const needsStems = cartHasAddon(cart, "stems");
  const [touched, setTouched] = useState<Partial<Record<keyof PayerInput, boolean>>>(
    {},
  );
  const errors = fieldErrors(payer);
  const valid = Object.keys(errors).length === 0;
  const fileCount = items.length;
  const ready = valid && fileCount > 0;
  const tracksWord = summary.trackCount === 1 ? "track" : "tracks";
  const set = (patch: Partial<PayerInput>) =>
    onPayerChange({ ...payer, ...patch });
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
        if (ready) onContinue(payer);
        else setTouched({ name: true, email: true });
      }}
      className="flex flex-col gap-[var(--space-6)]"
    >
      <StepHeader
        index={index}
        count={count}
        title="Send your tracks"
        hint="No charge yet. You pay on the next step, once your tracks are in."
      />

      {/* Order recap, so the total stays in view while sending files. */}
      <p className="flex items-baseline justify-between border-b border-line pb-[var(--space-3)] font-mono text-label uppercase tracking-[0.06em] text-muted">
        <span>
          {summary.tier}, {summary.trackCount} {tracksWord}
        </span>
        <span className="text-body normal-case tracking-normal text-text">
          {formatUsd(totalCents)}
        </span>
      </p>

      <Field
        label="Name"
        value={payer.name}
        onChange={(e) => set({ name: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={touched.name ? errors.name : undefined}
      />
      <Field
        label="Email"
        type="email"
        value={payer.email}
        onChange={(e) => set({ email: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={touched.email ? errors.email : undefined}
      />

      <section className="flex flex-col gap-[var(--space-3)]">
        <h2 className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          Upload your {summary.trackCount} {tracksWord}
        </h2>
        <Dropzone
          orderId={orderId}
          needsStems={needsStems}
          expected={summary.trackCount}
          items={items}
          onAdd={onAddFiles}
          onRemove={onRemoveFile}
        />
        {fileCount === 0 ? (
          <p className="text-label font-mono text-muted">
            Add at least one file to continue.
          </p>
        ) : null}
        {shortByTracks ? (
          <p className="text-label font-mono text-text">
            That is fewer files than the {summary.trackCount} tracks you ordered.
            Add the rest, or change the track count back on the previous step.
          </p>
        ) : null}
      </section>

      <StepNav onBack={onBack}>
        <Button type="submit" disabled={!ready}>
          Continue to payment
        </Button>
      </StepNav>
    </form>
  );
}
