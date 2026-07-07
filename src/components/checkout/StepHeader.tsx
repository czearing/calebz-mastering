export type StepHeaderProps = {
  title: string;
  hint?: string;
};

// The title row a step shows: its name and an optional one-line hint. Position
// in the flow is shown once, above all steps, by the horizontal CheckoutSteps
// bar, so there is no "Step N of M" counter repeated here. See plan/32.
export function StepHeader({ title, hint }: StepHeaderProps) {
  return (
    <header className="flex flex-col gap-[var(--space-2)]">
      <h1 className="text-h2 font-sans text-text">{title}</h1>
      {hint ? <p className="text-body text-muted">{hint}</p> : null}
    </header>
  );
}
