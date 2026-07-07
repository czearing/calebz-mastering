"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { payerSchema, type PayerInput } from "./payerSchema";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type DetailsStepProps = {
  // Held by the flow and persisted, so stepping back or reloading keeps it.
  payer: PayerInput;
  onPayerChange: (payer: PayerInput) => void;
  onBack?: () => void;
  onNext: () => void;
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

// Contact details on their own, before the upload, who you are comes first, so
// the heavy step (sending files) stands alone. Just two fields; the order recap
// stays on Review and the total reappears at Pay. Continue is blocked until both
// are valid. See plan/32.
export function DetailsStep({ payer, onPayerChange, onBack, onNext }: DetailsStepProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof PayerInput, boolean>>>(
    {},
  );
  const errors = fieldErrors(payer);
  const valid = Object.keys(errors).length === 0;
  const set = (patch: Partial<PayerInput>) => onPayerChange({ ...payer, ...patch });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onNext();
        else setTouched({ name: true, email: true });
      }}
      className="flex flex-col gap-[var(--space-6)]"
    >
      <StepHeader
        title="Your details"
        hint="So I can deliver your master and reach you about the work."
      />

      <Field
        label="Name"
        autoComplete="name"
        value={payer.name}
        onChange={(e) => set({ name: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        error={touched.name ? errors.name : undefined}
      />
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        value={payer.email}
        onChange={(e) => set({ email: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={touched.email ? errors.email : undefined}
      />

      <StepNav onBack={onBack}>
        <Button type="submit" disabled={!valid}>
          Continue
        </Button>
      </StepNav>
    </form>
  );
}
