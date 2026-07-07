"use client";

import { Button, Field } from "@/components/ui";
import type { PayerInput } from "./payerSchema";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type NotesStepProps = {
  // Held by the flow and persisted, so stepping back or reloading keeps it.
  payer: PayerInput;
  onPayerChange: (payer: PayerInput) => void;
  onBack: () => void;
  onNext: () => void;
};

// A dedicated page for the optional brief, right before payment. Nothing to
// validate, so Continue is never blocked. The text rides on the lifted payer and
// reaches CalebZ as contact.notes with the order. See plan/32.
export function NotesStep({ payer, onPayerChange, onBack, onNext }: NotesStepProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="flex flex-col gap-[var(--space-6)]"
    >
      <StepHeader title="Anything else?" hint="Optional. Add a note, or skip it." />

      <Field
        as="textarea"
        rows={6}
        label="Notes"
        placeholder="Reference track, deadline, how loud you want it."
        value={payer.notes ?? ""}
        onChange={(e) => onPayerChange({ ...payer, notes: e.target.value })}
      />

      <StepNav onBack={onBack}>
        <Button type="submit">Continue to payment</Button>
      </StepNav>
    </form>
  );
}
